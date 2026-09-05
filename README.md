# ARIA — Autonomous Research Intelligence Agents

The frontend for [Multi-Agent Task Orchestrator](https://github.com/your-repo/multi-agent-orchestrator) where you type a question, a small team of AI agents (planner, researchers, analyst, reviewer, synthesizer) go work on it together, and you watch them do it live instead of staring at a spinner.

---

## What it actually does

- **Type a research question, watch it get worked on live.** Submit a task and immediately see the AI
  team's plan take shape, where you will see a card per subtask, each one lighting up as it starts, streaming its live search queries as they happen, and flipping to done (or failed, with a reason) in real time over Server-Sent Events. No polling-and-praying.
- **The plan isn't fake.** If your question is broad enough that the planner decides to split it into
  parallel research threads, the UI actually shows that a callout explaining *why* it's running two
  researchers at once, and both cards progressing side by side.
- **Full auth, not a toy login screen.** Register/login, JWT access tokens with automatic silent refresh,
  change your password from a small settings page, and a forgot-password flow that actually works
  end-to-end (see the honesty note about it below).

---

## Design system: "Quiet Console"

The whole app runs on one small set of design tokens defined in `src/index.css` — no separate design-token
package, just CSS custom properties inside Tailwind v4's native `@theme` block. The idea: this is
fundamentally a developer-facing tool (it's showing you live agent status, JSON-shaped output, retry
counts), so monospace is a deliberate, credible signature rather than something to hide but paired with
actual restraint instead of full terminal-hacker aesthetics.

---

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | React 19 + TypeScript, built with Vite |
| Routing | react-router-dom |
| Styling | Tailwind CSS v4 (CSS-native `@theme`, no `tailwind.config.js`) |
| UI primitives | shadcn-style components on top of `@base-ui/react`, variants via `class-variance-authority` |
| Icons | lucide-react |
| Markdown | react-markdown + remark-gfm (GitHub-flavored tables) |
| Animation | tw-animate-css (Tailwind-native enter/exit transitions) |
| Auth state | React Context, no external state library — the app just isn't big enough to need one |

---

## Project structure

```
src/
├── App.tsx                  # route table
├── main.tsx                 # entry point
├── index.css                # the entire design system lives here (Quiet Console tokens)
├── api/
│   └── client.ts            # every backend call: auth, tasks, SSE stream consumption, token refresh
├── context/
│   └── AuthContext.tsx      # who's logged in, login/register/logout
├── hooks/
│   └── useTaskStream.ts     # the real brains of the live-progress UI: fetches a task, opens its SSE
│                             stream, falls back to polling if the stream drops, and turns raw events
│                             into React state
├── lib/
│   ├── status.tsx            # single source of truth for status -> icon/color/label
│   └── utils.ts               # small shared helpers (className merging, etc.)
├── components/
│   ├── AppHeader.tsx          # logo, nav, signed-in user, settings/sign-out
│   ├── AuthGate.tsx           # login/register form, shown wherever an unauthenticated user lands
│   ├── AgentFeed.tsx          # the live per-subtask card feed — the most complex component here
│   ├── TaskSidebar.tsx        # your task history, newest first
│   ├── TaskDetail.tsx         # header + status for one task, wraps AgentFeed + ReportView
│   ├── ReportView.tsx         # renders the final markdown report, plus the download button
│   └── ui/                    # small shadcn-style primitives (button, input, badge, textarea, separator)
└── pages/
    ├── LandingPage.tsx         # marketing home page
    ├── HowItWorksPage.tsx      # interactive step-by-step explainer
    ├── DashboardPage.tsx       # the actual app: sidebar + task detail, once logged in
    ├── ForgotPasswordPage.tsx  # request a reset (see honesty note below)
    ├── ResetPasswordPage.tsx   # redeem a reset token for a new password
    └── ChangePasswordPage.tsx  # change your password while logged in
```

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173, proxies /tasks and /auth to http://localhost:8000
npm run build       # production build
npm run preview     # serve the production build locally
```

You need the [backend](https://github.com/Andresc06/multi-agent-task-orchestrator) running locally on port 8000 for anything to actually work.

---

## Important Note

- **The "forgot password" flow shows you the reset token directly on screen** instead of emailing it, and this is because the backend has no email-sending integration at all. It's a real, working demonstration of the whole reset flow (request → token → new password), just missing the "goes to your inbox" step a real product would have. Clearly labeled in the UI as exactly that.
---

## The backend

This is genuinely half of the project. See [the backend README](https://github.com/Andresc06/multi-agent-task-orchestrator) for the actual multi-agent orchestration, the DAG scheduler, the two-LLM-provider setup with automatic failover, and the security work that this UI is just a window into.
