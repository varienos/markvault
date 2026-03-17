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
  level,
}: FileTreeNodeProps) {
  const isFile = node.type === 'file'
  const isFolder = node.type === 'folder'
  const isExpanded = isFolder && node.expanded
  const isActive = isFile && node.id === activeFileId
  const children = isFolder ? getChildNodes(tree, node.id) : []

  const handleClick = () => {
    if (isFile) {
      onFileClick(node.id)
    } else {
      onToggleFolder(node.id)
    }
  }

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors',
              'hover:bg-muted/50',
              isActive && 'bg-accent/20 border-l-2 border-accent'
            )}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={handleClick}
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
}: FileTreeViewProps) {
  const rootNodes = getChildNodes(tree, null)

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
    <div className="py-2">
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
          level={0}
        />
      ))}
    </div>
  )
}
