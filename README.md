# MarkVault

A self-hosted, password-protected Markdown editor for personal note-taking and documentation. Write, organize, and preview your notes — all in one place, entirely under your control.

## Features

- **File Tree Explorer** — Create, rename, delete, and drag-drop files and folders with unlimited nesting
- **Three View Modes** — Source editor, rendered preview, or synchronized split view
- **Auto-Save** — Every keystroke is debounced and persisted automatically
- **Password Protection** — Optional SHA-256 hashed authentication (can be disabled in settings)
- **6 Color Themes** — Midnight, Ocean, Forest, Sunset, Monochrome, and Manta
- **Docker Ready** — One command to deploy with persistent storage

## Quick Start

```bash
# Development
npm install
npm run dev

# Production (Docker)
docker compose up -d
```

The app runs at `http://localhost:5173` in dev mode, or `http://localhost:1245` via Docker.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS 4, Radix UI, Framer Motion |
| Markdown | marked.js |
| Backend | Express.js, file-based storage |
| Deploy | Docker, Nginx |

## How It Works

MarkVault uses a dual-layer persistence model. Notes save instantly to `localStorage` for speed, then sync to an Express backend for durability. All data lives in a `/data` volume — no external database needed.

## License

[MIT](LICENSE)
