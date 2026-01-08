/**
 * Autonomous Financial Research Agent
 * Inspired by virattt/dexter
 *
 * A multi-phase agent that:
 * 1. Understands user queries
 * 2. Plans research tasks
 * 3. Executes tools autonomously
 * 4. Reflects on progress
 * 5. Generates comprehensive answers
 */

export { Agent } from './orchestrator'
export * from './types'
export { formatTaskResults, normalizeToTicker } from './prompts'
