export type ViewMode = 'source' | 'split' | 'preview'

export interface FileNode {
  id: string
  name: string
  type: 'file'
  parentId: string | null
}

export interface FolderNode {
  id: string
  name: string
  type: 'folder'
  parentId: string | null
  expanded: boolean
}

export type TreeNode = FileNode | FolderNode

export interface FileTree {
  [id: string]: TreeNode
}
