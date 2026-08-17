import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  onKeySet: () => void
  errorMessage?: string
}

export function ApiKeyGate({ onKeySet, errorMessage }: Props) {
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    localStorage.setItem('api_key', trimmed)
    onKeySet()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1117]">
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-[#30363d] bg-[#161b22] p-8">
        <div className="space-y-1">
          <h1 className="font-mono text-lg font-semibold text-[#e6edf3]">
            Multi-Agent Orchestrator
          </h1>
          <p className="text-sm text-[#8b949e]">Paste your API key to continue</p>
        </div>

        {errorMessage && (
          <p className="rounded border border-red-800 bg-red-950/50 px-3 py-2 font-mono text-xs text-red-400">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            placeholder="api key..."
            value={value}
            onChange={e => setValue(e.target.value)}
            className="border-[#30363d] bg-[#0d1117] font-mono text-sm text-[#e6edf3] placeholder:text-[#484f58]"
            autoFocus
          />
          <Button
            type="submit"
            className="w-full bg-[#238636] font-mono text-sm text-white hover:bg-[#2ea043]"
          >
            Enter
          </Button>
        </form>
      </div>
    </div>
  )
}
