import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { resetPassword } from '@/api/client'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState(searchParams.get('token') ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await resetPassword(token, newPassword)
      navigate('/app', { state: { passwordResetSuccess: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-hairline-strong bg-surface p-8">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 font-mono text-lg font-semibold text-fg">
            <KeyRound size={18} className="text-accent" />
            Reset password
          </h1>
          <p className="text-sm text-fg-muted">
            Paste your reset token and choose a new password.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 font-mono text-xs text-danger">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="text"
            placeholder="reset token"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="border-hairline-strong bg-canvas font-mono text-sm text-fg placeholder:text-fg-subtle"
            required
          />
          <Input
            type="password"
            placeholder="new password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="border-hairline-strong bg-canvas font-mono text-sm text-fg placeholder:text-fg-subtle"
            required
            minLength={8}
          />
          <Input
            type="password"
            placeholder="confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="border-hairline-strong bg-canvas font-mono text-sm text-fg placeholder:text-fg-subtle"
            required
            minLength={8}
          />
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent-emphasis font-mono text-sm text-white hover:bg-accent disabled:opacity-40"
          >
            {submitting ? 'Please wait...' : 'Reset password'}
          </Button>
        </form>

        <Link
          to="/forgot-password"
          className="flex items-center justify-center gap-1.5 font-mono text-xs text-fg-subtle hover:text-fg-muted"
        >
          <ArrowLeft size={12} />
          Need a new token?
        </Link>
      </div>
    </div>
  )
}
