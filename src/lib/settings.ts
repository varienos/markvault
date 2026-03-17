export interface EditorSettings {
  fontSize: number
  tabSize: number
  wordWrap: boolean
  autoSaveDelay: number
  showLineNumbers: boolean
  sidebarWidth: number
  compactMode: boolean
  showFileExtensions: boolean
  smoothScrolling: boolean
}

const SETTINGS_KEY = 'md_editor_settings'

const defaultSettings: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  autoSaveDelay: 300,
  showLineNumbers: true,
  sidebarWidth: 250,
  compactMode: false,
  showFileExtensions: true,
  smoothScrolling: true,
}

export function getEditorSettings(): EditorSettings {
  const stored = localStorage.getItem(SETTINGS_KEY)
  if (!stored) return defaultSettings
  
  try {
    const parsed = JSON.parse(stored)
    return { ...defaultSettings, ...parsed }
  } catch {
    return defaultSettings
  }
}

export function saveEditorSettings(settings: EditorSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
