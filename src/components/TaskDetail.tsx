import { useEffect } from 'react'
import { useTaskStream } from '@/hooks/useTaskStream'
import { AgentFeed } from '@/components/AgentFeed'
import { ReportView } from '@/components/ReportView'

interface Props {
  taskId: number
  displayNumber: number
  onStatusChange: (taskId: number, status: string) => void
}

export function TaskDetail({ taskId, displayNumber, onStatusChange }: Props) {
  const { subtasks, taskStatus, finalReport, userRequest, logs } = useTaskStream(taskId)

  useEffect(() => {
    onStatusChange(taskId, taskStatus)
  }, [taskId, taskStatus, onStatusChange])

  const statusColor =
    taskStatus === 'completed' ? 'text-[#3fb950]'
    : taskStatus === 'failed'  ? 'text-[#f85149]'
    : taskStatus === 'running' ? 'text-[#58a6ff]'
    : 'text-[#8b949e]'

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-5 border-b border-[#21262d] pb-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs text-[#484f58]">task #{displayNumber}</span>
          <span className={`font-mono text-xs uppercase tracking-widest ${statusColor}`}>
            {taskStatus}
            {(taskStatus === 'running' || taskStatus === 'planning') && (
              <span className="ml-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current align-middle" />
            )}
          </span>
        </div>
        {userRequest && (
          <p className="text-sm text-[#c9d1d9]">{userRequest}</p>
        )}
      </div>

      {taskStatus === 'failed' && (
        <div className="mb-4 rounded border border-red-800 bg-red-950/30 px-4 py-3 font-mono text-sm text-[#f85149]">
          Task failed. One or more agents encountered an error.
        </div>
      )}

      <AgentFeed subtasks={subtasks} logs={logs} />

      {finalReport && <ReportView markdown={finalReport} />}
    </div>
  )
}
