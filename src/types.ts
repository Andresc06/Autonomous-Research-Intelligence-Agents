export interface SubtaskResponse {
  id: number
  role: 'planner' | 'researcher' | 'analyst' | 'reviewer' | 'synthesizer'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  depends_on: number[]
  output: Record<string, unknown> | null
  retry_count: number
  instructions: string
}

export interface TaskResponse {
  id: number
  user_request: string
  status: 'planning' | 'running' | 'completed' | 'failed'
  final_report: string | null
  subtasks: SubtaskResponse[]
}

export interface TaskSummary {
  id: number
  user_request: string
  status: 'planning' | 'running' | 'completed' | 'failed'
}

export interface SSEEvent {
  type: string
  subtask_id: number | null
  payload: Record<string, unknown>
  status?: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
}
