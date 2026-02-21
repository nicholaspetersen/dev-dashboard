# Dev Dashboard

Visual dashboard for managing your local development servers.

## Quick Start

```bash
# Install dependencies
npm install

# Start both backend and frontend
npm run dev
```

The dashboard will be available at:
- **Frontend**: http://localhost:5175
- **Backend API**: http://localhost:3100
- **WebSocket**: ws://localhost:3100/logs

## Features

- ✅ Visual dashboard showing all your projects
- ✅ Start/Stop/Restart processes with one click
- ✅ Smart port assignment (no conflicts)
- ✅ Real-time log streaming via WebSocket
- ✅ Portable configuration using `~` paths

## Configuration

Edit `dev-dashboard.config.json` to add/modify projects:

```json
{
  "version": "1.0",
  "scanPaths": ["~/Sites"],
  "projects": [
    {
      "id": "my-project",
      "name": "My Project",
      "path": "~/Sites/my-project",
      "type": "nextjs",
      "processes": [
        {
          "name": "dev",
          "command": "npm run dev",
          "port": 3002,
          "portArg": "--port"
        }
      ]
    }
  ]
}
```

## Current Projects

1. **AIBL** - Next.js on port 3002
2. **Podcast Transcriber** - Next.js on port 3003
3. **Trade Journal** - Monorepo (server: 3001, client: 5173)
4. **Create Navigation Prototype** - Vite on port 5174

## Architecture

```
dev-dashboard/
├── server/           # Express backend + WebSocket
├── client/           # React + Vite + Tailwind frontend
├── dev-dashboard.config.json
└── package.json      # npm workspaces root
```

## Development

```bash
# Start backend only
npm run dev:server

# Start frontend only
npm run dev:client

# Build for production
npm run build
```

## How It Works

1. Backend reads `dev-dashboard.config.json`
2. Frontend fetches projects from `/api/projects`
3. Click "Start" → spawns child process with configured command
4. WebSocket streams stdout/stderr logs in real-time
5. Click "Stop" → sends SIGTERM to gracefully shutdown

## Notes

- Paths use `~` for portability between machines
- Port conflicts are automatically detected before starting
- Logs are buffered (last 1000 entries per process)
- WebSocket reconnects automatically if connection drops
