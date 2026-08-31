import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createTask, UnauthorizedError } from '@/api/client'
import { StatusIcon, type TaskStatus } from '@/lib/status'
import type { TaskSummary } from '@/types'

interface Props {
  tasks: TaskSummary[]
  selectedId: number | null
  displayNumbers: Map<number, number>
  onSelect: (id: number) => void
  onTaskCreated: (task: TaskSummary) => void
  onUnauthorized: () => void
}

export function TaskSidebar({ tasks, selectedId, displayNumbers, onSelect, onTaskCreated, onUnauthorized }: Props) {
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const { task_id } = await createTask(trimmed)
      onTaskCreated({ id: task_id, user_request: trimmed, status: 'planning' })
      setInput('')
    } catch (err) {
      if (err instanceof UnauthorizedError) { onUnauthorized(); return }
      setError(err instanceof Error ? err.message : 'Failed to submit task')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    // border-hairline-strong here (not the default hairline) is a deliberate
    // exception: this is a major layout divider, not a content-card border.
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-hairline-strong bg-canvas">
      <form onSubmit={handleSubmit} className="space-y-2 border-b border-hairline-strong p-3">
        <Textarea
          placeholder="Describe a task..."
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={3}
          className="resize-none border-hairline-strong bg-surface font-mono text-xs text-fg placeholder:text-fg-subtle focus-visible:ring-accent"
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e) }}
        />
        {error && <p className="font-mono text-xs text-danger">{error}</p>}
        <Button
          type="submit"
          disabled={submitting || !input.trim()}
          className="w-full bg-accent-emphasis font-mono text-xs text-white hover:bg-accent disabled:opacity-40"
        >
          {submitting ? 'submitting...' : '$ run task'}
        </Button>
      </form>

      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 && (
          <p className="p-4 font-mono text-xs text-fg-subtle">No tasks yet.</p>
        )}
        {[...tasks].reverse().map(task => (
          <button
            key={task.id}
            onClick={() => onSelect(task.id)}
            className={`w-full border-b border-hairline p-3 text-left transition-colors ${
              selectedId === task.id ? 'bg-surface-raised' : 'hover:bg-surface'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-fg-subtle">#{displayNumbers.get(task.id) ?? task.id}</span>
              <StatusIcon status={task.status as TaskStatus} kind="task" size={12} />
            </div>
            <p className="mt-1 line-clamp-2 font-mono text-xs text-fg-body">
              {task.user_request}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
