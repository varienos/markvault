# MarkVault

A self-hosted, password-protected Markdown editor for personal note-taking and documentation. Write, organize, and preview your notes — all in one place, entirely under your control.

![License](https://img.shields.io/github/license/varienos/markvault)
![GitHub last commit](https://img.shields.io/github/last-commit/varienos/markvault)

## Features

- **File Tree Explorer** — Create, rename, delete, and drag-drop files and folders with unlimited nesting
- **Three View Modes** — Source editor, rendered preview, or synchronized split view
- **Auto-Save** — Every keystroke is debounced and persisted automatically
- **Password Protection** — Optional SHA-256 hashed authentication (can be disabled in settings)
- **6 Color Themes** — Midnight, Ocean, Forest, Sunset, Monochrome, and Manta
- **Docker Ready** — One command to deploy with persistent storage

## Getting Started

```bash
git clone https://github.com/varienos/markvault.git
cd markvault
npm install
npm run dev
```

Open `http://localhost:5173` and start writing.

### Docker

```bash
git clone https://github.com/varienos/markvault.git
cd markvault
docker compose up -d
```

Runs at `http://localhost:1245` with persistent storage out of the box.

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

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

## License

[MIT](LICENSE)
