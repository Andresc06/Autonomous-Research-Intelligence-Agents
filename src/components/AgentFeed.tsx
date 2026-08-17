import { Badge } from '@/components/ui/badge'
import type { SubtaskResponse } from '@/types'

const STATUS_STYLE: Record<string, string> = {
  pending:     'border-[#30363d] bg-transparent text-[#8b949e]',
  in_progress: 'border-[#1f6feb] bg-[#1f6feb]/20 text-[#58a6ff]',
  completed:   'border-[#238636] bg-[#238636]/20 text-[#3fb950]',
  failed:      'border-[#da3633] bg-[#da3633]/20 text-[#f85149]',
}

const STATUS_LABEL: Record<string, string> = {
  pending:     'pending',
  in_progress: 'running',
  completed:   'done',
  failed:      'failed',
}

interface Props {
  subtasks: SubtaskResponse[]
}

export function AgentFeed({ subtasks }: Props) {
  if (subtasks.length === 0) {
    return <p className="py-4 font-mono text-sm text-[#484f58]">Planning subtasks...</p>
  }

  return (
    <div className="space-y-2">
      {subtasks.map(subtask => (
        <div
          key={subtask.id}
          className="flex items-center justify-between rounded border border-[#21262d] bg-[#161b22] px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#484f58]">#{subtask.id}</span>
            <span className="font-mono text-sm uppercase tracking-wider text-[#e6edf3]">
              {subtask.role}
            </span>
            {subtask.retry_count > 0 && (
              <span className="font-mono text-xs text-[#8b949e]">&#x21bb; {subtask.retry_count}</span>
            )}
          </div>
          <Badge
            variant="outline"
            className={`font-mono text-xs ${STATUS_STYLE[subtask.status] ?? STATUS_STYLE.pending}`}
          >
            {STATUS_LABEL[subtask.status] ?? subtask.status}
          </Badge>
        </div>
      ))}
    </div>
  )
}
