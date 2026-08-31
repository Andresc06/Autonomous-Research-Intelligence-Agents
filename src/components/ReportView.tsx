import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Download, FileText } from 'lucide-react'

interface Props {
  markdown: string
  filename: string
}

function downloadMarkdown(markdown: string, filename: string) {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function ReportView({ markdown, filename }: Props) {
  return (
    <div className="mt-6 border-t border-hairline pt-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-fg-muted">
          <FileText size={12} />
          Final Report
        </p>
        <button
          type="button"
          onClick={() => downloadMarkdown(markdown, filename)}
          className="flex items-center gap-1.5 rounded-lg border border-hairline-strong px-2.5 py-1 font-mono text-xs text-fg-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          <Download size={12} />
          Download .md
        </button>
      </div>
      <div className="prose prose-invert max-w-none prose-headings:font-mono prose-headings:text-fg prose-p:text-fg-body prose-p:leading-relaxed prose-code:rounded prose-code:bg-surface prose-code:px-1 prose-code:font-mono prose-code:text-accent prose-pre:rounded-lg prose-pre:border prose-pre:border-hairline prose-pre:bg-surface prose-strong:text-fg prose-li:text-fg-body prose-table:text-sm prose-thead:border-b prose-thead:border-hairline prose-th:text-fg prose-td:border-t prose-td:border-hairline prose-tr:border-hairline">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </div>
  )
}
