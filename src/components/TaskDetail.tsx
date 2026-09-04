import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { useTaskStream } from '@/hooks/useTaskStream'
import { AgentFeed } from '@/components/AgentFeed'
import { ReportView } from '@/components/ReportView'
import { StatusIcon, TASK_STATUS_META, type TaskStatus } from '@/lib/status'

interface Props {
  taskId: number
  displayNumber: number
  onStatusChange: (taskId: number, status: string) => void
}

export function TaskDetail({ taskId, displayNumber, onStatusChange }: Props) {
  const { subtasks, taskStatus, finalReport, userRequest, logs, notFound } = useTaskStream(taskId)

  useEffect(() => {
    // Skip while notFound: the stream never resolved a real status
    if (!notFound) onStatusChange(taskId, taskStatus)
  }, [taskId, taskStatus, notFound, onStatusChange])

  const statusMeta = TASK_STATUS_META[taskStatus as TaskStatus]

  if (notFound) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <AlertCircle size={20} className="text-danger" />
        <p className="font-mono text-sm text-fg">Couldn't load task #{displayNumber}</p>
        <p className="max-w-xs text-xs text-fg-muted">
          It may have been removed, or it doesn't belong to this account.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-5 border-b border-hairline pb-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs text-fg-subtle">task #{displayNumber}</span>
          <span className={`flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest ${statusMeta.iconClass}`}>
            <StatusIcon status={taskStatus as TaskStatus} kind="task" />
            {taskStatus}
          </span>
        </div>
        {userRequest && (
          <p className="text-sm text-fg-body">{userRequest}</p>
        )}
      </div>

      {taskStatus === 'failed' && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 font-mono text-sm text-danger">
          <AlertCircle size={16} className="shrink-0" />
          Task failed. One or more agents encountered an error.
        </div>
      )}

      <AgentFeed subtasks={subtasks} logs={logs} />

      {finalReport && <ReportView markdown={finalReport} filename={`aria-report-${displayNumber}.md`} />}
    </div>
  )
}
