/**
 * Autonomous Financial Research Agent Types
 * Inspired by virattt/dexter
 */

export type Phase = 'understand' | 'plan' | 'execute' | 'reflect' | 'answer' | 'complete'

export type EntityType = 'ticker' | 'company' | 'date' | 'metric' | 'period' | 'other'

export interface Entity {
  type: EntityType
  value: string
  normalized?: string // e.g., "Apple" normalized to "AAPL"
}

export interface Understanding {
  intent: string
  entities: Entity[]
  timeframe?: string
  complexity: 'simple' | 'moderate' | 'complex'
}

export type TaskType = 'use_tools' | 'reason'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export interface Task {
  id: string
  description: string
  taskType: TaskType
  dependsOn: string[]
  status: TaskStatus
  toolCalls?: ToolCall[]
  result?: string
}

export interface ToolCall {
  id: string
  toolName: string
  args: Record<string, unknown>
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: unknown
  error?: string
}

export interface Plan {
  summary: string
  tasks: Task[]
}

export interface Reflection {
  isComplete: boolean
  reasoning: string
  missingInfo: string[]
  suggestedNextSteps: string
}

export interface TaskResult {
  taskId: string
  output: string
  toolResults?: Record<string, unknown>[]
}

export interface AgentState {
  query: string
  conversationHistory?: Array<{ role: string; content: string }>
  currentPhase: Phase
  understanding?: Understanding
  plan?: Plan
  taskResults: Map<string, TaskResult>
  reflection?: Reflection
  currentTaskId?: string
  iteration: number
  maxIterations: number
  finalAnswer?: string
  error?: string
}

export interface AgentCallbacks {
  onPhaseChange?: (phase: Phase) => void
  onUnderstanding?: (understanding: Understanding) => void
  onPlan?: (plan: Plan) => void
  onTaskStart?: (task: Task) => void
  onTaskComplete?: (task: Task, result: TaskResult) => void
  onToolCall?: (toolCall: ToolCall) => void
  onToolResult?: (toolCall: ToolCall) => void
  onReflection?: (reflection: Reflection) => void
  onAnswer?: (answer: string) => void
  onError?: (error: string) => void
  onStream?: (chunk: string) => void
}

export interface AgentConfig {
  model: string
  maxIterations?: number
  maxToolCalls?: number
  callbacks?: AgentCallbacks
}

export function createInitialState(query: string, conversationHistory?: Array<{ role: string; content: string }>): AgentState {
  return {
    query,
    conversationHistory,
    currentPhase: 'understand',
    taskResults: new Map(),
    iteration: 0,
    maxIterations: 5,
  }
}
