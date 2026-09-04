import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Copy, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { forgotPassword } from '@/api/client'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    setNotFound(false)
    try {
      const { reset_token } = await forgotPassword(email)
      if (reset_token) {
        setResetToken(reset_token)
      } else {
        setNotFound(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  function copyToken() {
    if (!resetToken) return
    void navigator.clipboard.writeText(resetToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-hairline-strong bg-surface p-8">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 font-mono text-lg font-semibold text-fg">
            <KeyRound size={18} className="text-accent" />
            Forgot password
          </h1>
          <p className="text-sm text-fg-muted">
            Enter your account email to get a password reset token.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 font-mono text-xs text-danger">
            {error}
          </p>
        )}

        {notFound && (
          <p className="rounded-lg border border-hairline-strong bg-canvas px-3 py-2 font-mono text-xs text-fg-muted">
            No account exists for that email.
          </p>
        )}

        {resetToken ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-fg-subtle">
                Reset token — this app has no email service, so it's shown here directly
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate font-mono text-xs text-fg">{resetToken}</code>
                <button
                  type="button"
                  onClick={copyToken}
                  className="shrink-0 text-fg-muted hover:text-accent"
                  aria-label="Copy reset token"
                >
                  {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`)}
              className="w-full bg-accent-emphasis font-mono text-sm text-white hover:bg-accent"
            >
              Continue to reset password
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border-hairline-strong bg-canvas font-mono text-sm text-fg placeholder:text-fg-subtle"
              autoFocus
              required
            />
            <Button
              type="submit"
              disabled={submitting || !email}
              className="w-full bg-accent-emphasis font-mono text-sm text-white hover:bg-accent disabled:opacity-40"
            >
              {submitting ? 'Please wait...' : 'Get reset token'}
            </Button>
          </form>
        )}

        <Link
          to="/app"
          className="flex items-center justify-center gap-1.5 font-mono text-xs text-fg-subtle hover:text-fg-muted"
        >
          <ArrowLeft size={12} />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
