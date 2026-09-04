import type { SSEEvent, TaskResponse, TaskSummary, TokenPair } from '@/types'

export class UnauthorizedError extends Error {
  constructor() { super('Session expired — please sign in again') }
}

function getAccessToken(): string {
  return localStorage.getItem('access_token') ?? ''
}

function getRefreshToken(): string {
  return localStorage.getItem('refresh_token') ?? ''
}

export function storeTokens(tokens: TokenPair): void {
  localStorage.setItem('access_token', tokens.access_token)
  localStorage.setItem('refresh_token', tokens.refresh_token)
}

function clearAuthStorage(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user_email')
}

// ---- Auth ----

export async function registerUser(email: string, password: string): Promise<TokenPair> {
  const res = await fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      res.status === 409
        ? 'Email already registered'
        : ((body as { detail?: string }).detail ?? 'Failed to create account'),
    )
  }
  return res.json()
}

export async function loginUser(email: string, password: string): Promise<TokenPair> {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Invalid email or password')
  return res.json()
}

async function refreshTokens(): Promise<TokenPair> {
  const res = await fetch('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: getRefreshToken() }),
  })
  if (!res.ok) throw new UnauthorizedError()
  return res.json()
}

export async function logoutUser(): Promise<void> {
  const refreshToken = getRefreshToken()
  clearAuthStorage()
  if (!refreshToken) return
  try {
    await fetch('/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  } catch { /* best effort — tokens are already cleared locally */ }
}

export async function forgotPassword(email: string): Promise<{ reset_token: string | null }> {
  const res = await fetch('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) throw new Error('Failed to request a password reset')
  return res.json()
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await fetch('/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { detail?: string }).detail ?? 'Invalid or expired reset token')
  }
}

// ---- Authenticated requests ----

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const withAuthHeader = (token: string): RequestInit => ({
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  })

  const res = await fetch(path, withAuthHeader(getAccessToken()))
  if (res.status !== 401) return res

  let refreshed: TokenPair
  try {
    refreshed = await refreshTokens()
  } catch {
    clearAuthStorage()
    throw new UnauthorizedError()
  }
  storeTokens(refreshed)

  const retryRes = await fetch(path, withAuthHeader(refreshed.access_token))
  if (retryRes.status === 401) {
    clearAuthStorage()
    throw new UnauthorizedError()
  }
  return retryRes
}

export async function listTasks(): Promise<TaskSummary[]> {
  const res = await apiFetch('/tasks')
  if (!res.ok) throw new Error('Failed to fetch tasks')
  return res.json()
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

export async function changePassword(currentPassword: string, newPassword: string): Promise<TokenPair> {
  const res = await apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { detail?: string }).detail ?? 'Failed to change password')
  }
  return res.json()
}

// Uses fetch + ReadableStream so the Authorization header can be sent
// (native EventSource cannot send custom headers).
async function consumeSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: (event: SSEEvent) => void,
): Promise<void> {
  const decoder = new TextDecoder()
  let buffer = ''
  let done = false

  while (!done) {
    const chunk = await reader.read()
    done = chunk.done
    if (done) break

    buffer += decoder.decode(chunk.value, { stream: true })
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? ''

    for (const frame of frames) {
      const dataLine = frame.split('\n').find(l => l.startsWith('data: '))
      if (!dataLine) continue
      try {
        onEvent(JSON.parse(dataLine.slice(6)) as SSEEvent)
      } catch { /* skip malformed frames */ }
    }
  }
}

async function openStream(taskId: number, token: string, signal: AbortSignal): Promise<Response> {
  return fetch(`/tasks/${taskId}/stream`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  })
}

export function streamTask(
  taskId: number,
  onEvent: (event: SSEEvent) => void,
  onError: () => void,
): () => void {
  const controller = new AbortController()

  ;(async () => {
    try {
      let res = await openStream(taskId, getAccessToken(), controller.signal)
      if (res.status === 401) {
        const refreshed = await refreshTokens().catch(() => null)
        if (!refreshed) { onError(); return }
        storeTokens(refreshed)
        res = await openStream(taskId, refreshed.access_token, controller.signal)
      }
      if (!res.ok || !res.body) { onError(); return }
      await consumeSSEStream(res.body.getReader(), onEvent)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      onError()
    }
  })()

  return () => controller.abort()
}
