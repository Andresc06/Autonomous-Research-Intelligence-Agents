import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import type { SubtaskResponse } from '@/types'

const STATUS_STYLE: Record<string, string> = {
  pending:     'border-[#30363d] bg-transparent text-[#8b949e]',
  in_progress: 'border-[#1f6feb] bg-[#1f6feb]/20 text-[#58a6ff]',
  completed:   'border-[#238636] bg-[#238636]/20 text-[#3fb950]',
  failed:      'border-[#da3633] bg-[#da3633]/20 text-[#f85149]',
}

const STATUS_LABEL: Record<string, string> = {
  pending:     'waiting',
  in_progress: 'running',
  completed:   'done',
  failed:      'failed',
}

const ROLE_FALLBACK: Record<string, string> = {
  planner:     'Breaking your request into steps',
  researcher:  'Searching the web and gathering facts',
  analyst:     'Analyzing and interpreting findings',
  reviewer:    'Checking for accuracy and completeness',
  synthesizer: 'Writing your final report',
}

function AgentLog({ role, output }: { role: string; output: Record<string, unknown> }) {
  if (role === 'researcher') {
    const findings = output.findings as string[] | undefined
    const sources = output.sources as string[] | undefined
    return (
      <div className="space-y-3">
        {findings?.length ? (
          <div>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-[#484f58]">Key Findings</p>
            <ul className="space-y-1.5">
              {findings.slice(0, 5).map((f, i) => (
                <li key={i} className="flex gap-2 text-xs text-[#8b949e]">
                  <span className="mt-0.5 shrink-0 text-[#3fb950]">›</span>
                  <span>{f}</span>
                </li>
              ))}
              {findings.length > 5 && (
                <li className="text-xs text-[#484f58]">+{findings.length - 5} more findings</li>
              )}
            </ul>
          </div>
        ) : null}
        {sources?.length ? (
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[#484f58]">Sources</p>
            <ul className="space-y-0.5">
              {sources.slice(0, 3).map((s, i) => (
                <li key={i} className="truncate text-xs text-[#58a6ff]">{s}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    )
  }

  if (role === 'analyst') {
    const summary = output.summary as string | undefined
    const keyPoints = output.key_points as string[] | undefined
    return (
      <div className="space-y-2">
        {summary && <p className="text-xs text-[#8b949e]">{summary}</p>}
        {keyPoints?.length ? (
          <ul className="space-y-1">
            {keyPoints.slice(0, 4).map((p, i) => (
              <li key={i} className="flex gap-2 text-xs text-[#8b949e]">
                <span className="shrink-0 text-[#58a6ff]">›</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  }

  if (role === 'reviewer') {
    const approved = output.approved as boolean | undefined
    const issues = output.issues as string[] | undefined
    return (
      <div className="space-y-1">
        <p className={`text-xs font-semibold ${approved ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
          {approved ? '✓ Work approved — quality looks good' : '✗ Issues found'}
        </p>
        {!approved && issues?.length ? (
          <ul className="space-y-0.5">
            {issues.map((issue, i) => (
              <li key={i} className="text-xs text-[#f85149]">• {issue}</li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  }

  return null
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
        <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#1f6feb]" />
        <p className="font-mono text-sm text-[#484f58]">Planning your request...</p>
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
      <div className="mb-1 h-0.5 overflow-hidden rounded-full bg-[#21262d]">
        <div
          className="h-full rounded-full bg-[#238636] transition-[width] duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Parallel branch callout */}
      {parallelRoles.length > 0 && (
        <div className="mb-3 rounded border border-[#1f6feb]/20 bg-[#1f6feb]/5 px-4 py-2.5">
          <p className="text-xs text-[#58a6ff]">
            <span className="font-semibold">The AI determined this is a complex task.</span>
            {' '}It's running{' '}
            {parallelRoles.join(' and ')}{' '}
            in parallel to cover the topic more thoroughly and faster.
          </p>
        </div>
      )}

      {sorted.map((subtask, index) => {
        const isRunning = subtask.status === 'in_progress'
        const isDone = subtask.status === 'completed'
        const hasLog = isDone && !!subtask.output && subtask.role !== 'synthesizer'
        const isExpanded = expanded.has(subtask.id)
        const liveLogs = logs[subtask.id] ?? []
        const showLiveLogs = isRunning && liveLogs.length > 0

        return (
          <div
            key={subtask.id}
            className={`rounded border transition-colors duration-300 ${
              isRunning ? 'border-[#1f6feb]/40 bg-[#161b22]' : 'border-[#21262d] bg-[#161b22]'
            }`}
          >
            <div
              className={`flex items-start justify-between px-4 py-3 ${hasLog ? 'cursor-pointer select-none' : ''}`}
              onClick={() => hasLog && toggle(subtask.id)}
            >
              <div className="flex items-start gap-3">
                {/* Step circle */}
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] transition-colors duration-300 ${
                  isDone   ? 'border-[#238636] text-[#3fb950]'
                  : isRunning ? 'border-[#1f6feb] text-[#58a6ff]'
                  : 'border-[#30363d] text-[#484f58]'
                }`}>
                  {isDone ? '✓' : index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <span className="font-mono text-sm uppercase tracking-wider text-[#e6edf3]">
                    {subtask.role}
                  </span>
                  {/* Show actual instructions if available, otherwise fallback description */}
                  <p className={`mt-0.5 text-xs ${isRunning ? 'text-[#58a6ff]' : 'text-[#484f58]'}`}>
                    {subtask.instructions || ROLE_FALLBACK[subtask.role]}
                  </p>
                </div>

                {subtask.retry_count > 0 && (
                  <span className="shrink-0 font-mono text-xs text-[#8b949e]">↻ {subtask.retry_count}</span>
                )}
              </div>

              <div className="ml-3 flex shrink-0 items-center gap-2">
                {isRunning && (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#58a6ff]" />
                )}
                <Badge
                  variant="outline"
                  className={`font-mono text-xs ${STATUS_STYLE[subtask.status] ?? STATUS_STYLE.pending}`}
                >
                  {STATUS_LABEL[subtask.status] ?? subtask.status}
                </Badge>
                {hasLog && (
                  <span className="font-mono text-[10px] text-[#484f58]">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                )}
              </div>
            </div>

            {/* Live search log (while running) */}
            {showLiveLogs && (
              <div className="border-t border-[#21262d] px-4 py-2">
                <div className="space-y-1 font-mono text-xs">
                  {liveLogs.slice(-6).map((msg, i) => (
                    <div key={i} className="flex gap-2 text-[#484f58]">
                      <span className="shrink-0 text-[#1f6feb]">›</span>
                      <span className={i === liveLogs.slice(-6).length - 1 ? 'text-[#8b949e]' : ''}>{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed output log (expandable) */}
            {hasLog && isExpanded && subtask.output && (
              <div className="border-t border-[#21262d] px-4 py-3">
                <AgentLog role={subtask.role} output={subtask.output} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
