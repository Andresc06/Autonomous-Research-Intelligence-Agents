import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, ChevronUp, RotateCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StatusIcon, SUBTASK_STATUS_META, type SubtaskStatus } from '@/lib/status'
import type { SubtaskResponse } from '@/types'

const ROLE_FALLBACK: Record<string, string> = {
  planner:     'Breaking your request into steps',
  researcher:  'Searching the web and gathering facts',
  analyst:     'Analyzing and interpreting findings',
  reviewer:    'Checking for accuracy and completeness',
  synthesizer: 'Writing your final report',
}

function ResearcherLog({ output }: { output: Record<string, unknown> }) {
  const findings = output.findings as string[] | undefined
  const sources = output.sources as string[] | undefined
  return (
    <div className="space-y-3">
      {findings?.length ? (
        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-fg-subtle">Key Findings</p>
          <ul className="space-y-1.5">
            {findings.slice(0, 5).map((f, i) => (
              <li key={i} className="flex gap-2 text-xs text-fg-muted">
                <ChevronRight size={12} className="mt-0.5 shrink-0 text-fg-subtle" />
                <span>{f}</span>
              </li>
            ))}
            {findings.length > 5 && (
              <li className="text-xs text-fg-subtle">+{findings.length - 5} more findings</li>
            )}
          </ul>
        </div>
      ) : null}
      {sources?.length ? (
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-fg-subtle">Sources</p>
          <ul className="space-y-0.5">
            {sources.slice(0, 3).map((s, i) => (
              <li key={i} className="truncate text-xs text-accent">{s}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function AnalystLog({ output }: { output: Record<string, unknown> }) {
  const summary = output.summary as string | undefined
  const keyPoints = output.key_points as string[] | undefined
  return (
    <div className="space-y-2">
      {summary && <p className="text-xs text-fg-muted">{summary}</p>}
      {keyPoints?.length ? (
        <ul className="space-y-1">
          {keyPoints.slice(0, 4).map((p, i) => (
            <li key={i} className="flex gap-2 text-xs text-fg-muted">
              <ChevronRight size={12} className="mt-0.5 shrink-0 text-accent" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function ReviewerLog({ output }: { output: Record<string, unknown> }) {
  const approved = output.approved as boolean | undefined
  const issues = output.issues as string[] | undefined
  const meta = approved ? SUBTASK_STATUS_META.completed : SUBTASK_STATUS_META.failed
  const Icon = meta.icon
  return (
    <div className="space-y-1">
      <p className={`flex items-center gap-1.5 text-xs font-semibold ${meta.iconClass}`}>
        <Icon size={13} />
        {approved ? 'Work approved — quality looks good' : 'Issues found'}
      </p>
      {!approved && issues?.length ? (
        <ul className="list-disc space-y-0.5 pl-4">
          {issues.map((issue, i) => (
            <li key={i} className="text-xs text-danger">{issue}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

// Keyed lookup replaces an if-chain: "has a renderer" and "is expandable" can
// no longer drift apart (see LOGGABLE_ROLES below), since both derive from
// the same map.
const AGENT_LOG_RENDERERS: Record<string, (output: Record<string, unknown>) => ReactNode> = {
  researcher: output => <ResearcherLog output={output} />,
  analyst: output => <AnalystLog output={output} />,
  reviewer: output => <ReviewerLog output={output} />,
}

const LOGGABLE_ROLES = new Set(Object.keys(AGENT_LOG_RENDERERS))

function AgentLog({ role, output }: { role: string; output: Record<string, unknown> }) {
  return AGENT_LOG_RENDERERS[role]?.(output) ?? null
}

interface Props {
  subtasks: SubtaskResponse[]
  logs?: Record<number, string[]>
}

export function AgentFeed({ subtasks, logs = {} }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  if (subtasks.length === 0) {
    return (
      <div className="flex items-center gap-3 py-4">
        <StatusIcon status="in_progress" kind="subtask" size={16} />
        <p className="font-mono text-sm text-fg-subtle">Loading your request...</p>
      </div>
    )
  }

  const sorted = [...subtasks].sort((a, b) => a.id - b.id)
  const completedCount = sorted.filter(s => s.status === 'completed').length
  const progress = (completedCount / sorted.length) * 100

  // Detect parallel branches (multiple subtasks of the same role)
  const roleCounts = sorted.reduce<Record<string, number>>((acc, s) => {
    acc[s.role] = (acc[s.role] ?? 0) + 1
    return acc
  }, {})
  const parallelRoles = Object.entries(roleCounts)
    .filter(([, count]) => count > 1)
    .map(([role, count]) => `${count} ${role}s`)

  function toggle(id: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="mb-1 h-0.5 overflow-hidden rounded-full bg-hairline">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Parallel branch callout */}
      {parallelRoles.length > 0 && (
        <div className="mb-3 rounded-lg border border-accent/20 bg-accent/5 px-4 py-2.5">
          <p className="text-xs text-accent">
            <span className="font-semibold">The AI determined this is a complex task.</span>
            {' '}It's running{' '}
            {parallelRoles.join(' and ')}{' '}
            in parallel to cover the topic more thoroughly and faster.
          </p>
        </div>
      )}

      {sorted.map(subtask => {
        const isRunning = subtask.status === 'in_progress'
        const isDone = subtask.status === 'completed'
        const hasLog = isDone && !!subtask.output && LOGGABLE_ROLES.has(subtask.role)
        const isExpanded = expanded.has(subtask.id)
        const liveLogs = logs[subtask.id] ?? []
        const showLiveLogs = isRunning && liveLogs.length > 0
        const meta = SUBTASK_STATUS_META[subtask.status as SubtaskStatus] ?? SUBTASK_STATUS_META.pending

        return (
          <div key={subtask.id} className="rounded-xl border border-hairline bg-surface">
            <div
              className={`flex items-start justify-between px-4 py-3 ${hasLog ? 'cursor-pointer select-none' : ''}`}
              onClick={() => hasLog && toggle(subtask.id)}
            >
              <div className="flex items-start gap-3">
                {/* Step circle + badge remount on status change to trigger the fade-in below */}
                <span
                  key={subtask.status}
                  className={`animate-in fade-in zoom-in-95 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border duration-300 ${
                    isDone ? 'border-success-emphasis' : isRunning ? 'border-accent-emphasis' : 'border-hairline-strong'
                  }`}
                >
                  <StatusIcon status={subtask.status as SubtaskStatus} kind="subtask" size={12} />
                </span>

                <div className="min-w-0 flex-1">
                  <span className="font-mono text-sm uppercase tracking-wider text-fg">
                    {subtask.role}
                  </span>
                  {/* Show actual instructions if available, otherwise fallback description */}
                  <p className={`mt-0.5 text-xs ${isRunning ? 'text-accent' : 'text-fg-subtle'}`}>
                    {subtask.instructions || ROLE_FALLBACK[subtask.role]}
                  </p>
                </div>

                {subtask.retry_count > 0 && (
                  <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-fg-muted">
                    <RotateCw size={12} />
                    {subtask.retry_count}
                  </span>
                )}
              </div>

              <div className="ml-3 flex shrink-0 items-center gap-2">
                <Badge
                  key={subtask.status}
                  variant="outline"
                  className={`animate-in fade-in font-mono text-xs duration-300 ${meta.badgeClass}`}
                >
                  {meta.label}
                </Badge>
                {hasLog && (
                  isExpanded
                    ? <ChevronUp size={14} className="text-fg-subtle" />
                    : <ChevronDown size={14} className="text-fg-subtle" />
                )}
              </div>
            </div>

            {/* Live search log (while running) */}
            {showLiveLogs && (
              <div className="border-t border-hairline px-4 py-2">
                <div className="space-y-1 font-mono text-xs">
                  {liveLogs.slice(-6).map((msg, i, arr) => (
                    <div key={i} className="flex gap-2 text-fg-subtle">
                      <ChevronRight size={12} className="mt-0.5 shrink-0 text-accent" />
                      <span className={i === arr.length - 1 ? 'text-fg-muted' : ''}>{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed output log (expandable) */}
            {hasLog && isExpanded && subtask.output && (
              <div className="border-t border-hairline px-4 py-3">
                <AgentLog role={subtask.role} output={subtask.output} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
