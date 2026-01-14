/**
 * Autonomous Financial Research Agent Orchestrator
 * Inspired by virattt/dexter
 *
 * Implements a 5-phase workflow:
 * 1. Understand - Extract intent and entities
 * 2. Plan - Create task breakdown
 * 3. Execute - Run tasks with tools
 * 4. Reflect - Evaluate completeness
 * 5. Answer - Generate final response
 */

import { generateText, generateObject, streamText } from 'ai'
import { z } from 'zod'
import type {
  AgentState,
  AgentConfig,
  AgentCallbacks,
  Understanding,
  Plan,
  Task,
  TaskResult,
  Reflection,
  ToolCall,
} from './types'
import { createInitialState } from './types'
import {
  UNDERSTAND_SYSTEM_PROMPT,
  UNDERSTAND_USER_PROMPT,
  PLAN_SYSTEM_PROMPT,
  PLAN_USER_PROMPT,
  TOOL_SELECTION_SYSTEM_PROMPT,
  TOOL_SELECTION_USER_PROMPT,
  EXECUTE_SYSTEM_PROMPT,
  EXECUTE_USER_PROMPT,
  REFLECT_SYSTEM_PROMPT,
  REFLECT_USER_PROMPT,
  ANSWER_SYSTEM_PROMPT,
  ANSWER_USER_PROMPT,
  formatTaskResults,
} from './prompts'

// Zod Schemas for structured outputs (like Dexter)
const EntitySchema = z.object({
  type: z.enum(['ticker', 'company', 'date', 'metric', 'period', 'other']),
  value: z.string(),
  normalized: z.string().optional(),
})

const UnderstandingSchema = z.object({
  intent: z.string().describe('Clear statement of what the user wants to know'),
  entities: z.array(EntitySchema).describe('Extracted entities from the query'),
  timeframe: z.string().nullable().describe('Time period mentioned'),
  complexity: z.enum(['simple', 'moderate', 'complex']).describe('Query complexity'),
})

const TaskSchema = z.object({
  id: z.string(),
  description: z.string().max(50).describe('Short task description (max 6 words)'),
  taskType: z.enum(['use_tools', 'reason']),
  dependsOn: z.array(z.string()),
})

const PlanSchema = z.object({
  summary: z.string().max(100).describe('Plan summary in under 15 words'),
  tasks: z.array(TaskSchema).min(1).max(5),
})

const ReflectionSchema = z.object({
  isComplete: z.boolean().describe('Whether we have enough data to answer'),
  reasoning: z.string().describe('Explanation of completeness or gaps'),
  missingInfo: z.array(z.string()).describe('List of missing information'),
  suggestedNextSteps: z.string().describe('Guidance for next iteration'),
})

const ToolSelectionSchema = z.array(z.object({
  toolName: z.string(),
  args: z.record(z.unknown()),
}))
import { financialTools } from '../tools'

type ModelProvider = Parameters<typeof generateText>[0]['model']

// Available models via Vercel AI Gateway
export const GATEWAY_MODELS = {
  // Best reasoning (expensive)
  'claude-sonnet-4': 'anthropic/claude-sonnet-4',
  'gpt-4o': 'openai/gpt-4o',
  'gpt-4-turbo': 'openai/gpt-4-turbo',

  // Good balance (recommended)
  'claude-3-5-sonnet': 'anthropic/claude-3-5-sonnet',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'llama-3.3-70b': 'meta/llama-3.3-70b',

  // Fast/cheap (for tool selection)
  'gpt-4o-mini-fast': 'openai/gpt-4o-mini',
  'llama-3.1-8b': 'meta/llama-3.1-8b-instruct',
  'gemini-flash': 'google/gemini-2.0-flash',
} as const

export type GatewayModelId = keyof typeof GATEWAY_MODELS

export class Agent {
  private model: ModelProvider
  private fastModel: ModelProvider // For tool selection (like Dexter uses gpt-5-mini)
  private maxIterations: number
  private callbacks?: AgentCallbacks
  private state: AgentState | null = null

  constructor(
    model: ModelProvider,
    config?: Partial<AgentConfig> & { fastModel?: ModelProvider }
  ) {
    this.model = model
    this.fastModel = config?.fastModel ?? model // Default to same model
    this.maxIterations = config?.maxIterations ?? 5
    this.callbacks = config?.callbacks
  }

  /**
   * Main entry point - runs the full agent workflow
   */
  async run(query: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<string> {
    this.state = createInitialState(query, conversationHistory)
    this.state.maxIterations = this.maxIterations

    try {
      // Phase 1: Understand
      await this.understandPhase()

      // Phases 2-4: Plan → Execute → Reflect loop
      while (this.state.iteration < this.maxIterations && this.state.currentPhase !== 'answer') {
        this.state.iteration++

        // Plan
        await this.planPhase()

        // Execute
        await this.executePhase()

        // Reflect
        const shouldContinue = await this.reflectPhase()
        if (!shouldContinue) {
          this.state.currentPhase = 'answer'
        }
      }

      // Phase 5: Answer
      const answer = await this.answerPhase()
      this.state.currentPhase = 'complete'
      this.state.finalAnswer = answer

      return answer
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Agent error'
      this.state.error = errorMsg
      this.callbacks?.onError?.(errorMsg)
      throw error
    }
  }

  /**
   * Stream the final answer (for real-time UI)
   */
  async *runStreaming(query: string, conversationHistory?: Array<{ role: string; content: string }>): AsyncGenerator<{ type: string; data: unknown }> {
    this.state = createInitialState(query, conversationHistory)
    this.state.maxIterations = this.maxIterations

    try {
      // Phase 1: Understand
      yield { type: 'phase', data: 'understand' }
      await this.understandPhase()
      yield { type: 'understanding', data: this.state.understanding }

      // Phases 2-4: Plan → Execute → Reflect loop
      while (this.state.iteration < this.maxIterations && this.state.currentPhase !== 'answer') {
        this.state.iteration++

        // Plan
        yield { type: 'phase', data: 'plan' }
        await this.planPhase()
        yield { type: 'plan', data: this.state.plan }

        // Execute
        yield { type: 'phase', data: 'execute' }
        for await (const event of this.executePhaseStreaming()) {
          yield event
        }

        // Reflect
        yield { type: 'phase', data: 'reflect' }
        const shouldContinue = await this.reflectPhase()
        yield { type: 'reflection', data: this.state.reflection }

        if (!shouldContinue) {
          this.state.currentPhase = 'answer'
        }
      }

      // Phase 5: Stream answer
      yield { type: 'phase', data: 'answer' }
      for await (const chunk of this.answerPhaseStreaming()) {
        yield { type: 'answer-chunk', data: chunk }
      }

      this.state.currentPhase = 'complete'
      yield { type: 'complete', data: null }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Agent error'
      yield { type: 'error', data: errorMsg }
    }
  }

  /**
   * Phase 1: Understand the query (uses structured output like Dexter)
   */
  private async understandPhase(): Promise<void> {
    this.state!.currentPhase = 'understand'
    this.callbacks?.onPhaseChange?.('understand')

    const historyContext = this.state!.conversationHistory
      ?.slice(-4)
      .map(m => `${m.role}: ${m.content}`)
      .join('\n')

    try {
      const { object } = await generateObject({
        model: this.model,
        schema: UnderstandingSchema,
        system: UNDERSTAND_SYSTEM_PROMPT,
        prompt: UNDERSTAND_USER_PROMPT(this.state!.query, historyContext),
      })

      this.state!.understanding = {
        ...object,
        timeframe: object.timeframe || undefined,
      } as Understanding
      this.callbacks?.onUnderstanding?.(this.state!.understanding)
    } catch (error) {
      // Fallback to text-based extraction
      const { text } = await generateText({
        model: this.model,
        system: UNDERSTAND_SYSTEM_PROMPT,
        prompt: UNDERSTAND_USER_PROMPT(this.state!.query, historyContext),
      })

      try {
        const understanding = JSON.parse(this.extractJSON(text)) as Understanding
        this.state!.understanding = understanding
        this.callbacks?.onUnderstanding?.(understanding)
      } catch {
        this.state!.understanding = {
          intent: this.state!.query,
          entities: [],
          complexity: 'simple',
        }
      }
    }
  }

  /**
   * Phase 2: Create execution plan (uses structured output like Dexter)
   */
  private async planPhase(): Promise<void> {
    this.state!.currentPhase = 'plan'
    this.callbacks?.onPhaseChange?.('plan')

    const previousResults = this.state!.taskResults.size > 0
      ? formatTaskResults(this.state!.taskResults)
      : undefined

    const reflectionGuidance = this.state!.reflection?.suggestedNextSteps

    try {
      const { object } = await generateObject({
        model: this.model,
        schema: PlanSchema,
        system: PLAN_SYSTEM_PROMPT,
        prompt: PLAN_USER_PROMPT(this.state!.understanding!, previousResults) +
          (reflectionGuidance ? `\n\nGuidance from previous iteration: ${reflectionGuidance}` : ''),
      })

      const plan: Plan = {
        summary: object.summary,
        tasks: object.tasks.map(t => ({
          ...t,
          taskType: t.taskType as 'use_tools' | 'reason',
          status: 'pending' as const,
        })),
      }
      this.state!.plan = plan
      this.callbacks?.onPlan?.(plan)
    } catch (error) {
      // Fallback to text-based
      const { text } = await generateText({
        model: this.model,
        system: PLAN_SYSTEM_PROMPT,
        prompt: PLAN_USER_PROMPT(this.state!.understanding!, previousResults),
      })

      try {
        const parsed = JSON.parse(this.extractJSON(text)) as Plan
        parsed.tasks = parsed.tasks.map(t => ({ ...t, status: 'pending' as const }))
        this.state!.plan = parsed
        this.callbacks?.onPlan?.(parsed)
      } catch {
        this.state!.plan = {
          summary: 'Gather data and analyze',
          tasks: [{
            id: 'task_1',
            description: 'Fetch relevant data',
            taskType: 'use_tools',
            dependsOn: [],
            status: 'pending',
          }],
        }
      }
    }
  }

  /**
   * Phase 3: Execute tasks
   */
  private async executePhase(): Promise<void> {
    this.state!.currentPhase = 'execute'
    this.callbacks?.onPhaseChange?.('execute')

    const plan = this.state!.plan!
    const completedTasks = new Set<string>()

    // Execute tasks respecting dependencies
    while (completedTasks.size < plan.tasks.length) {
      // Find ready tasks (dependencies met)
      const readyTasks = plan.tasks.filter(
        t => t.status === 'pending' && t.dependsOn.every(dep => completedTasks.has(dep))
      )

      if (readyTasks.length === 0) break

      // Execute ready tasks in parallel
      await Promise.all(readyTasks.map(task => this.executeTask(task)))

      readyTasks.forEach(t => completedTasks.add(t.id))
    }
  }

  /**
   * Execute tasks with streaming events
   */
  private async *executePhaseStreaming(): AsyncGenerator<{ type: string; data: unknown }> {
    this.state!.currentPhase = 'execute'

    const plan = this.state!.plan!
    const completedTasks = new Set<string>()

    while (completedTasks.size < plan.tasks.length) {
      const readyTasks = plan.tasks.filter(
        t => t.status === 'pending' && t.dependsOn.every(dep => completedTasks.has(dep))
      )

      if (readyTasks.length === 0) break

      for (const task of readyTasks) {
        yield { type: 'task-start', data: task }
        await this.executeTask(task)
        yield { type: 'task-complete', data: { task, result: this.state!.taskResults.get(task.id) } }
        completedTasks.add(task.id)
      }
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: Task): Promise<void> {
    task.status = 'in_progress'
    this.state!.currentTaskId = task.id
    this.callbacks?.onTaskStart?.(task)

    try {
      if (task.taskType === 'use_tools') {
        // Select and execute tools
        const toolCalls = await this.selectTools(task)
        task.toolCalls = toolCalls

        const toolResults: Record<string, unknown>[] = []
        for (const toolCall of toolCalls) {
          this.callbacks?.onToolCall?.(toolCall)
          const result = await this.executeTool(toolCall)
          toolResults.push({ tool: toolCall.toolName, result })
          this.callbacks?.onToolResult?.(toolCall)
        }

        // Summarize tool results
        const taskResult: TaskResult = {
          taskId: task.id,
          output: `Executed ${toolCalls.length} tool(s): ${toolCalls.map(t => t.toolName).join(', ')}`,
          toolResults,
        }
        this.state!.taskResults.set(task.id, taskResult)
        task.status = 'completed'
        this.callbacks?.onTaskComplete?.(task, taskResult)
      } else {
        // Reasoning task
        const context = this.buildTaskContext(task)
        const { text } = await generateText({
          model: this.model,
          system: EXECUTE_SYSTEM_PROMPT,
          prompt: EXECUTE_USER_PROMPT(task.description, context),
        })

        const taskResult: TaskResult = {
          taskId: task.id,
          output: text,
        }
        this.state!.taskResults.set(task.id, taskResult)
        task.status = 'completed'
        this.callbacks?.onTaskComplete?.(task, taskResult)
      }
    } catch (error) {
      task.status = 'failed'
      task.result = error instanceof Error ? error.message : 'Task failed'
    }
  }

  /**
   * Select tools for a task (uses structured output like Dexter)
   */
  private async selectTools(task: Task): Promise<ToolCall[]> {
    const entities = this.state!.understanding!.entities
      .map(e => `${e.type}: ${e.normalized || e.value}`)
      .join(', ')

    // Extract ticker from entities for fallback
    const tickerEntity = this.state!.understanding!.entities.find(e => e.type === 'ticker')
    const fallbackTicker = tickerEntity?.normalized || tickerEntity?.value

    try {
      const { object } = await generateObject({
        model: this.model,
        schema: ToolSelectionSchema,
        system: TOOL_SELECTION_SYSTEM_PROMPT,
        prompt: TOOL_SELECTION_USER_PROMPT(task.description, entities),
      })

      return object.map((s, i) => {
        // Auto-populate ticker if args is empty and we have a ticker entity
        let args = s.args as Record<string, unknown>
        if (fallbackTicker && (!args || Object.keys(args).length === 0)) {
          args = { ticker: fallbackTicker }
        } else if (fallbackTicker && args && !args.ticker) {
          // Add ticker if missing from args
          args = { ...args, ticker: fallbackTicker }
        }
        return {
          id: `${task.id}_tool_${i}`,
          toolName: s.toolName,
          args,
          status: 'pending' as const,
        }
      })
    } catch {
      // Fallback to text-based
      const { text } = await generateText({
        model: this.model,
        system: TOOL_SELECTION_SYSTEM_PROMPT,
        prompt: TOOL_SELECTION_USER_PROMPT(task.description, entities),
      })

      try {
        const selections = JSON.parse(this.extractJSON(text)) as Array<{ toolName: string; args: Record<string, unknown> }>
        return selections.map((s, i) => {
          // Auto-populate ticker if args is empty and we have a ticker entity
          let args = s.args || {}
          if (fallbackTicker && Object.keys(args).length === 0) {
            args = { ticker: fallbackTicker }
          } else if (fallbackTicker && !args.ticker) {
            args = { ...args, ticker: fallbackTicker }
          }
          return {
            id: `${task.id}_tool_${i}`,
            toolName: s.toolName,
            args,
            status: 'pending' as const,
          }
        })
      } catch {
        return []
      }
    }
  }

  /**
   * Execute a tool call
   */
  private async executeTool(toolCall: ToolCall): Promise<unknown> {
    toolCall.status = 'running'

    const tool = financialTools[toolCall.toolName as keyof typeof financialTools]
    if (!tool || !('execute' in tool) || typeof tool.execute !== 'function') {
      toolCall.status = 'failed'
      toolCall.error = `Unknown tool: ${toolCall.toolName}`
      return { error: toolCall.error }
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (tool as any).execute(toolCall.args, { abortSignal: undefined })
      toolCall.status = 'completed'
      toolCall.result = result
      return result
    } catch (error) {
      toolCall.status = 'failed'
      toolCall.error = error instanceof Error ? error.message : 'Tool execution failed'
      return { error: toolCall.error }
    }
  }

  /**
   * Build context from previous task results
   */
  private buildTaskContext(task: Task): string {
    const contextParts: string[] = []

    // Add results from dependencies
    for (const depId of task.dependsOn) {
      const depResult = this.state!.taskResults.get(depId)
      if (depResult) {
        contextParts.push(`[${depId}]: ${depResult.output}`)
        if (depResult.toolResults) {
          contextParts.push(JSON.stringify(depResult.toolResults, null, 2).substring(0, 2000))
        }
      }
    }

    // Add all tool results
    this.state!.taskResults.forEach((result, id) => {
      if (result.toolResults && !task.dependsOn.includes(id)) {
        contextParts.push(`Tool data from ${id}: ${JSON.stringify(result.toolResults).substring(0, 1000)}`)
      }
    })

    return contextParts.join('\n\n')
  }

  /**
   * Phase 4: Reflect on progress (uses structured output like Dexter)
   * Includes loop detection via iteration limits
   */
  private async reflectPhase(): Promise<boolean> {
    this.state!.currentPhase = 'reflect'
    this.callbacks?.onPhaseChange?.('reflect')

    // Loop detection: force completion at max iterations (like Dexter)
    if (this.state!.iteration >= this.maxIterations) {
      const reflection: Reflection = {
        isComplete: true,
        reasoning: `Reached maximum iterations (${this.maxIterations}). Proceeding with available data.`,
        missingInfo: [],
        suggestedNextSteps: '',
      }
      this.state!.reflection = reflection
      this.callbacks?.onReflection?.(reflection)
      return false
    }

    const taskResultsStr = formatTaskResults(this.state!.taskResults)

    try {
      const { object } = await generateObject({
        model: this.model,
        schema: ReflectionSchema,
        system: REFLECT_SYSTEM_PROMPT,
        prompt: REFLECT_USER_PROMPT(
          this.state!.query,
          this.state!.understanding!,
          taskResultsStr,
          this.state!.iteration,
          this.maxIterations
        ),
      })

      this.state!.reflection = object as Reflection
      this.callbacks?.onReflection?.(this.state!.reflection)
      return !object.isComplete
    } catch {
      // Fallback to text-based
      const { text } = await generateText({
        model: this.model,
        system: REFLECT_SYSTEM_PROMPT,
        prompt: REFLECT_USER_PROMPT(
          this.state!.query,
          this.state!.understanding!,
          taskResultsStr,
          this.state!.iteration,
          this.maxIterations
        ),
      })

      try {
        const reflection = JSON.parse(this.extractJSON(text)) as Reflection
        this.state!.reflection = reflection
        this.callbacks?.onReflection?.(reflection)
        return !reflection.isComplete
      } catch {
        return false
      }
    }
  }

  /**
   * Phase 5: Generate final answer
   */
  private async answerPhase(): Promise<string> {
    this.state!.currentPhase = 'answer'
    this.callbacks?.onPhaseChange?.('answer')

    const taskResultsStr = formatTaskResults(this.state!.taskResults)
    const toolsUsed = this.getToolsUsed()

    const { text } = await generateText({
      model: this.model,
      system: ANSWER_SYSTEM_PROMPT,
      prompt: ANSWER_USER_PROMPT(
        this.state!.query,
        this.state!.understanding!,
        taskResultsStr,
        toolsUsed
      ),
    })

    this.callbacks?.onAnswer?.(text)
    return text
  }

  /**
   * Stream the final answer
   */
  private async *answerPhaseStreaming(): AsyncGenerator<string> {
    const taskResultsStr = formatTaskResults(this.state!.taskResults)
    const toolsUsed = this.getToolsUsed()

    const stream = streamText({
      model: this.model,
      system: ANSWER_SYSTEM_PROMPT,
      prompt: ANSWER_USER_PROMPT(
        this.state!.query,
        this.state!.understanding!,
        taskResultsStr,
        toolsUsed
      ),
    })

    let fullAnswer = ''
    for await (const chunk of (await stream).textStream) {
      fullAnswer += chunk
      this.callbacks?.onStream?.(chunk)
      yield chunk
    }

    this.state!.finalAnswer = fullAnswer
    this.callbacks?.onAnswer?.(fullAnswer)
  }

  /**
   * Get list of tools used
   */
  private getToolsUsed(): string[] {
    const tools = new Set<string>()
    this.state!.plan?.tasks.forEach(task => {
      task.toolCalls?.forEach(tc => tools.add(tc.toolName))
    })
    return Array.from(tools)
  }

  /**
   * Extract JSON from text (handles markdown code blocks)
   */
  private extractJSON(text: string): string {
    // Try to find JSON in code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim()
    }

    // Try to find raw JSON
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (jsonMatch) {
      return jsonMatch[0]
    }

    return text
  }
}
