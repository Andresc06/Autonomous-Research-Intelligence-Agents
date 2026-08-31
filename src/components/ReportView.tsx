import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  markdown: string
}

export function ReportView({ markdown }: Props) {
  return (
    <div className="mt-6 border-t border-[#30363d] pt-6">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#8b949e]">
        ── Final Report
      </p>
      <div className="prose prose-invert max-w-none prose-headings:font-mono prose-headings:text-[#e6edf3] prose-p:text-[#c9d1d9] prose-p:leading-relaxed prose-code:rounded prose-code:bg-[#161b22] prose-code:px-1 prose-code:font-mono prose-code:text-[#58a6ff] prose-pre:border prose-pre:border-[#30363d] prose-pre:bg-[#161b22] prose-strong:text-[#e6edf3] prose-li:text-[#c9d1d9] prose-table:text-sm prose-thead:border-b prose-thead:border-[#30363d] prose-th:text-[#e6edf3] prose-td:border-t prose-td:border-[#30363d] prose-tr:border-[#30363d]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </div>
  )
}
