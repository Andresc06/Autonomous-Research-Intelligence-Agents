import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthGate } from '@/components/AuthGate'
import { TaskSidebar } from '@/components/TaskSidebar'
import { TaskDetail } from '@/components/TaskDetail'
import { listTasks, UnauthorizedError } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import type { TaskSummary } from '@/types'

export function DashboardPage() {
  const { isAuthenticated, logout } = useAuth()
  const [tasks, setTasks] = useState<TaskSummary[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false

    listTasks()
      .then(fetched => { if (!cancelled) setTasks(fetched) })
      .catch(err => {
        if (cancelled) return
        if (err instanceof UnauthorizedError) { void logout(); return }
        setLoadError('Failed to load your task history')
      })

    return () => { cancelled = true }
  }, [isAuthenticated, logout])

  function handleTaskCreated(task: TaskSummary) {
    setTasks(prev => [...prev, task])
    setSelectedId(task.id)
  }

  function handleUnauthorized() {
    void logout()
  }

  const handleStatusChange = useCallback((taskId: number, status: string) => {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: status as TaskSummary['status'] } : t)
    )
  }, [])

  // Maps each task's real database id to "when this user created it" (1st, 2nd, ...)
  // instead of showing the raw id, which is sequential and shared across every
  // account - it would let someone infer how many tasks exist app-wide, not just theirs.
  const displayNumbers = useMemo(() => {
    const oldestFirst = [...tasks].sort((a, b) => a.id - b.id)
    return new Map(oldestFirst.map((t, index) => [t.id, index + 1]))
  }, [tasks])

  if (!isAuthenticated) {
    return <AuthGate />
  }

  return (
    <div className="flex h-full overflow-hidden">
      <TaskSidebar
        tasks={tasks}
        selectedId={selectedId}
        displayNumbers={displayNumbers}
        onSelect={setSelectedId}
        onTaskCreated={handleTaskCreated}
        onUnauthorized={handleUnauthorized}
      />
      <main className="flex-1 overflow-hidden">
        {selectedId === null ? (
          <div className="flex h-full items-center justify-center p-12">
            <div className="max-w-md space-y-6">
              <div>
                <h1 className="font-mono text-xl font-bold text-[#e6edf3]">
                  Ready when you are
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-[#8b949e]">
                  Describe a task in the sidebar and a team of AI agents will research, analyze, and report back — live.
                </p>
              </div>

              {loadError && (
                <p className="rounded border border-red-800 bg-red-950/30 px-3 py-2 font-mono text-xs text-[#f85149]">
                  {loadError}
                </p>
              )}

              <div className="rounded border border-[#21262d] bg-[#161b22] px-4 py-3">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[#484f58]">Try asking</p>
                <ul className="space-y-1">
                  {[
                    'What is the current population of Tokyo?',
                    'Summarize the latest developments in quantum computing',
                    'Compare the pros and cons of electric vs hybrid cars',
                  ].map(example => (
                    <li key={example} className="text-xs text-[#8b949e]">› {example}</li>
                  ))}
                </ul>
              </div>

              <p className="font-mono text-xs text-[#484f58]">
                ← type your task in the sidebar to begin
              </p>
            </div>
          </div>
        ) : (
          <TaskDetail
            key={selectedId}
            taskId={selectedId}
            displayNumber={displayNumbers.get(selectedId) ?? selectedId}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>
    </div>
  )
}
