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
import { toast } from 'sonner'
import { setPassword, verifyPassword } from '../lib/auth'
import { getEditorSettings, saveEditorSettings, EditorSettings } from '../lib/settings'

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
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Change Password</h3>
                <div className="space-y-3">
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
                    className="w-full"
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </div>
            </div>
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
              <div className="space-y-3">
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
