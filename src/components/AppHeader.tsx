import { NavLink } from 'react-router-dom'
import { Network, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `font-mono text-xs uppercase tracking-wider transition-colors ${
    isActive ? 'text-fg' : 'text-fg-subtle hover:text-fg-muted'
  }`

export function AppHeader() {
  const { isAuthenticated, userEmail, logout } = useAuth()

  return (
    <header className="shrink-0 border-b border-hairline bg-canvas px-6 py-3">
      <div className="flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-accent-emphasis/40 bg-accent-emphasis/10">
            <Network size={16} className="text-accent" />
          </div>
          <div>
            <span className="font-mono text-sm font-bold tracking-widest text-fg">ARIA</span>
            <span className="ml-3 hidden font-mono text-xs text-fg-subtle sm:inline">
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
            <div className="flex items-center gap-3 border-l border-hairline pl-6">
              <span className="hidden font-mono text-xs text-fg-subtle sm:inline">{userEmail}</span>
              <NavLink
                to="/change-password"
                className="text-fg-subtle transition-colors hover:text-accent"
                aria-label="Change password"
              >
                <Settings size={14} />
              </NavLink>
              <button
                type="button"
                onClick={() => void logout()}
                className="font-mono text-xs uppercase tracking-wider text-fg-subtle transition-colors hover:text-danger"
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
