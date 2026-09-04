import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthGate } from '@/components/AuthGate'
import { changePassword, storeTokens } from '@/api/client'
import { useAuth } from '@/context/AuthContext'

export function ChangePasswordPage() {
  const { isAuthenticated } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isAuthenticated) {
    return <AuthGate />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }
    setSubmitting(true)
    setError(null)
    setSuccess(false)
    try {
      const tokens = await changePassword(currentPassword, newPassword)
      storeTokens(tokens)
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-hairline-strong bg-surface p-8">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 font-mono text-lg font-semibold text-fg">
            <KeyRound size={18} className="text-accent" />
            Change password
          </h1>
          <p className="text-sm text-fg-muted">
            Changing your password signs you out on every other device.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 font-mono text-xs text-danger">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg border border-success-emphasis/30 bg-success-emphasis/10 px-3 py-2 font-mono text-xs text-success">
            Password changed.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            placeholder="current password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
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
            {submitting ? 'Please wait...' : 'Change password'}
          </Button>
        </form>

        <Link
          to="/app"
          className="flex items-center justify-center gap-1.5 font-mono text-xs text-fg-subtle hover:text-fg-muted"
        >
          <ArrowLeft size={12} />
          Back to app
        </Link>
      </div>
    </div>
  )
}
