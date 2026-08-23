import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Search, Brain, ShieldCheck, PenLine, ArrowRight, Sparkles, Clock, Layers, Quote } from 'lucide-react'

const STEPS = [
  {
    icon: ClipboardList,
    title: 'You ask a question',
    plain: 'Just type what you want to know, in plain English — no special commands or syntax.',
    color: 'text-[#8b949e]',
    hex: '139,148,158',
    ring: 'border-[#8b949e]',
  },
  {
    icon: Brain,
    title: 'A planner breaks it down',
    plain: 'One AI reads your question and figures out what needs to be researched — and whether it should split the work into multiple parallel threads for a broader topic.',
    color: 'text-[#a78bfa]',
    hex: '167,139,250',
    ring: 'border-[#a78bfa]',
  },
  {
    icon: Search,
    title: 'Researchers search the web',
    plain: 'One or more AI researchers go out and search the internet for real, current information — not just guessing from memory.',
    color: 'text-[#58a6ff]',
    hex: '88,166,255',
    ring: 'border-[#58a6ff]',
  },
  {
    icon: ShieldCheck,
    title: 'A reviewer double-checks the work',
    plain: 'Before anything is finalized, a separate AI reviews the research for mistakes, gaps, or claims that aren’t well supported.',
    color: 'text-[#fb923c]',
    hex: '251,146,60',
    ring: 'border-[#fb923c]',
  },
  {
    icon: PenLine,
    title: 'You get one clear report',
    plain: 'Everything gets combined into a single, well-organized answer — written for a person, not a spreadsheet of raw data.',
    color: 'text-[#3fb950]',
    hex: '63,185,80',
    ring: 'border-[#3fb950]',
  },
]

const PRODUCTIVITY_POINTS = [
  {
    icon: Clock,
    title: 'Hours of research, in minutes',
    body: 'What normally means opening a dozen browser tabs and cross-checking sources by hand happens automatically, in parallel, while you do something else.',
  },
  {
    icon: Layers,
    title: 'No more juggling multiple tools',
    body: 'Searching, note-taking, fact-checking, and writing a summary are usually four separate steps. Here they happen in one flow, by one system.',
  },
  {
    icon: ShieldCheck,
    title: 'Fewer mistakes make it to you',
    body: 'The built-in reviewer step catches unsupported claims before they reach your final report — so you spend less time double-checking AI output.',
  },
]

export function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0)
  const step = STEPS[activeStep]

  return (
    <div className="h-full overflow-y-auto">
      <section className="mx-auto max-w-3xl px-6 pb-10 pt-16 text-center">
        <h1 className="animate-in fade-in slide-in-from-bottom-4 font-mono text-3xl font-bold text-[#e6edf3] duration-700">
          How it works
        </h1>
        <p className="animate-in fade-in slide-in-from-bottom-4 mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#8b949e] duration-700 delay-150">
          No technical background needed. Here's the whole process, in five simple steps —
          hover over each one below to see what it does.
        </p>
      </section>

      {/* Interactive pipeline */}
      <section className="mx-auto max-w-4xl px-6 pb-10">
        <div className="flex flex-wrap items-center justify-center gap-y-4 px-2 py-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = i === activeStep
            return (
              <div key={s.title} className="flex shrink-0 items-center">
                <button
                  type="button"
                  onMouseEnter={() => setActiveStep(i)}
                  onFocus={() => setActiveStep(i)}
                  className={`flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-16 sm:w-16 ${
                    isActive ? `${s.ring} bg-[#161b22] scale-110` : 'border-[#21262d] bg-[#0d1117] hover:border-[#30363d]'
                  }`}
                  style={isActive ? { boxShadow: `0 0 24px -6px rgba(${s.hex},0.45)` } : undefined}
                  aria-label={s.title}
                >
                  <Icon size={20} className={isActive ? s.color : 'text-[#484f58]'} />
                </button>
                {i < STEPS.length - 1 && (
                  <ArrowRight size={16} className="mx-2 shrink-0 text-[#21262d] sm:mx-3" />
                )}
              </div>
            )
          })}
        </div>

        {/* Active step description */}
        <div
          key={activeStep}
          className="animate-in fade-in slide-in-from-bottom-2 mx-auto max-w-lg rounded-lg border border-[#21262d] bg-[#161b22] p-6 text-center duration-300"
        >
          <p className={`mb-1 font-mono text-xs uppercase tracking-widest ${step.color}`}>
            Step {activeStep + 1} of {STEPS.length}
          </p>
          <h2 className="mb-2 font-mono text-lg font-semibold text-[#e6edf3]">
            {step.title}
          </h2>
          <p className="text-sm leading-relaxed text-[#8b949e]">
            {step.plain}
          </p>
        </div>
      </section>

      {/* Full written walkthrough for anyone who prefers reading */}
      <section className="mx-auto max-w-2xl px-6 pb-16">
        <h2 className="mb-6 text-center font-mono text-xs uppercase tracking-widest text-[#484f58]">
          The full picture
        </h2>
        <div className="space-y-5">
          {STEPS.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.title} className="flex gap-4">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${s.ring}/40 bg-[#161b22]`}>
                  <Icon size={16} className={s.color} />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-semibold text-[#e6edf3]">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#8b949e]">{s.plain}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* What AI is actually doing the work */}
      <section className="mx-auto max-w-2xl px-6 pb-16">
        <div className="rounded-lg border border-[#21262d] bg-[#161b22] p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-[#f0b429]" />
            <h2 className="font-mono text-sm font-semibold text-[#e6edf3]">Which AI is doing the work?</h2>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-[#8b949e]">
            ARIA doesn't rely on a single model — it uses two of the most capable AI systems
            available today, each assigned to what it's best at:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded border border-[#30363d] bg-[#0d1117] p-4">
              <p className="mb-1 font-mono text-xs font-semibold text-[#e6edf3]">Claude (Anthropic)</p>
              <p className="text-xs leading-relaxed text-[#8b949e]">
                Handles planning and writing the final report — tasks that need careful reasoning
                and clear, trustworthy language.
              </p>
            </div>
            <div className="rounded border border-[#30363d] bg-[#0d1117] p-4">
              <p className="mb-1 font-mono text-xs font-semibold text-[#e6edf3]">Gemini (Google)</p>
              <p className="text-xs leading-relaxed text-[#8b949e]">
                Handles research, analysis, and review — tasks that benefit from fast, efficient
                processing across many sources at once.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Productivity benefit */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <h2 className="mb-2 text-center font-mono text-xs uppercase tracking-widest text-[#484f58]">
          What this means for you
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-center text-sm text-[#8b949e]">
          This isn't just a novelty — it's meant to save you real time on real work.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {PRODUCTIVITY_POINTS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-lg border border-[#21262d] bg-[#161b22] p-5">
              <Icon size={18} className="mb-3 text-[#3fb950]" />
              <h3 className="mb-1.5 font-mono text-sm font-semibold text-[#e6edf3]">{title}</h3>
              <p className="text-xs leading-relaxed text-[#8b949e]">{body}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 flex max-w-lg items-start gap-3 rounded-lg border border-[#21262d] bg-[#161b22] p-5">
          <Quote size={16} className="mt-0.5 shrink-0 text-[#484f58]" />
          <p className="text-sm italic leading-relaxed text-[#8b949e]">
            Think of it like handing your question to a small research team instead of one person —
            everyone plays a different role, and the result is checked before it reaches you.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to="/app"
            className="rounded bg-[#238636] px-5 py-2.5 font-mono text-sm font-semibold text-white transition-colors hover:bg-[#2ea043]"
          >
            Try it yourself →
          </Link>
        </div>
      </section>
    </div>
  )
}
