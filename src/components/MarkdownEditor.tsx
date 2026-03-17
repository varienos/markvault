import { useEffect, useRef, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { marked } from 'marked'
import { ViewMode } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  viewMode: ViewMode
  fileName: string
}

export function MarkdownEditor({ content, onChange, viewMode, fileName }: MarkdownEditorProps) {
  const [renderedHtml, setRenderedHtml] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const renderMarkdown = async () => {
      try {
        const html = await marked(content || '')
        setRenderedHtml(html)
      } catch (error) {
        setRenderedHtml('<p>Error rendering markdown</p>')
      }
    }
    renderMarkdown()
  }, [content])

  if (viewMode === 'preview') {
    return (
      <div className="h-full overflow-auto p-6" style={{ backgroundColor: 'var(--editor-bg)' }}>
        <div
          className="markdown-preview max-w-4xl mx-auto"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
    )
  }

  if (viewMode === 'split') {
    return (
      <div className="h-full flex">
        <div className="flex-1 overflow-auto border-r border-border">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              'w-full h-full resize-none border-0 rounded-none font-mono text-sm p-6',
              'focus-visible:ring-0 focus-visible:ring-offset-0'
            )}
            style={{ backgroundColor: 'var(--editor-bg)' }}
            placeholder="# Start writing markdown..."
            spellCheck={false}
          />
        </div>
        <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: 'var(--editor-bg)' }}>
          <div
            className="markdown-preview max-w-full"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full h-full resize-none border-0 rounded-none font-mono text-sm p-6',
          'focus-visible:ring-0 focus-visible:ring-offset-0'
        )}
        style={{ backgroundColor: 'var(--editor-bg)' }}
        placeholder="# Start writing markdown..."
        spellCheck={false}
      />
    </div>
  )
}
