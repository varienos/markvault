import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface TerminalProps {
  collapsed: boolean
  onToggle: () => void
}

interface CommandOutput {
  command: string
  output: string
  timestamp: Date
}

export function Terminal({ collapsed, onToggle }: TerminalProps) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<CommandOutput[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!collapsed && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [collapsed])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const executeCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim()
    if (!trimmedCmd) return

    setCommandHistory(prev => [...prev, trimmedCmd])
    setHistoryIndex(-1)

    const parts = trimmedCmd.split(' ')
    const command = parts[0].toLowerCase()
    const args = parts.slice(1)

    let output = ''

    switch (command) {
      case 'help':
        output = `Available commands:
  help          - Show this help message
  clear         - Clear terminal history
  echo [text]   - Echo text back
  date          - Show current date and time
  
Note: This is a simulated terminal for demonstration.
Advanced CLI tools like 'claude-code' or 'codex' would require
backend integration and are not available in this client-side app.`
        break

      case 'clear':
        setHistory([])
        setInput('')
        return

      case 'echo':
        output = args.join(' ')
        break

      case 'date':
        output = new Date().toString()
        break

      case 'claude-code':
      case 'codex':
      case 'claude':
        output = `Error: '${command}' is not available.

This is a client-side browser application. CLI tools that require
API access, system-level permissions, or backend services cannot
run directly in the browser.

To use AI coding assistants:
1. Use them in your local development environment
2. Integrate with a backend API service
3. Use browser extensions with proper API keys`
        break

      default:
        output = `Command not found: ${command}
Type 'help' for available commands.`
    }

    setHistory(prev => [
      ...prev,
      {
        command: trimmedCmd,
        output,
        timestamp: new Date(),
      },
    ])
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setInput('')
        } else {
          setHistoryIndex(newIndex)
          setInput(commandHistory[newIndex])
        }
      }
    }
  }

  if (collapsed) {
    return null
  }

  return (
    <div className="h-full flex flex-col border-l border-border" style={{ backgroundColor: 'var(--card)' }}>
      <div className="h-10 px-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-mono font-semibold text-xs">Terminal</h3>
          <span className="font-mono text-xs text-muted-foreground">Type 'help' for commands</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-6 w-6 p-0"
        >
          <X size={14} />
        </Button>
      </div>

      <div 
        className="flex-1 overflow-y-auto p-3 font-mono text-xs"
        style={{ backgroundColor: 'var(--editor-bg)' }}
        onClick={() => inputRef.current?.focus()}
      >
        {history.length === 0 && (
          <div className="text-muted-foreground mb-3">
            Welcome to the Terminal. Type 'help' for available commands.
          </div>
        )}

        {history.map((entry, index) => (
          <div key={index} className="mb-3">
            <div className="flex items-center gap-2 text-primary">
              <span>❯</span>
              <span>{entry.command}</span>
            </div>
            {entry.output && (
              <div className="mt-1 pl-4 text-foreground whitespace-pre-wrap">
                {entry.output}
              </div>
            )}
          </div>
        ))}

        <div className="flex items-center gap-2 text-primary">
          <span>❯</span>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex-1 border-0 bg-transparent p-0 h-auto",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "font-mono text-foreground"
            )}
            placeholder="Type a command..."
          />
        </div>

        <div ref={terminalEndRef} />
      </div>
    </div>
  )
}
