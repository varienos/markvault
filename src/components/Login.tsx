import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LockKey } from '@phosphor-icons/react'

interface LoginProps {
  onLogin: (password: string) => Promise<boolean>
}

export function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    const success = await onLogin(password)
    
    if (!success) {
      setError('Incorrect password')
      setPassword('')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-lg bg-accent/10 flex items-center justify-center">
            <LockKey size={32} className="text-accent" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground">Markdown Editor</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your password to continue
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              className="bg-secondary border-border"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading || !password}>
            {isLoading ? 'Verifying...' : 'Unlock'}
          </Button>
        </form>
      </div>
    </div>
  )
}
