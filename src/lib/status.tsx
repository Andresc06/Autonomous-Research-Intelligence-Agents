import { AlertCircle, CheckCircle2, Circle, Loader2, XCircle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SubtaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed'
export type TaskStatus = 'planning' | 'running' | 'completed' | 'failed'

interface StatusMeta {
  icon: LucideIcon
  label: string
  badgeClass: string
  iconClass: string
  spin?: boolean
}

// Single source of truth for status -> icon/color/label, replacing what used
// to be three independently hand-maintained copies of this logic (in
// AgentFeed, TaskDetail, and TaskSidebar). SubtaskStatus and TaskStatus are
// genuinely different enums (e.g. "pending" vs "planning"), so they stay as
// two separate maps rather than being forced into one.
export const SUBTASK_STATUS_META: Record<SubtaskStatus, StatusMeta> = {
  pending: {
    icon: Circle,
    label: 'waiting',
    badgeClass: 'border-hairline-strong bg-transparent text-fg-muted',
    iconClass: 'text-fg-subtle',
  },
  in_progress: {
    icon: Loader2,
    label: 'running',
    badgeClass: 'border-accent-emphasis bg-accent-emphasis/20 text-accent',
    iconClass: 'text-accent',
    spin: true,
  },
  completed: {
    icon: CheckCircle2,
    label: 'done',
    badgeClass: 'border-success-emphasis bg-success-emphasis/20 text-success',
    iconClass: 'text-success',
  },
  failed: {
    icon: XCircle,
    label: 'failed',
    badgeClass: 'border-danger-emphasis bg-danger-emphasis/20 text-danger',
    iconClass: 'text-danger',
  },
}

export const TASK_STATUS_META: Record<TaskStatus, StatusMeta> = {
  // Same icon as "running" (both are active/waiting states the user watches)
  // but muted rather than accent-colored, so the two phases stay visually
  // distinguishable at a glance.
  planning: {
    icon: Loader2,
    label: 'planning',
    badgeClass: 'text-fg-muted',
    iconClass: 'text-fg-muted',
    spin: true,
  },
  running: {
    icon: Loader2,
    label: 'running',
    badgeClass: 'text-accent',
    iconClass: 'text-accent',
    spin: true,
  },
  completed: {
    icon: CheckCircle2,
    label: 'completed',
    badgeClass: 'text-success',
    iconClass: 'text-success',
  },
  // AlertCircle rather than XCircle: a task-level failure is the aggregate
  // outcome of the whole run, so it reads as a step more severe than any
  // single failed subtask (which uses XCircle in SUBTASK_STATUS_META).
  failed: {
    icon: AlertCircle,
    label: 'failed',
    badgeClass: 'text-danger',
    iconClass: 'text-danger',
  },
}

interface StatusIconProps {
  status: SubtaskStatus | TaskStatus
  kind: 'subtask' | 'task'
  size?: number
  className?: string
}

export function StatusIcon({ status, kind, size = 14, className }: StatusIconProps) {
  const meta =
    kind === 'subtask'
      ? SUBTASK_STATUS_META[status as SubtaskStatus]
      : TASK_STATUS_META[status as TaskStatus]
  const Icon = meta.icon
  return <Icon size={size} className={cn(meta.iconClass, meta.spin && 'animate-spin', className)} />
}
