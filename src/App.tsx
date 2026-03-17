import { useState, useEffect, useCallback, useRef } from 'react'
import { PasswordSetup } from './components/PasswordSetup'
import { Login } from './components/Login'
import { FileTreeView } from './components/FileTreeView'
import { MarkdownEditor } from './components/MarkdownEditor'
import { Settings } from './components/Settings'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './components/ui/alert-dialog'
import { Folder, FileText, Code, Columns, Eye, SignOut, Check, Gear } from '@phosphor-icons/react'
import { toast, Toaster } from 'sonner'
import { FileTree, ViewMode, FolderNode } from './lib/types'
import {
  hasPasswordSet,
  isAuthenticated,
  setPassword,
  verifyPassword,
  setAuthenticated,
  logout,
} from './lib/auth'
import {
  getFileTree,
  saveFileTree,
  getFileContent,
  saveFileContent,
  getActiveFileId,
  setActiveFileId,
  getViewMode,
  setViewMode as saveViewMode,
  generateId,
  deleteNodeRecursive,
  countWords,
} from './lib/storage'
import { getEditorSettings, EditorSettings, applyTheme } from './lib/settings'
import { cn } from './lib/utils'

function App() {
  const [authState, setAuthState] = useState<'loading' | 'setup' | 'login' | 'authenticated'>('loading')
  const [fileTree, setFileTree] = useState<FileTree>({})
  const [activeFileId, setActiveFileIdState] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState('')
  const [viewMode, setViewModeState] = useState<ViewMode>('source')
  const [isSaving, setIsSaving] = useState(false)
  
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameNodeId, setRenameNodeId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteNodeId, setDeleteNodeId] = useState<string | null>(null)
  
  const [newItemDialog, setNewItemDialog] = useState<{ open: boolean; type: 'file' | 'folder' | null; parentId: string | null }>({
    open: false,
    type: null,
    parentId: null,
  })
  const [newItemName, setNewItemName] = useState('')
  
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(getEditorSettings())
  
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (hasPasswordSet()) {
      if (isAuthenticated()) {
        setAuthState('authenticated')
      } else {
        setAuthState('login')
      }
    } else {
      setAuthState('setup')
    }
  }, [])

  useEffect(() => {
    if (authState === 'authenticated') {
      const tree = getFileTree()
      setFileTree(tree)
      
      const lastActiveId = getActiveFileId()
      if (lastActiveId && tree[lastActiveId]) {
        setActiveFileIdState(lastActiveId)
        setFileContent(getFileContent(lastActiveId))
      }
      
      const savedViewMode = getViewMode()
      setViewModeState(savedViewMode)
      
      const settings = getEditorSettings()
      setEditorSettings(settings)
      applyTheme(settings.colorTheme)
    }
  }, [authState])

  const handleSetupPassword = async (password: string) => {
    await setPassword(password)
    setAuthState('authenticated')
    toast.success('Password set successfully')
  }

  const handleLogin = async (password: string) => {
    const valid = await verifyPassword(password)
    if (valid) {
      setAuthenticated()
      setAuthState('authenticated')
      return true
    }
    return false
  }

  const handleLogout = () => {
    logout()
    setAuthState('login')
    setFileTree({})
    setActiveFileIdState(null)
    setFileContent('')
    toast.success('Logged out')
  }

  const debouncedSave = useCallback((content: string, fileId: string) => {
    setIsSaving(true)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveFileContent(fileId, content)
      setIsSaving(false)
    }, editorSettings.autoSaveDelay)
  }, [editorSettings.autoSaveDelay])

  const handleContentChange = (content: string) => {
    setFileContent(content)
    if (activeFileId) {
      debouncedSave(content, activeFileId)
    }
  }

  const handleFileClick = (fileId: string) => {
    if (activeFileId === fileId) return
    
    if (activeFileId && saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveFileContent(activeFileId, fileContent)
    }
    
    setActiveFileIdState(fileId)
    setActiveFileId(fileId)
    const content = getFileContent(fileId)
    setFileContent(content)
  }

  const handleToggleFolder = (folderId: string) => {
    const folder = fileTree[folderId] as FolderNode
    if (!folder || folder.type !== 'folder') return
    
    const newTree = {
      ...fileTree,
      [folderId]: { ...folder, expanded: !folder.expanded },
    }
    setFileTree(newTree)
    saveFileTree(newTree)
  }

  const handleNewItem = (type: 'file' | 'folder', parentId: string | null) => {
    setNewItemDialog({ open: true, type, parentId })
    setNewItemName('')
  }

  const handleCreateItem = () => {
    const { type, parentId } = newItemDialog
    if (!type || !newItemName.trim()) return
    
    let name = newItemName.trim()
    if (type === 'file' && !name.endsWith('.md')) {
      name += '.md'
    }
    
    const id = generateId()
    const newTree = {
      ...fileTree,
      [id]: type === 'file'
        ? { id, name, type: 'file' as const, parentId }
        : { id, name, type: 'folder' as const, parentId, expanded: true },
    }
    
    setFileTree(newTree)
    saveFileTree(newTree)
    
    if (type === 'file') {
      saveFileContent(id, '')
      handleFileClick(id)
    }
    
    setNewItemDialog({ open: false, type: null, parentId: null })
    toast.success(`${type === 'file' ? 'File' : 'Folder'} created`)
  }

  const handleRename = (nodeId: string) => {
    const node = fileTree[nodeId]
    if (!node) return
    
    setRenameNodeId(nodeId)
    setRenameValue(node.name)
    setRenameDialogOpen(true)
  }

  const handleRenameConfirm = () => {
    if (!renameNodeId || !renameValue.trim()) return
    
    const node = fileTree[renameNodeId]
    if (!node) return
    
    let name = renameValue.trim()
    if (node.type === 'file' && !name.endsWith('.md')) {
      name += '.md'
    }
    
    const newTree = {
      ...fileTree,
      [renameNodeId]: { ...node, name },
    }
    
    setFileTree(newTree)
    saveFileTree(newTree)
    setRenameDialogOpen(false)
    toast.success('Renamed successfully')
  }

  const handleDelete = (nodeId: string) => {
    setDeleteNodeId(nodeId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!deleteNodeId) return
    
    if (deleteNodeId === activeFileId) {
      setActiveFileIdState(null)
      setActiveFileId(null)
      setFileContent('')
    }
    
    const newTree = deleteNodeRecursive(fileTree, deleteNodeId)
    setFileTree(newTree)
    saveFileTree(newTree)
    setDeleteDialogOpen(false)
    toast.success('Deleted successfully')
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewModeState(mode)
    saveViewMode(mode)
  }

  const handleMove = (nodeId: string, newParentId: string | null) => {
    const node = fileTree[nodeId]
    if (!node) return
    
    if (node.parentId === newParentId) return
    
    const newTree = {
      ...fileTree,
      [nodeId]: { ...node, parentId: newParentId },
    }
    
    setFileTree(newTree)
    saveFileTree(newTree)
    toast.success('Moved successfully')
  }

  const handleSettingsChange = (newSettings: EditorSettings) => {
    setEditorSettings(newSettings)
  }

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (authState === 'setup') {
    return <PasswordSetup onPasswordSet={handleSetupPassword} />
  }

  if (authState === 'login') {
    return <Login onLogin={handleLogin} />
  }

  const activeFile = activeFileId ? fileTree[activeFileId] : null
  const wordCount = activeFile ? countWords(fileContent) : 0

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Toaster position="top-right" />
      
      <div className="h-12 border-b border-border flex items-center px-3 gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNewItem('folder', null)}
            className="gap-2"
          >
            <Folder size={16} />
            <span className="hidden md:inline">Folder</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNewItem('file', null)}
            className="gap-2"
          >
            <FileText size={16} />
            <span className="hidden md:inline">File</span>
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === 'source' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('source')}
            className="gap-2"
          >
            <Code size={16} />
            <span className="hidden md:inline">Source</span>
          </Button>
          <Button
            variant={viewMode === 'split' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('split')}
            className="gap-2"
          >
            <Columns size={16} />
            <span className="hidden md:inline">Split</span>
          </Button>
          <Button
            variant={viewMode === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('preview')}
            className="gap-2"
          >
            <Eye size={16} />
            <span className="hidden md:inline">Preview</span>
          </Button>
        </div>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSettingsOpen(true)}
          className="gap-2"
        >
          <Gear size={16} />
          <span className="hidden md:inline">Settings</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="gap-2"
        >
          <SignOut size={16} />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div 
          className="border-r border-border overflow-y-auto" 
          style={{ 
            backgroundColor: 'var(--card)',
            width: `${editorSettings.sidebarWidth}px`
          }}
        >
          <FileTreeView
            tree={fileTree}
            activeFileId={activeFileId}
            onFileClick={handleFileClick}
            onToggleFolder={handleToggleFolder}
            onRename={handleRename}
            onDelete={handleDelete}
            onNewFile={(parentId) => handleNewItem('file', parentId)}
            onNewFolder={(parentId) => handleNewItem('folder', parentId)}
            onMove={handleMove}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {activeFile && activeFile.type === 'file' ? (
            <MarkdownEditor
              content={fileContent}
              onChange={handleContentChange}
              viewMode={viewMode}
              fileName={activeFile.name}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--editor-bg)' }}>
              <div className="text-center">
                <FileText size={64} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No file selected</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Select a file from the sidebar or create a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-8 border-t border-border flex items-center px-4 text-xs font-mono text-muted-foreground">
        {activeFile && activeFile.type === 'file' ? (
          <>
            <span>{activeFile.name}</span>
            <span className="mx-2">·</span>
            <span>{wordCount} words</span>
            <span className="mx-2">·</span>
            <span className="flex items-center gap-1.5">
              {isSaving ? 'Saving...' : (
                <>
                  <Check size={14} />
                  Auto-saved
                </>
              )}
            </span>
          </>
        ) : (
          <span>Ready</span>
        )}
      </div>

      <Dialog open={newItemDialog.open} onOpenChange={(open) => setNewItemDialog({ ...newItemDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              New {newItemDialog.type === 'file' ? 'File' : 'Folder'}
            </DialogTitle>
            <DialogDescription>
              Enter a name for the new {newItemDialog.type}
              {newItemDialog.type === 'file' && ' (.md will be added automatically)'}
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder={`Enter ${newItemDialog.type} name`}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateItem()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewItemDialog({ open: false, type: null, parentId: null })}>
              Cancel
            </Button>
            <Button onClick={handleCreateItem} disabled={!newItemName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
            <DialogDescription>
              Enter a new name
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Enter new name"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameConfirm()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameConfirm} disabled={!renameValue.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              {deleteNodeId && fileTree[deleteNodeId]?.type === 'folder'
                ? 'this folder and all its contents'
                : 'this file'}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Settings 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  )
}

export default App
