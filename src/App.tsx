import { useCallback, useState } from 'react'
import { ApiKeyGate } from '@/components/ApiKeyGate'
import { TaskSidebar } from '@/components/TaskSidebar'
import { TaskDetail } from '@/components/TaskDetail'
import type { TaskSummary } from '@/types'

export default function App() {
  const [hasKey, setHasKey] = useState<boolean>(!!localStorage.getItem('api_key'))
  const [authError, setAuthError] = useState<string | undefined>()
  const [tasks, setTasks] = useState<TaskSummary[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)

  function handleKeySet() {
    setAuthError(undefined)
    setHasKey(true)
  }

  function handleUnauthorized() {
    localStorage.removeItem('api_key')
    setHasKey(false)
    setAuthError('API key rejected — please enter a valid key.')
  }

  function handleTaskCreated(task: TaskSummary) {
    setTasks(prev => [...prev, task])
    setSelectedId(task.id)
  }

  const handleStatusChange = useCallback((taskId: number, status: string) => {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: status as TaskSummary['status'] } : t)
    )
  }, [])

  if (!hasKey) {
    return <ApiKeyGate onKeySet={handleKeySet} errorMessage={authError} />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d1117]">
      <TaskSidebar
        tasks={tasks}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onTaskCreated={handleTaskCreated}
        onUnauthorized={handleUnauthorized}
      />
      <main className="flex-1 overflow-hidden">
        {selectedId === null ? (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-sm text-[#484f58]">
              Select or submit a task to begin.
            </p>
          </div>
        ) : (
          <TaskDetail
            key={selectedId}
            taskId={selectedId}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>
    </div>
  )
}
