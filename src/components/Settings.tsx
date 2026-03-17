import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Switch } from './ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { Card } from './ui/card'
import { toast } from 'sonner'
import { setPassword, verifyPassword } from '../lib/auth'
import { getEditorSettings, saveEditorSettings, EditorSettings, ColorTheme, applyTheme } from '../lib/settings'
import { cn } from '../lib/utils'

interface SettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSettingsChange?: (settings: EditorSettings) => void
}

export function Settings({ open, onOpenChange, onSettingsChange }: SettingsProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  const [settings, setSettings] = useState<EditorSettings>(getEditorSettings())

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 4) {
      toast.error('Password must be at least 4 characters')
      return
    }

    setIsChangingPassword(true)

    const isValid = await verifyPassword(currentPassword)
    if (!isValid) {
      toast.error('Current password is incorrect')
      setIsChangingPassword(false)
      return
    }

    await setPassword(newPassword)
    toast.success('Password changed successfully')
    
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setIsChangingPassword(false)
  }

  const handleSettingChange = <K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    saveEditorSettings(newSettings)
    onSettingsChange?.(newSettings)
    toast.success('Setting saved')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your password and editor preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-4 mt-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Change Password</h3>
                  <p className="text-sm text-muted-foreground mb-6">Update your account password</p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        onKeyDown={(e) => e.key === 'Enter' && handlePasswordChange()}
                      />
                    </div>
                    <Button
                      onClick={handlePasswordChange}
                      disabled={isChangingPassword}
                      className="w-full mt-2"
                    >
                      {isChangingPassword ? 'Changing...' : 'Change Password'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4 mt-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Font Size</Label>
                    <p className="text-xs text-muted-foreground">
                      Adjust the editor text size
                    </p>
                  </div>
                  <Select
                    value={settings.fontSize.toString()}
                    onValueChange={(value) => handleSettingChange('fontSize', parseInt(value))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12px</SelectItem>
                      <SelectItem value="13">13px</SelectItem>
                      <SelectItem value="14">14px</SelectItem>
                      <SelectItem value="15">15px</SelectItem>
                      <SelectItem value="16">16px</SelectItem>
                      <SelectItem value="18">18px</SelectItem>
                      <SelectItem value="20">20px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tab Size</Label>
                    <p className="text-xs text-muted-foreground">
                      Number of spaces per tab
                    </p>
                  </div>
                  <Select
                    value={settings.tabSize.toString()}
                    onValueChange={(value) => handleSettingChange('tabSize', parseInt(value))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Word Wrap</Label>
                    <p className="text-xs text-muted-foreground">
                      Wrap long lines automatically
                    </p>
                  </div>
                  <Switch
                    checked={settings.wordWrap}
                    onCheckedChange={(checked) => handleSettingChange('wordWrap', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Save Delay</Label>
                    <p className="text-xs text-muted-foreground">
                      Delay before auto-saving (milliseconds)
                    </p>
                  </div>
                  <Select
                    value={settings.autoSaveDelay.toString()}
                    onValueChange={(value) => handleSettingChange('autoSaveDelay', parseInt(value))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100ms</SelectItem>
                      <SelectItem value="300">300ms</SelectItem>
                      <SelectItem value="500">500ms</SelectItem>
                      <SelectItem value="1000">1000ms</SelectItem>
                      <SelectItem value="2000">2000ms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Line Numbers</Label>
                    <p className="text-xs text-muted-foreground">
                      Show line numbers in editor
                    </p>
                  </div>
                  <Switch
                    checked={settings.showLineNumbers}
                    onCheckedChange={(checked) => handleSettingChange('showLineNumbers', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Color Theme</Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">
                    Choose your editor color scheme
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {(['midnight', 'ocean', 'forest', 'sunset', 'monochrome', 'manta'] as ColorTheme[]).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => {
                          handleSettingChange('colorTheme', theme)
                          applyTheme(theme)
                        }}
                        className={cn(
                          'relative rounded-lg border-2 p-3 text-left transition-all hover:shadow-md',
                          settings.colorTheme === theme
                            ? 'border-primary shadow-sm'
                            : 'border-border hover:border-muted-foreground/30'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn(
                            'h-5 w-5 rounded-full border-2',
                            settings.colorTheme === theme ? 'border-primary' : 'border-muted'
                          )}>
                            {settings.colorTheme === theme && (
                              <div className="h-full w-full rounded-full bg-primary scale-[0.6]" />
                            )}
                          </div>
                          <span className="font-medium capitalize">{theme}</span>
                        </div>
                        <div className="flex gap-1.5">
                          {theme === 'midnight' && (
                            <>
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.15 0.02 250)' }} />
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.70 0.15 220)' }} />
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.25 0.03 240)' }} />
                            </>
                          )}
                          {theme === 'ocean' && (
                            <>
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.12 0.03 220)' }} />
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.65 0.18 200)' }} />
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.60 0.20 190)' }} />
                            </>
                          )}
                          {theme === 'forest' && (
                            <>
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.14 0.03 140)' }} />
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.62 0.15 145)' }} />
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.68 0.18 160)' }} />
                            </>
                          )}
                          {theme === 'sunset' && (
                            <>
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.16 0.03 30)' }} />
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.68 0.20 40)' }} />
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.72 0.22 50)' }} />
                            </>
                          )}
                          {theme === 'monochrome' && (
                            <>
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.12 0 0)' }} />
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.50 0 0)' }} />
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.85 0 0)' }} />
                            </>
                          )}
                          {theme === 'manta' && (
                            <>
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.10 0.04 280)' }} />
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.60 0.24 290)' }} />
                              <div className="h-6 flex-1 rounded" style={{ background: 'oklch(0.70 0.26 310)' }} />
                            </>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sidebar Width</Label>
                    <p className="text-xs text-muted-foreground">
                      Width of the file sidebar
                    </p>
                  </div>
                  <Select
                    value={settings.sidebarWidth.toString()}
                    onValueChange={(value) => handleSettingChange('sidebarWidth', parseInt(value))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="200">200px</SelectItem>
                      <SelectItem value="250">250px</SelectItem>
                      <SelectItem value="300">300px</SelectItem>
                      <SelectItem value="350">350px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      Reduce spacing in file tree
                    </p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show File Extensions</Label>
                    <p className="text-xs text-muted-foreground">
                      Display .md extension in file tree
                    </p>
                  </div>
                  <Switch
                    checked={settings.showFileExtensions}
                    onCheckedChange={(checked) => handleSettingChange('showFileExtensions', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Smooth Scrolling</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable smooth scrolling in preview
                    </p>
                  </div>
                  <Switch
                    checked={settings.smoothScrolling}
                    onCheckedChange={(checked) => handleSettingChange('smoothScrolling', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
