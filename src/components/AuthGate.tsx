import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'

export function AuthGate() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  function toggleMode() {
    setMode(prev => (prev === 'login' ? 'register' : 'login'))
    setError(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1117]">
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-[#30363d] bg-[#161b22] p-8">
        <div className="space-y-1">
          <h1 className="font-mono text-lg font-semibold text-[#e6edf3]">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h1>
          <p className="text-sm text-[#8b949e]">
            {mode === 'login' ? 'Sign in to see your task history' : 'Create an account to get started'}
          </p>
        </div>

        {error && (
          <p className="rounded border border-red-800 bg-red-950/50 px-3 py-2 font-mono text-xs text-red-400">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border-[#30363d] bg-[#0d1117] font-mono text-sm text-[#e6edf3] placeholder:text-[#484f58]"
            autoFocus
            required
          />
          <Input
            type="password"
            placeholder="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border-[#30363d] bg-[#0d1117] font-mono text-sm text-[#e6edf3] placeholder:text-[#484f58]"
            required
            minLength={8}
          />
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#238636] font-mono text-sm text-white hover:bg-[#2ea043] disabled:opacity-40"
          >
            {submitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <button
          type="button"
          onClick={toggleMode}
          className="w-full text-center font-mono text-xs text-[#484f58] hover:text-[#8b949e]"
        >
          {mode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
