# Getting Started

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+

## Install

```bash
git clone https://github.com/NickTheDevOpsGuy/meshlens-ai.git
cd meshlens-ai
pnpm install
```

## Configure TARS (optional)

To use **Analyze with AI**, you need a TARS API key:

1. Sign up at [router.tetrate.ai](https://router.tetrate.ai/)
2. Create an API key at [API keys](https://router.tetrate.ai/api-keys)
3. Copy `.env.example` to `.env` and add your key:

   ```bash
   cp .env.example .env
   ```

4. Edit `.env`:

   ```
   TETRATE_API_KEY=sk-your-key-here
   ```

## Run

```bash
pnpm dev
```

This starts:

- **Web app** – http://localhost:5173
- **API** – http://localhost:3001

## First steps

1. Open http://localhost:5173
2. Go to **Dashboard** – you’ll see sample incidents
3. Click an incident to open **Incident Detail**
4. Click **Analyze with AI** (requires `TETRATE_API_KEY`)
5. Use **Export PDF** to download a report
6. Go to **Settings** to configure Prometheus, Jaeger, or Alertmanager for live data

## Without the API

If you run only the web app (`pnpm dev:web`), the app falls back to sample data and static incident files. Import, AI analysis, and hot-reload require the API.
