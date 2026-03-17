# Planning Guide

A password-protected personal Markdown editor with file tree management, multi-view editing (source/preview/split), and full client-side persistence for secure, private note-taking and documentation.

**Experience Qualities**:
1. **Focused** - Distraction-free writing environment with minimal UI chrome, dark aesthetics, and clear visual hierarchy that keeps attention on content
2. **Reliable** - Every keystroke auto-saves, all state persists across sessions, no data loss even on browser crashes
3. **Efficient** - Fast file switching, keyboard shortcuts, instant preview rendering, and smooth interactions for power users

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This requires sophisticated state management with recursive tree structures, real-time Markdown parsing, synchronized scroll, authentication flow, localStorage orchestration, and multiple coordinated view modes.

## Essential Features

### Password Authentication & Session Management
- **Functionality**: SHA-256 hashed password stored in localStorage, login gate on app load, session flag cleared on logout
- **Purpose**: Single-user protection without backend complexity
- **Trigger**: First visit prompts password creation, subsequent visits show login screen
- **Progression**: Load app → Check auth state → If no password hash exists, show setup → User creates password → Hash and store → If hash exists but not authenticated, show login → User enters password → Validate hash → Set session flag → Load main app
- **Success criteria**: Password survives browser restart, wrong password shows error, logout clears session, no access to editor without valid authentication

### File Tree Explorer with Nested Folders
- **Functionality**: Unlimited-depth folder hierarchy, create/rename/delete files and folders, expand/collapse folders, visual active file highlighting
- **Purpose**: Organize dozens to hundreds of markdown documents with intuitive navigation
- **Trigger**: Click folder to toggle, right-click for context menu, toolbar buttons for quick creation
- **Progression**: Click + Folder → Prompt for name → Create in tree → Store to localStorage → Click + File → Prompt for name → Auto-append .md → Create in selected folder → Store to localStorage → Right-click item → Show context menu → Select action → Execute with confirmation if destructive
- **Success criteria**: Tree structure persists, nested folders indent correctly, delete removes all children, active file highlights, expand/collapse state saves

### Multi-View Editor (Source / Preview / Split)
- **Functionality**: Three view modes - raw markdown editing, rendered HTML preview, and synchronized split view
- **Purpose**: Switch between writing and reviewing without leaving the document
- **Trigger**: Toolbar buttons toggle view mode
- **Progression**: Click Source → Full-width textarea with syntax highlighting → Type markdown → Auto-save on debounced keystroke → Click Preview → Full-width rendered HTML → Click Split → 50/50 source and preview side-by-side → Edit source → Preview updates in real-time
- **Success criteria**: View mode persists on reload, split view syncs scroll, preview renders all markdown features correctly, switching modes is instant

### Real-Time Auto-Save & Persistence
- **Functionality**: Debounced auto-save (300ms) writes every file change to localStorage, status indicator shows save state
- **Purpose**: Zero data loss, user never thinks about saving
- **Trigger**: Any keystroke in editor
- **Progression**: Type character → Debounce timer resets → 300ms passes with no input → Write to localStorage under file ID key → Update status bar to "Auto-saved ✓"
- **Success criteria**: Content survives refresh/close/reopen, no lag during typing, status bar reflects save state accurately

### File Operations (Create, Rename, Delete)
- **Functionality**: Context menus and toolbar buttons for all file/folder CRUD operations
- **Purpose**: Full file management without external tools
- **Trigger**: Right-click item or toolbar button
- **Progression**: Right-click file → Menu appears → Click Rename → Inline edit or modal → Enter new name → Update tree and localStorage → Click Delete → Confirmation dialog → Confirm → Remove from tree and clean up localStorage keys
- **Success criteria**: All operations update UI immediately, localStorage stays in sync, confirmations prevent accidental deletion, renamed files retain content

## Edge Case Handling

- **Empty States** - Show helpful message when no files exist with prominent "Create your first file" button
- **Invalid Markdown** - Preview gracefully handles malformed markdown without breaking UI
- **Duplicate Names** - Prevent duplicate file/folder names in same directory with validation error
- **Deep Nesting** - Limit folder depth to 10 levels or add horizontal scroll to prevent UI break
- **Large Files** - Handle 10,000+ line documents without editor lag using virtualization or chunking
- **localStorage Quota** - Detect quota exceeded errors and show warning to user about space limits
- **Password Loss** - No recovery mechanism, but clear messaging that data is inaccessible without password
- **Concurrent Tabs** - Single-tab focus recommended; detect localStorage changes from other tabs with warning
- **Browser Compatibility** - Graceful degradation for missing crypto API or localStorage with clear error messages

## Design Direction

The design should evoke a **hacker's terminal aesthetic meets modern IDE** - serious, professional, focused. Dark backgrounds with electric blue accents create high contrast for extended reading/writing sessions. Minimal borders and flat design reduce visual noise. Monospace fonts for content honor markdown's plain-text roots while clean sans-serif UI chrome maintains professionalism.

## Color Selection

A deep space terminal aesthetic with electric accents for critical interactions.

- **Primary Color**: `oklch(0.15 0.02 250)` Deep navy-black (#1a1a2e) - Main application background, conveys depth and focus
- **Secondary Colors**: 
  - Sidebar surface: `oklch(0.18 0.03 240)` (#16213e) - Subtle lift from background
  - Editor surface: `oklch(0.08 0.01 250)` (#0f0f1a) - Maximum contrast for text
- **Accent Color**: `oklch(0.70 0.15 220)` Electric blue (#4fc3f7) - Buttons, active states, highlights, focus rings
- **Foreground/Background Pairings**:
  - Primary bg (Deep Navy #1a1a2e): Light gray text (#e0e0e0) oklch(0.88 0 0) - Ratio 13.2:1 ✓
  - Editor bg (Near Black #0f0f1a): Light gray text (#e0e0e0) oklch(0.88 0 0) - Ratio 15.8:1 ✓
  - Accent (Electric Blue #4fc3f7): Dark bg (#1a1a2e) - Ratio 7.1:1 ✓
  - Muted text: `oklch(0.55 0 0)` (#888) for secondary info

## Font Selection

**Technical precision with readability** - Monospace for code/content honors markdown's plain-text nature while crisp sans-serif UI ensures clarity of controls.

- **Typographic Hierarchy**:
  - Editor Content: JetBrains Mono 14px / line-height 1.6 / weight 400 (monospace for markdown)
  - UI Chrome: System-ui 13px / line-height 1.4 / weight 500 (sidebar, toolbar, buttons)
  - Toolbar Labels: System-ui 12px / weight 600 / uppercase tracking
  - Rendered Preview H1: System-ui 28px / weight 700 / margin-bottom 16px
  - Rendered Preview H2: System-ui 22px / weight 600 / margin-bottom 12px
  - Rendered Preview Body: System-ui 15px / line-height 1.7 / weight 400
  - Status Bar: JetBrains Mono 11px / weight 400 (file info, stats)

## Animations

**Micro-interactions that confirm without distracting** - Subtle 200ms ease transitions on expand/collapse, view switching, and hover states. Loading states pulse gently. No page transitions or unnecessary motion - this is a tool for focus.

Key animations:
- Folder chevron rotation (150ms ease)
- Sidebar item hover background fade (100ms)
- View mode button activation (200ms ease with scale 0.98 on press)
- Context menu slide-in (150ms ease-out)
- Status bar message fade (300ms)
- Split view divider drag (0ms - immediate response)

## Component Selection

- **Components**: 
  - Sidebar tree: Custom recursive component with indentation logic, not shadcn Sidebar (too opinionated)
  - Context menu: Radix UI ContextMenu for accessibility and proper positioning
  - Dialog: Radix UI Dialog for rename prompts and confirmations
  - Input: shadcn Input for password, file names
  - Button: shadcn Button for toolbar actions
  - Textarea: Custom component for editor (syntax highlighting needs)
  - Scroll Area: Radix ScrollArea for sidebar and editor panels
  
- **Customizations**: 
  - Custom FileTreeNode recursive component for unlimited nesting
  - Custom SplitPane with draggable divider and resize logic
  - Custom MarkdownEditor with syntax highlighting regex
  - Custom StatusBar with word count calculation
  - marked.js library for markdown-to-HTML parsing in preview
  
- **States**: 
  - Buttons: Default (dim gray), Hover (lighter gray bg), Active (accent color bg + text), Disabled (50% opacity)
  - Tree items: Default, Hover (subtle bg lift), Active file (accent color left border + bg tint)
  - Inputs: Default (border accent), Focus (accent ring + glow), Error (red border for validation)
  - Context menu: Slide in from cursor, dismiss on click outside, hover highlights items
  
- **Icon Selection**: 
  - Phosphor icons set: Folder (FolderNotch), File (FileText), Plus (Plus), Trash (Trash), SignOut (SignOut), Eye (Eye), Code (Code), Columns (Columns)
  - Chevron right/down for folder expansion
  - All icons use accent color on hover, muted gray default
  
- **Spacing**: 
  - Toolbar: p-3 gap-4 between sections
  - Sidebar: p-2 for container, p-1.5 for items, pl-4 per nesting level
  - Editor: p-6 for comfortable writing
  - Status bar: p-2 h-8
  - Context menu: p-1 with gap-0.5
  - Buttons: px-3 py-1.5 gap-2 (icon + text)
  
- **Mobile**: 
  - Below 768px: Sidebar becomes overlay drawer (toggleable)
  - Toolbar: Icons only, text labels hidden, stack view mode buttons
  - Split view: Force to source-only or preview-only (no horizontal split)
  - Context menu: Touch-friendly 44px tap targets
  - Status bar: Hide word count, show only filename
