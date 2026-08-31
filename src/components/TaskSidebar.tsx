import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createTask, UnauthorizedError } from '@/api/client'
import type { TaskSummary } from '@/types'

interface Props {
  tasks: TaskSummary[]
  selectedId: number | null
  displayNumbers: Map<number, number>
  onSelect: (id: number) => void
  onTaskCreated: (task: TaskSummary) => void
  onUnauthorized: () => void
}

const STATUS_COLOR: Record<string, string> = {
  planning:  'text-[#8b949e]',
  running:   'text-[#58a6ff]',
  completed: 'text-[#3fb950]',
  failed:    'text-[#f85149]',
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
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-[#30363d] bg-[#0d1117]">
      <form onSubmit={handleSubmit} className="space-y-2 border-b border-[#30363d] p-3">
        <Textarea
          placeholder="Describe a task..."
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={3}
          className="resize-none border-[#30363d] bg-[#161b22] font-mono text-xs text-[#e6edf3] placeholder:text-[#484f58] focus-visible:ring-[#58a6ff]"
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e) }}
        />
        {error && <p className="font-mono text-xs text-[#f85149]">{error}</p>}
        <Button
          type="submit"
          disabled={submitting || !input.trim()}
          className="w-full bg-[#238636] font-mono text-xs text-white hover:bg-[#2ea043] disabled:opacity-40"
        >
          {submitting ? 'submitting...' : '$ run task'}
        </Button>
      </form>

      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 && (
          <p className="p-4 font-mono text-xs text-[#484f58]">No tasks yet.</p>
        )}
        {[...tasks].reverse().map(task => (
          <button
            key={task.id}
            onClick={() => onSelect(task.id)}
            className={`w-full border-b border-[#21262d] p-3 text-left transition-colors hover:bg-[#161b22] ${
              selectedId === task.id ? 'bg-[#161b22]' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#484f58]">#{displayNumbers.get(task.id) ?? task.id}</span>
              <span className={`font-mono text-xs ${STATUS_COLOR[task.status] ?? 'text-[#8b949e]'}`}>&#x25cf;</span>
            </div>
            <p className="mt-1 line-clamp-2 font-mono text-xs text-[#c9d1d9]">
              {task.user_request}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
