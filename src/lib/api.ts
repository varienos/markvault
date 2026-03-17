const API_BASE = '/api'

export async function loadAllFromServer(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/init`)
    if (!res.ok) return false
    const data = await res.json()

    // Populate localStorage from server data
    if (data.tree && Object.keys(data.tree).length > 0) {
      localStorage.setItem('md_file_tree', JSON.stringify(data.tree))
    }

    if (data.auth) {
      if (data.auth.passwordHash) {
        localStorage.setItem('md_password_hash', data.auth.passwordHash)
      }
      if (data.auth.passwordRequired !== undefined) {
        localStorage.setItem('md_password_required', data.auth.passwordRequired.toString())
      }
    }

    if (data.settings) {
      localStorage.setItem('md_editor_settings', JSON.stringify(data.settings))
    }

    if (data.state) {
      if (data.state.activeFile) localStorage.setItem('md_active_file', data.state.activeFile)
      if (data.state.viewMode) localStorage.setItem('md_view_mode', data.state.viewMode)
      if (data.state.sidebarCollapsed !== undefined) localStorage.setItem('md_sidebar_collapsed', data.state.sidebarCollapsed.toString())
      if (data.state.terminalCollapsed !== undefined) localStorage.setItem('md_terminal_collapsed', data.state.terminalCollapsed.toString())
      if (data.state.leftSidebarWidth) localStorage.setItem('md_left_sidebar_width', data.state.leftSidebarWidth.toString())
      if (data.state.rightSidebarWidth) localStorage.setItem('md_right_sidebar_width', data.state.rightSidebarWidth.toString())
    }

    // Load file contents into localStorage
    if (data.files) {
      for (const [id, content] of Object.entries(data.files)) {
        localStorage.setItem(`md_file_content_${id}`, content as string)
      }
    }

    return true
  } catch {
    return false
  }
}

// Fire-and-forget sync functions
export function syncTree(tree: object): void {
  fetch(`${API_BASE}/tree`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tree),
  }).catch(() => {})
}

export function syncFileContent(fileId: string, content: string): void {
  fetch(`${API_BASE}/files/${fileId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'text/plain' },
    body: content,
  }).catch(() => {})
}

export function syncDeleteFile(fileId: string): void {
  fetch(`${API_BASE}/files/${fileId}`, { method: 'DELETE' }).catch(() => {})
}

export function syncAuth(data: { passwordHash?: string; passwordRequired?: boolean }): void {
  fetch(`${API_BASE}/auth`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {})
}

export function syncSettings(settings: object): void {
  fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  }).catch(() => {})
}

export function syncState(state: Record<string, unknown>): void {
  fetch(`${API_BASE}/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  }).catch(() => {})
}
