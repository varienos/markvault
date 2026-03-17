export type ColorTheme = 'midnight' | 'ocean' | 'forest' | 'sunset' | 'monochrome' | 'manta'

export interface ThemeColors {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
  editorBg: string
}

export const COLOR_THEMES: Record<ColorTheme, ThemeColors> = {
  midnight: {
    background: 'oklch(0.15 0.02 250)',
    foreground: 'oklch(0.88 0 0)',
    card: 'oklch(0.18 0.03 240)',
    cardForeground: 'oklch(0.88 0 0)',
    popover: 'oklch(0.18 0.03 240)',
    popoverForeground: 'oklch(0.88 0 0)',
    primary: 'oklch(0.70 0.15 220)',
    primaryForeground: 'oklch(0.15 0.02 250)',
    secondary: 'oklch(0.25 0.03 240)',
    secondaryForeground: 'oklch(0.88 0 0)',
    muted: 'oklch(0.20 0.02 245)',
    mutedForeground: 'oklch(0.55 0 0)',
    accent: 'oklch(0.70 0.15 220)',
    accentForeground: 'oklch(0.15 0.02 250)',
    destructive: 'oklch(0.55 0.22 25)',
    destructiveForeground: 'oklch(0.95 0 0)',
    border: 'oklch(0.25 0.02 240)',
    input: 'oklch(0.25 0.02 240)',
    ring: 'oklch(0.70 0.15 220)',
    editorBg: 'oklch(0.08 0.01 250)',
  },
  ocean: {
    background: 'oklch(0.12 0.03 220)',
    foreground: 'oklch(0.90 0 0)',
    card: 'oklch(0.16 0.04 215)',
    cardForeground: 'oklch(0.90 0 0)',
    popover: 'oklch(0.16 0.04 215)',
    popoverForeground: 'oklch(0.90 0 0)',
    primary: 'oklch(0.65 0.18 200)',
    primaryForeground: 'oklch(0.12 0.03 220)',
    secondary: 'oklch(0.22 0.04 215)',
    secondaryForeground: 'oklch(0.90 0 0)',
    muted: 'oklch(0.18 0.03 220)',
    mutedForeground: 'oklch(0.55 0 0)',
    accent: 'oklch(0.60 0.20 190)',
    accentForeground: 'oklch(0.95 0 0)',
    destructive: 'oklch(0.55 0.22 25)',
    destructiveForeground: 'oklch(0.95 0 0)',
    border: 'oklch(0.24 0.03 215)',
    input: 'oklch(0.24 0.03 215)',
    ring: 'oklch(0.65 0.18 200)',
    editorBg: 'oklch(0.08 0.02 220)',
  },
  forest: {
    background: 'oklch(0.14 0.03 140)',
    foreground: 'oklch(0.88 0 0)',
    card: 'oklch(0.18 0.04 135)',
    cardForeground: 'oklch(0.88 0 0)',
    popover: 'oklch(0.18 0.04 135)',
    popoverForeground: 'oklch(0.88 0 0)',
    primary: 'oklch(0.62 0.15 145)',
    primaryForeground: 'oklch(0.12 0.03 140)',
    secondary: 'oklch(0.24 0.04 140)',
    secondaryForeground: 'oklch(0.88 0 0)',
    muted: 'oklch(0.20 0.03 138)',
    mutedForeground: 'oklch(0.55 0 0)',
    accent: 'oklch(0.68 0.18 160)',
    accentForeground: 'oklch(0.12 0.03 140)',
    destructive: 'oklch(0.55 0.22 25)',
    destructiveForeground: 'oklch(0.95 0 0)',
    border: 'oklch(0.26 0.03 135)',
    input: 'oklch(0.26 0.03 135)',
    ring: 'oklch(0.62 0.15 145)',
    editorBg: 'oklch(0.09 0.02 140)',
  },
  sunset: {
    background: 'oklch(0.16 0.03 30)',
    foreground: 'oklch(0.92 0 0)',
    card: 'oklch(0.20 0.04 35)',
    cardForeground: 'oklch(0.92 0 0)',
    popover: 'oklch(0.20 0.04 35)',
    popoverForeground: 'oklch(0.92 0 0)',
    primary: 'oklch(0.68 0.20 40)',
    primaryForeground: 'oklch(0.12 0.02 30)',
    secondary: 'oklch(0.26 0.04 30)',
    secondaryForeground: 'oklch(0.92 0 0)',
    muted: 'oklch(0.22 0.03 32)',
    mutedForeground: 'oklch(0.55 0 0)',
    accent: 'oklch(0.72 0.22 50)',
    accentForeground: 'oklch(0.10 0.02 30)',
    destructive: 'oklch(0.58 0.25 30)',
    destructiveForeground: 'oklch(0.95 0 0)',
    border: 'oklch(0.28 0.03 35)',
    input: 'oklch(0.28 0.03 35)',
    ring: 'oklch(0.68 0.20 40)',
    editorBg: 'oklch(0.10 0.02 30)',
  },
  monochrome: {
    background: 'oklch(0.12 0 0)',
    foreground: 'oklch(0.92 0 0)',
    card: 'oklch(0.16 0 0)',
    cardForeground: 'oklch(0.92 0 0)',
    popover: 'oklch(0.16 0 0)',
    popoverForeground: 'oklch(0.92 0 0)',
    primary: 'oklch(0.75 0 0)',
    primaryForeground: 'oklch(0.12 0 0)',
    secondary: 'oklch(0.24 0 0)',
    secondaryForeground: 'oklch(0.92 0 0)',
    muted: 'oklch(0.20 0 0)',
    mutedForeground: 'oklch(0.55 0 0)',
    accent: 'oklch(0.85 0 0)',
    accentForeground: 'oklch(0.12 0 0)',
    destructive: 'oklch(0.55 0 0)',
    destructiveForeground: 'oklch(0.95 0 0)',
    border: 'oklch(0.26 0 0)',
    input: 'oklch(0.26 0 0)',
    ring: 'oklch(0.75 0 0)',
    editorBg: 'oklch(0.08 0 0)',
  },
  manta: {
    background: 'oklch(0.10 0.04 280)',
    foreground: 'oklch(0.90 0.02 290)',
    card: 'oklch(0.14 0.05 285)',
    cardForeground: 'oklch(0.90 0.02 290)',
    popover: 'oklch(0.14 0.05 285)',
    popoverForeground: 'oklch(0.90 0.02 290)',
    primary: 'oklch(0.60 0.24 290)',
    primaryForeground: 'oklch(0.95 0.02 290)',
    secondary: 'oklch(0.20 0.05 280)',
    secondaryForeground: 'oklch(0.90 0.02 290)',
    muted: 'oklch(0.18 0.04 282)',
    mutedForeground: 'oklch(0.55 0 0)',
    accent: 'oklch(0.70 0.26 310)',
    accentForeground: 'oklch(0.95 0.02 310)',
    destructive: 'oklch(0.55 0.22 25)',
    destructiveForeground: 'oklch(0.95 0 0)',
    border: 'oklch(0.24 0.04 285)',
    input: 'oklch(0.24 0.04 285)',
    ring: 'oklch(0.60 0.24 290)',
    editorBg: 'oklch(0.06 0.03 280)',
  },
}

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
  colorTheme: ColorTheme
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
  colorTheme: 'midnight',
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

export function applyTheme(theme: ColorTheme): void {
  const colors = COLOR_THEMES[theme]
  const root = document.documentElement
  
  Object.entries(colors).forEach(([key, value]) => {
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    root.style.setProperty(`--${cssVarName}`, value)
  })
}
