import { useEffect } from 'react'
import { useTaskStream } from '@/hooks/useTaskStream'
import { AgentFeed } from '@/components/AgentFeed'
import { ReportView } from '@/components/ReportView'

interface Props {
  taskId: number
  onStatusChange: (taskId: number, status: string) => void
}

export function TaskDetail({ taskId, onStatusChange }: Props) {
  const { subtasks, taskStatus, finalReport } = useTaskStream(taskId)

  useEffect(() => {
    onStatusChange(taskId, taskStatus)
  }, [taskId, taskStatus, onStatusChange])

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <div className="mb-4 flex items-center justify-between border-b border-[#21262d] pb-4">
        <span className="font-mono text-xs text-[#484f58]">task #{taskId}</span>
        <span className={`font-mono text-xs uppercase tracking-widest ${
          taskStatus === 'completed' ? 'text-[#3fb950]'
          : taskStatus === 'failed'  ? 'text-[#f85149]'
          : taskStatus === 'running' ? 'text-[#58a6ff]'
          : 'text-[#8b949e]'
        }`}>
          {taskStatus}
        </span>
      </div>

      {taskStatus === 'failed' && (
        <div className="mb-4 rounded border border-red-800 bg-red-950/30 px-4 py-3 font-mono text-sm text-[#f85149]">
          Task failed. One or more agents encountered an error.
        </div>
      )}

      <AgentFeed subtasks={subtasks} />

      {finalReport && <ReportView markdown={finalReport} />}
    </div>
  )
}
