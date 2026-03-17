import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LockKey } from '@phosphor-icons/react'

interface PasswordSetupProps {
  onPasswordSet: (password: string) => void
}

export function PasswordSetup({ onPasswordSet }: PasswordSetupProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    onPasswordSet(password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-lg bg-accent/10 flex items-center justify-center">
            <LockKey size={32} className="text-accent" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground">Set Your Password</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Create a password to secure your markdown editor
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              className="bg-secondary border-border"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setError('')
              }}
              className="bg-secondary border-border"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <Button type="submit" className="w-full" size="lg">
            Create Password
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          ⚠️ This password cannot be recovered. Keep it safe.
        </p>
      </div>
    </div>
  )
}
