const STORAGE_KEYS = {
  PASSWORD_HASH: 'md_password_hash',
  FILE_TREE: 'md_file_tree',
  ACTIVE_FILE: 'md_active_file',
  VIEW_MODE: 'md_view_mode',
  AUTHENTICATED: 'md_authenticated',
  SIDEBAR_COLLAPSED: 'md_sidebar_collapsed',
  TERMINAL_COLLAPSED: 'md_terminal_collapsed',
  LEFT_SIDEBAR_WIDTH: 'md_left_sidebar_width',
  RIGHT_SIDEBAR_WIDTH: 'md_right_sidebar_width',
  PASSWORD_REQUIRED: 'md_password_required',
} as const

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function hasPasswordSet(): boolean {
  return localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH) !== null
}

export async function setPassword(password: string): Promise<void> {
  const hash = await hashPassword(password)
  localStorage.setItem(STORAGE_KEYS.PASSWORD_HASH, hash)
  localStorage.setItem(STORAGE_KEYS.AUTHENTICATED, 'true')
}

export async function verifyPassword(password: string): Promise<boolean> {
  const storedHash = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH)
  if (!storedHash) return false
  
  const hash = await hashPassword(password)
  return hash === storedHash
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(STORAGE_KEYS.AUTHENTICATED) === 'true'
}

export function setAuthenticated(): void {
  localStorage.setItem(STORAGE_KEYS.AUTHENTICATED, 'true')
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.AUTHENTICATED)
}

export function isPasswordRequired(): boolean {
  const value = localStorage.getItem(STORAGE_KEYS.PASSWORD_REQUIRED)
  if (value === null) return true
  return value === 'true'
}

export function setPasswordRequired(required: boolean): void {
  localStorage.setItem(STORAGE_KEYS.PASSWORD_REQUIRED, required ? 'true' : 'false')
}

export { STORAGE_KEYS }
