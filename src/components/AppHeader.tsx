import { NavLink } from 'react-router-dom'
import { Workflow } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `font-mono text-xs uppercase tracking-wider transition-colors ${
    isActive ? 'text-[#e6edf3]' : 'text-[#484f58] hover:text-[#8b949e]'
  }`

export function AppHeader() {
  const { isAuthenticated, userEmail, logout } = useAuth()

  return (
    <header className="shrink-0 border-b border-[#21262d] bg-[#0d1117] px-6 py-3">
      <div className="flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1f6feb]/40 bg-[#1f6feb]/10">
            <Workflow size={16} className="text-[#58a6ff]" />
          </div>
          <div>
            <span className="font-mono text-sm font-bold tracking-widest text-[#e6edf3]">ARIA</span>
            <span className="ml-3 hidden font-mono text-xs text-[#484f58] sm:inline">
              Autonomous Research Intelligence Agents
            </span>
          </div>
        </NavLink>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/how-it-works" className={navLinkClass}>How It Works</NavLink>
            <NavLink to="/app" className={navLinkClass}>Launch App</NavLink>
          </nav>

          {isAuthenticated && (
            <div className="flex items-center gap-3 border-l border-[#21262d] pl-6">
              <span className="hidden font-mono text-xs text-[#484f58] sm:inline">{userEmail}</span>
              <button
                type="button"
                onClick={() => void logout()}
                className="font-mono text-xs uppercase tracking-wider text-[#484f58] transition-colors hover:text-[#f85149]"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
