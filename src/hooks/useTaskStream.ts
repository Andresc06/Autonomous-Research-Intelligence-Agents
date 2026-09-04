import { useEffect, useState } from 'react'
import { getTask, streamTask } from '@/api/client'
import type { SubtaskResponse } from '@/types'

interface StreamState {
  subtasks: SubtaskResponse[]
  taskStatus: string
  finalReport: string | null
  userRequest: string | null
  logs: Record<number, string[]>
  notFound: boolean
}

const INITIAL: StreamState = {
  subtasks: [],
  taskStatus: 'planning',
  finalReport: null,
  userRequest: null,
  logs: {},
  notFound: false,
}

function eventToStatus(type: string): SubtaskResponse['status'] | null {
  switch (type) {
    case 'started':  return 'in_progress'
    case 'completed': return 'completed'
    case 'failed':
    case 'blocked':  return 'failed'
    case 'retrying': return 'pending'
    default:         return null
  }
}

export function useTaskStream(taskId: number | null): StreamState {
  const [state, setState] = useState<StreamState>(INITIAL)

  useEffect(() => {
    if (taskId === null) { setState(INITIAL); return }

    const id: number = taskId
    setState(INITIAL)
    let cancelled = false
    let pollTimer: ReturnType<typeof setInterval> | null = null
    let cancelStream: (() => void) | null = null

    function startPolling() {
      if (cancelled) return
      pollTimer = setInterval(async () => {
        try {
          const task = await getTask(id)
          if (cancelled) return
          setState(prev => ({ ...prev, subtasks: task.subtasks, taskStatus: task.status, finalReport: task.final_report, userRequest: task.user_request }))
          if (task.status === 'completed' || task.status === 'failed') {
            if (pollTimer) clearInterval(pollTimer)
          }
        } catch { /* keep polling */ }
      }, 2000)
    }

    getTask(id).then(task => {
      if (cancelled) return
      setState({
        subtasks: task.subtasks,
        taskStatus: task.status,
        finalReport: task.final_report,
        userRequest: task.user_request,
        logs: {},
        notFound: false,
      })

      if (task.status === 'completed' || task.status === 'failed') return

      cancelStream = streamTask(
        id,
        (event) => {
          if (cancelled) return
          if (event.type === 'task_finished') {
            getTask(id).then(final => {
              if (cancelled) return
              setState(prev => ({
                ...prev,
                subtasks: final.subtasks,
                taskStatus: final.status,
                finalReport: final.final_report,
                userRequest: final.user_request,
              }))
            }).catch(() => {})
          } else if (event.type === 'subtask_progress' && event.subtask_id != null) {
            const message = event.payload.message as string
            setState(prev => ({
              ...prev,
              logs: {
                ...prev.logs,
                [event.subtask_id!]: [...(prev.logs[event.subtask_id!] ?? []), message],
              },
            }))
          } else if (event.subtask_id != null) {
            const newStatus = eventToStatus(event.type)
            if (newStatus) {
              setState(prev => ({
                ...prev,
                subtasks: prev.subtasks.map(s =>
                  s.id === event.subtask_id ? { ...s, status: newStatus } : s
                ),
              }))
            }
          }
        },
        startPolling,
      )
    }).catch(() => {
      // A failure here - most commonly a 404 because the task doesn't exist.
      // Stopping here instead of polling forever is what turns a permanently-invalid id into a visible error.
      if (!cancelled) setState({ ...INITIAL, notFound: true })
    })

    return () => {
      cancelled = true
      cancelStream?.()
      if (pollTimer) clearInterval(pollTimer)
    }
  }, [taskId])

  return state
}
