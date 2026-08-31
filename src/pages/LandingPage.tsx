import { Link } from 'react-router-dom'
import { ChevronRight, Workflow, Search, Brain, ShieldCheck, FileText, Zap, GitBranch } from 'lucide-react'

// Per-card colors are intentionally kept (not collapsed to one accent) to
// preserve visual interest on this lower-stakes marketing page, but muted
// down from their original saturation, and none of the four reuse the app's
// real semantic --color-success green - that stays reserved for actual
// completed/approved states in the dashboard.
const VALUE_PROPS = [
  {
    icon: Search,
    title: 'Real, grounded research',
    body: 'Every answer is backed by live web searches, not just what the model already "knows." Sources are cited, so you can verify anything.',
    color: 'text-[#6e93b8]',
    border: 'border-[#6e93b8]/30',
  },
  {
    icon: GitBranch,
    title: 'Splits complex questions apart',
    body: 'Broad topics get broken into parallel research threads automatically — instead of one shallow pass, you get several focused ones running at once.',
    color: 'text-[#9b8bb0]',
    border: 'border-[#9b8bb0]/30',
  },
  {
    icon: ShieldCheck,
    title: 'Self-checking, not just self-reporting',
    body: 'A dedicated reviewer agent checks the research for gaps and unsupported claims before anything reaches the final report.',
    color: 'text-[#b98f6a]',
    border: 'border-[#b98f6a]/30',
  },
  {
    icon: FileText,
    title: 'One clear report, not a wall of chat',
    body: 'Instead of scrolling a chat log, you get a single structured report with the findings organized and synthesized for you.',
    color: 'text-[#6ba39c]',
    border: 'border-[#6ba39c]/30',
  },
]

export function LandingPage() {
  return (
    <div className="h-full overflow-y-auto">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-emphasis/40 bg-accent-emphasis/10 animate-in fade-in zoom-in duration-700">
            <Workflow size={26} className="text-accent" />
          </div>
        </div>
        <h1 className="animate-in fade-in slide-in-from-bottom-4 font-mono text-3xl font-bold text-fg duration-700 sm:text-4xl">
          Research that works like a team,<br />not a search bar
        </h1>
        <p className="animate-in fade-in slide-in-from-bottom-4 mx-auto mt-5 max-w-xl text-base leading-relaxed text-fg-muted duration-700 delay-150">
          ARIA is a team of specialized AI agents — a planner, researchers, an analyst, a reviewer, and a writer — that collaborate in real time to answer real research questions thoroughly and honestly.
        </p>
        <div className="animate-in fade-in slide-in-from-bottom-4 mt-8 flex justify-center gap-3 duration-700 delay-300">
          <Link
            to="/app"
            className="rounded-lg bg-accent-emphasis px-5 py-2.5 font-mono text-sm font-semibold text-white transition-colors hover:bg-accent"
          >
            Launch the app →
          </Link>
          <Link
            to="/how-it-works"
            className="rounded-lg border border-hairline-strong px-5 py-2.5 font-mono text-sm text-fg-body transition-colors hover:border-accent/50 hover:text-fg"
          >
            See how it works
          </Link>
        </div>
      </section>

      {/* Why it matters */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <h2 className="mb-2 text-center font-mono text-xs uppercase tracking-widest text-fg-subtle">
          Why this beats asking a single chatbot
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-center text-sm text-fg-muted">
          A single AI answering from memory can be confidently wrong. ARIA is built so that
          research, verification, and writing are separate, accountable steps — the same way
          a real research team works.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {VALUE_PROPS.map(({ icon: Icon, title, body, color, border }, i) => (
            <div
              key={title}
              className={`animate-in fade-in slide-in-from-bottom-2 rounded-xl border ${border} bg-surface p-5 duration-500`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Icon size={20} className={`mb-3 ${color}`} />
              <h3 className="mb-1.5 font-mono text-sm font-semibold text-fg">{title}</h3>
              <p className="text-xs leading-relaxed text-fg-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="rounded-xl border border-hairline bg-surface p-6">
          <div className="mb-4 flex items-center gap-2">
            <Zap size={16} className="text-fg-muted" />
            <h2 className="font-mono text-sm font-semibold text-fg">Built for real research work</h2>
          </div>
          <ul className="grid gap-2 text-sm text-fg-muted sm:grid-cols-2">
            <li className="flex items-start gap-1.5">
              <ChevronRight size={14} className="mt-0.5 shrink-0 text-fg-subtle" />
              Market or competitor research
            </li>
            <li className="flex items-start gap-1.5">
              <ChevronRight size={14} className="mt-0.5 shrink-0 text-fg-subtle" />
              Technical due diligence on a technology
            </li>
            <li className="flex items-start gap-1.5">
              <ChevronRight size={14} className="mt-0.5 shrink-0 text-fg-subtle" />
              Literature-style summaries on current events
            </li>
            <li className="flex items-start gap-1.5">
              <ChevronRight size={14} className="mt-0.5 shrink-0 text-fg-subtle" />
              Comparing options before a decision
            </li>
          </ul>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-fg-subtle">
          <Brain size={14} />
          <span className="font-mono text-xs">Powered by Claude & Gemini, working together</span>
        </div>
      </section>
    </div>
  )
}
