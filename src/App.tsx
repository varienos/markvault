import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PasswordSetup } from './components/PasswordSetup'
import { Login } from './components/Login'
import { FileTreeView } from './components/FileTreeView'
import { MarkdownEditor } from './components/MarkdownEditor'
import { Settings } from './components/Settings'
import { Terminal } from './components/Terminal'
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
import { Folder, FileText, Code, Columns, Eye, SignOut, Check, Gear, TerminalWindow, SidebarSimple } from '@phosphor-icons/react'
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
  getSidebarCollapsed,
  setSidebarCollapsed,
  getTerminalCollapsed,
  setTerminalCollapsed,
  getLeftSidebarWidth,
  setLeftSidebarWidth,
  getRightSidebarWidth,
  setRightSidebarWidth,
} from './lib/storage'
import { getEditorSettings, EditorSettings, applyTheme } from './lib/settings'

  const [authState, setAuthState] = useState<'loading' | 'setup' | 'login' | 'authenticated'>('loading')
  const [fileTree, setFileTree] = useState<FileTree>({})
  const [activeFileId, setActiveFileIdState] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState('')
  const [viewMode, setViewModeState] = useState<ViewMode>('source')
  const [isSaving, setIsSaving] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false)
  const [terminalCollapsed, setTerminalCollapsedState] = useState(false)
  const [terminalCollapsed, setTerminalCollapsedState] = useState(false)
  const [leftWidth, setLeftWidth] = useState(280)
  const [rightWidth, setRightWidth] = useState(400)
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
  const leftResizeRef = useRef<HTMLDivElement>(null)
  const leftResizeRef = useRef<HTMLDivElement>(null))
  const rightResizeRef = useRef<HTMLDivElement>(null)
  const isResizingLeft = useRef(false)
  const isResizingRight = useRef(false)

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
      
      const savedSidebarCollapsed = getSidebarCollapsed()
      setSidebarCollapsedState(savedSidebarCollapsed)
      
      const savedTerminalCollapsed = getTerminalCollapsed()
      const savedTerminalCollapsed = getTerminalCollapsed()
      setTerminalCollapsedState(savedTerminalCollapsed)
      
      const savedLeftWidth = getLeftSidebarWidth()
      setLeftWidth(savedLeftWidth)
      
      const savedRightWidth = getRightSidebarWidth()
      setRightWidth(savedRightWidth)
      
      setEditorSettings(settings)
      applyTheme(settings.colorTheme)
    }
  }, [authState])

  useEffect(() => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft.current) {
        const newWidth = Math.max(200, Math.min(600, e.clientX))
        setLeftWidth(newWidth)
      }
      if (isResizingRight.current) {
        const newWidth = Math.max(300, Math.min(800, window.innerWidth - e.clientX))
        setRightWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      if (isResizingLeft.current) {
        isResizingLeft.current = false
        setLeftSidebarWidth(leftWidth)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
      if (isResizingRight.current) {
        isResizingRight.current = false
        setRightSidebarWidth(rightWidth)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [leftWidth, rightWidth])

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

  const handleToggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsedState(newState)
    setSidebarCollapsed(newState)
  }

  const handleToggleTerminal = () => {
  const handleToggleTerminal = () => {
    const newState = !terminalCollapsed
    setTerminalCollapsedState(newState)
    setTerminalCollapsed(newState)
  }

  const handleLeftResizeStart = () => {
    isResizingLeft.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handleRightResizeStart = () => {
    isResizingRight.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

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
      
      <div className="h-12 border-b border-border flex items-center px-3 gap-4 flex-shrink-0">
      <div className="h-12 border-b border-border flex items-center px-3 gap-4 flex-shrink-0">
          variant="ghost"
          size="sm"
          onClick={handleToggleSidebar}
          className="gap-2"
        >
          <SidebarSimple size={16} />
        </Button>

        <div className="h-6 w-px bg-border" />

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
          variant={terminalCollapsed ? 'ghost' : 'default'}
          variant={terminalCollapsed ? 'ghost' : 'default'}
          onClick={handleToggleTerminal}
          onClick={handleToggleTerminal}
        >
          <TerminalWindow size={16} />
          <span className="hidden md:inline">Terminal</span>
        </Button>

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
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: leftWidth, 
                width: leftWidth, 
              }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ 
                type: 'tween',
                duration: 0.2,
                ease: 'easeInOut'
              }}
              className="border-r border-border overflow-y-auto relative" 
              className="border-r border-border overflow-y-auto relative" 
                backgroundColor: 'var(--card)',
                width: leftWidth,
                width: leftWidth,
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
              <div
              <div
                ref={leftResizeRef}
                onMouseDown={handleLeftResizeStart}
                className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 transition-colors"
                style={{ zIndex: 10 }}
              />
          )}
        </AnimatePresence>

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


        <AnimatePresence initial={false}>
          {!terminalCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: rightWidth, 
                opacity: 1 
              }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ 
                type: 'tween',
                duration: 0.2,
                ease: 'easeInOut'
              }}
              className="relative" 
              style={{ 
                width: rightWidth,
              }}
            >
              <div
                ref={rightResizeRef}
                onMouseDown={handleRightResizeStart}
                className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-primary/50 transition-colors"
                style={{ zIndex: 10 }}
              />
              <Terminal 
                collapsed={terminalCollapsed}
                onToggle={handleToggleTerminal}
              />
            </motion.div>
          )}
        </AnimatePresence>

      <div className="h-8 border-t border-border flex items-center px-4 text-xs font-mono text-muted-foreground flex-shrink-0">
      <div className="h-8 border-t border-border flex items-center px-4 text-xs font-mono text-muted-foreground flex-shrink-0">
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
