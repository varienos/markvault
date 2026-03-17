import { FileTree, TreeNode, ViewMode } from './types'
import { STORAGE_KEYS } from './auth'
import { syncTree, syncFileContent, syncDeleteFile, syncState } from './api'

export function generateId(): string {
  return crypto.randomUUID()
}

export function getFileTree(): FileTree {
  const stored = localStorage.getItem(STORAGE_KEYS.FILE_TREE)
  if (!stored) return {}
  try {
    return JSON.parse(stored)
  } catch {
    return {}
  }
}

export function saveFileTree(tree: FileTree): void {
  localStorage.setItem(STORAGE_KEYS.FILE_TREE, JSON.stringify(tree))
  syncTree(tree)
}

export function getFileContent(fileId: string): string {
  return localStorage.getItem(`md_file_content_${fileId}`) || ''
}

export function saveFileContent(fileId: string, content: string): void {
  localStorage.setItem(`md_file_content_${fileId}`, content)
  syncFileContent(fileId, content)
}

export function deleteFileContent(fileId: string): void {
  localStorage.removeItem(`md_file_content_${fileId}`)
  syncDeleteFile(fileId)
}

export function getActiveFileId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_FILE)
}

export function setActiveFileId(fileId: string | null): void {
  if (fileId === null) {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_FILE)
  } else {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_FILE, fileId)
  }
  syncState({ activeFile: fileId })
}

export function getViewMode(): ViewMode {
  const stored = localStorage.getItem(STORAGE_KEYS.VIEW_MODE)
  if (stored === 'source' || stored === 'split' || stored === 'preview') {
    return stored
  }
  return 'source'
}

export function setViewMode(mode: ViewMode): void {
  localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode)
  syncState({ viewMode: mode })
}

export function getChildNodes(tree: FileTree, parentId: string | null): TreeNode[] {
  return Object.values(tree)
    .filter(node => node.parentId === parentId)
    .sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name)
      }
      return a.type === 'folder' ? -1 : 1
    })
}

export function deleteNodeRecursive(tree: FileTree, nodeId: string): FileTree {
  let newTree = { ...tree }
  const node = newTree[nodeId]
  
  if (!node) return newTree
  
  if (node.type === 'folder') {
    const children = getChildNodes(newTree, nodeId)
    children.forEach(child => {
      if (child.type === 'file') {
        deleteFileContent(child.id)
      }
      newTree = deleteNodeRecursive(newTree, child.id)
    })
  } else {
    deleteFileContent(nodeId)
  }
  
  delete newTree[nodeId]
  return newTree
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

export function getSidebarCollapsed(): boolean {
  return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true'
}

export function setSidebarCollapsed(collapsed: boolean): void {
  localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed.toString())
  syncState({ sidebarCollapsed: collapsed })
}

export function getTerminalCollapsed(): boolean {
  return localStorage.getItem(STORAGE_KEYS.TERMINAL_COLLAPSED) === 'true'
}

export function setTerminalCollapsed(collapsed: boolean): void {
  localStorage.setItem(STORAGE_KEYS.TERMINAL_COLLAPSED, collapsed.toString())
  syncState({ terminalCollapsed: collapsed })
}

export function getLeftSidebarWidth(): number {
  const stored = localStorage.getItem(STORAGE_KEYS.LEFT_SIDEBAR_WIDTH)
  return stored ? parseInt(stored, 10) : 280
}

export function setLeftSidebarWidth(width: number): void {
  localStorage.setItem(STORAGE_KEYS.LEFT_SIDEBAR_WIDTH, width.toString())
  syncState({ leftSidebarWidth: width })
}

export function getRightSidebarWidth(): number {
  const stored = localStorage.getItem(STORAGE_KEYS.RIGHT_SIDEBAR_WIDTH)
  return stored ? parseInt(stored, 10) : 400
}

export function setRightSidebarWidth(width: number): void {
  localStorage.setItem(STORAGE_KEYS.RIGHT_SIDEBAR_WIDTH, width.toString())
  syncState({ rightSidebarWidth: width })
}
