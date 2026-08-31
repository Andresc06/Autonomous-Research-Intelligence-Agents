import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FileText } from 'lucide-react'

interface Props {
  markdown: string
}

export function ReportView({ markdown }: Props) {
  return (
    <div className="mt-6 border-t border-hairline pt-6">
      <p className="mb-4 flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-fg-muted">
        <FileText size={12} />
        Final Report
      </p>
      <div className="prose prose-invert max-w-none prose-headings:font-mono prose-headings:text-fg prose-p:text-fg-body prose-p:leading-relaxed prose-code:rounded prose-code:bg-surface prose-code:px-1 prose-code:font-mono prose-code:text-accent prose-pre:rounded-lg prose-pre:border prose-pre:border-hairline prose-pre:bg-surface prose-strong:text-fg prose-li:text-fg-body prose-table:text-sm prose-thead:border-b prose-thead:border-hairline prose-th:text-fg prose-td:border-t prose-td:border-hairline prose-tr:border-hairline">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </div>
  )
}
