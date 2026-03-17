import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 1245
const DATA_DIR = process.env.DATA_DIR || '/data'
const FILES_DIR = path.join(DATA_DIR, 'files')

// Ensure data directories exist
fs.mkdirSync(FILES_DIR, { recursive: true })

app.use(express.json({ limit: '50mb' }))
app.use(express.text({ limit: '50mb' }))

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'dist')))

// --- Helper functions ---
function readJSON(filename) {
  const filepath = path.join(DATA_DIR, filename)
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'))
  } catch {
    return null
  }
}

function writeJSON(filename, data) {
  const filepath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8')
}

// --- API Routes ---

// GET /api/init - Load all data at once
app.get('/api/init', (req, res) => {
  const tree = readJSON('tree.json') || {}
  const auth = readJSON('auth.json') || {}
  const settings = readJSON('settings.json') || null
  const state = readJSON('state.json') || {}

  // Load all file contents
  const files = {}
  try {
    const fileList = fs.readdirSync(FILES_DIR)
    for (const f of fileList) {
      if (f.endsWith('.md')) {
        const id = f.replace('.md', '')
        files[id] = fs.readFileSync(path.join(FILES_DIR, f), 'utf-8')
      }
    }
  } catch {
    // files directory might be empty
  }

  res.json({ tree, auth, settings, state, files })
})

// --- File Tree ---
app.put('/api/tree', (req, res) => {
  writeJSON('tree.json', req.body)
  res.json({ ok: true })
})

// --- File Contents ---
app.get('/api/files/:id', (req, res) => {
  const filepath = path.join(FILES_DIR, `${req.params.id}.md`)
  try {
    const content = fs.readFileSync(filepath, 'utf-8')
    res.type('text/plain').send(content)
  } catch {
    res.type('text/plain').send('')
  }
})

app.put('/api/files/:id', (req, res) => {
  const filepath = path.join(FILES_DIR, `${req.params.id}.md`)
  const content = typeof req.body === 'string' ? req.body : ''
  fs.writeFileSync(filepath, content, 'utf-8')
  res.json({ ok: true })
})

app.delete('/api/files/:id', (req, res) => {
  const filepath = path.join(FILES_DIR, `${req.params.id}.md`)
  try {
    fs.unlinkSync(filepath)
  } catch {
    // file might not exist
  }
  res.json({ ok: true })
})

// --- Auth ---
app.put('/api/auth', (req, res) => {
  writeJSON('auth.json', req.body)
  res.json({ ok: true })
})

// --- Settings ---
app.put('/api/settings', (req, res) => {
  writeJSON('settings.json', req.body)
  res.json({ ok: true })
})

// --- UI State ---
app.put('/api/state', (req, res) => {
  const current = readJSON('state.json') || {}
  writeJSON('state.json', { ...current, ...req.body })
  res.json({ ok: true })
})

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Markvault server running on port ${PORT}`)
  console.log(`Data directory: ${DATA_DIR}`)
})
