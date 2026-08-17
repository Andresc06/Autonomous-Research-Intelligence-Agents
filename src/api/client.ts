import type { SSEEvent, TaskResponse } from '@/types'

export class UnauthorizedError extends Error {
  constructor() { super('Invalid or missing API key') }
}

function getKey(): string {
  return localStorage.getItem('api_key') ?? ''
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': getKey(),
      ...(init?.headers ?? {}),
    },
  })
  if (res.status === 401) throw new UnauthorizedError()
  return res
}

export async function createTask(userRequest: string): Promise<{ task_id: number }> {
  const res = await apiFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify({ user_request: userRequest }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      res.status === 429
        ? 'Daily token budget exceeded'
        : ((body as { detail?: string }).detail ?? 'Failed to create task'),
    )
  }
  return res.json()
}

export async function getTask(taskId: number): Promise<TaskResponse> {
  const res = await apiFetch(`/tasks/${taskId}`)
  if (!res.ok) throw new Error('Failed to fetch task')
  return res.json()
}

// Uses fetch + ReadableStream so X-API-Key header can be sent.
// Native EventSource does not support custom headers.
// Returns a cancel function — call it to abort the stream.
export function streamTask(
  taskId: number,
  onEvent: (event: SSEEvent) => void,
  onError: () => void,
): () => void {
  const controller = new AbortController()

  ;(async () => {
    try {
      const res = await fetch(`/tasks/${taskId}/stream`, {
        headers: { 'X-API-Key': getKey() },
        signal: controller.signal,
      })
      if (!res.ok || !res.body) { onError(); return }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) {
          const dataLine = part.split('\n').find(l => l.startsWith('data: '))
          if (!dataLine) continue
          try {
            onEvent(JSON.parse(dataLine.slice(6)) as SSEEvent)
          } catch { /* skip malformed frames */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      onError()
    }
  })()

  return () => controller.abort()
}
