import { FileTree, TreeNode } from '@/lib/types'
import { getChildNodes } from '@/lib/storage'
import { Folder, FileText, CaretRight, CaretDown } from '@phosphor-icons/react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface FileTreeNodeProps {
  node: TreeNode
  tree: FileTree
  activeFileId: string | null
  onFileClick: (fileId: string) => void
  onToggleFolder: (folderId: string) => void
  onRename: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  onNewFile: (parentId: string) => void
  onNewFolder: (parentId: string) => void
  onMove: (nodeId: string, newParentId: string | null) => void
  level: number
}

function FileTreeNode({
  node,
  tree,
  activeFileId,
  onFileClick,
  onToggleFolder,
  onRename,
  onDelete,
  onNewFile,
  onNewFolder,
  onMove,
  level,
}: FileTreeNodeProps) {
  const isFile = node.type === 'file'
  const isFolder = node.type === 'folder'
  const isExpanded = isFolder && node.expanded
  const isActive = isFile && node.id === activeFileId
  const children = isFolder ? getChildNodes(tree, node.id) : []
  
  const [isDragOver, setIsDragOver] = useState(false)

  const handleClick = () => {
    if (isFile) {
      onFileClick(node.id)
    } else {
      onToggleFolder(node.id)
    }
  }
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('nodeId', node.id)
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    if (!isFolder) return
    
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    if (!isFolder) return
    
    const draggedNodeId = e.dataTransfer.getData('nodeId')
    if (!draggedNodeId || draggedNodeId === node.id) return
    
    const draggedNode = tree[draggedNodeId]
    if (!draggedNode) return
    
    if (draggedNode.type === 'folder') {
      let current: TreeNode | undefined = node
      while (current) {
        if (current.id === draggedNodeId) return
        current = current.parentId ? tree[current.parentId] : undefined
      }
    }
    
    onMove(draggedNodeId, node.id)
  }

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors',
              'hover:bg-muted/50',
              isActive && 'bg-accent/20 border-l-2 border-accent',
              isDragOver && isFolder && 'bg-accent/30 border-2 border-accent border-dashed'
            )}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={handleClick}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isFolder && (
              <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center transition-transform">
                {isExpanded ? (
                  <CaretDown size={14} weight="bold" className="text-muted-foreground" />
                ) : (
                  <CaretRight size={14} weight="bold" className="text-muted-foreground" />
                )}
              </div>
            )}
            {isFile && <div className="flex-shrink-0 w-4" />}
            
            {isFolder ? (
              <Folder size={16} className="text-accent flex-shrink-0" />
            ) : (
              <FileText size={16} className="text-muted-foreground flex-shrink-0" />
            )}
            
            <span className={cn(
              'text-sm truncate',
              isActive ? 'text-foreground font-medium' : 'text-foreground'
            )}>
              {node.name}
            </span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {isFolder && (
            <>
              <ContextMenuItem onClick={() => onNewFile(node.id)}>
                New File
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onNewFolder(node.id)}>
                New Folder
              </ContextMenuItem>
            </>
          )}
          <ContextMenuItem onClick={() => onRename(node.id)}>
            Rename
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => onDelete(node.id)}
            className="text-destructive focus:text-destructive"
          >
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {isFolder && isExpanded && children.map((child) => (
        <FileTreeNode
          key={child.id}
          node={child}
          tree={tree}
          activeFileId={activeFileId}
          onFileClick={onFileClick}
          onToggleFolder={onToggleFolder}
          onRename={onRename}
          onDelete={onDelete}
          onNewFile={onNewFile}
          onNewFolder={onNewFolder}
          onMove={onMove}
          level={level + 1}
        />
      ))}
    </div>
  )
}

interface FileTreeViewProps {
  tree: FileTree
  activeFileId: string | null
  onFileClick: (fileId: string) => void
  onToggleFolder: (folderId: string) => void
  onRename: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  onNewFile: (parentId: string | null) => void
  onNewFolder: (parentId: string | null) => void
  onMove: (nodeId: string, newParentId: string | null) => void
}

export function FileTreeView({
  tree,
  activeFileId,
  onFileClick,
  onToggleFolder,
  onRename,
  onDelete,
  onNewFile,
  onNewFolder,
  onMove,
}: FileTreeViewProps) {
  const rootNodes = getChildNodes(tree, null)
  const [isDragOverRoot, setIsDragOverRoot] = useState(false)
  
  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOverRoot(true)
  }
  
  const handleRootDragLeave = () => {
    setIsDragOverRoot(false)
  }
  
  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverRoot(false)
    
    const draggedNodeId = e.dataTransfer.getData('nodeId')
    if (!draggedNodeId) return
    
    const draggedNode = tree[draggedNodeId]
    if (!draggedNode) return
    
    if (draggedNode.parentId !== null) {
      onMove(draggedNodeId, null)
    }
  }

  if (rootNodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <FileText size={48} className="text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          No files yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Create a file to get started
        </p>
      </div>
    )
  }

  return (
    <div 
      className={cn("py-2 min-h-full", isDragOverRoot && "bg-accent/10")}
      onDragOver={handleRootDragOver}
      onDragLeave={handleRootDragLeave}
      onDrop={handleRootDrop}
    >
      {rootNodes.map((node) => (
        <FileTreeNode
          key={node.id}
          node={node}
          tree={tree}
          activeFileId={activeFileId}
          onFileClick={onFileClick}
          onToggleFolder={onToggleFolder}
          onRename={onRename}
          onDelete={onDelete}
          onNewFile={onNewFile}
          onNewFolder={onNewFolder}
          onMove={onMove}
          level={0}
        />
      ))}
    </div>
  )
}
