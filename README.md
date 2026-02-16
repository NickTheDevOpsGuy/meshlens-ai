# 🌌 Meshlens AI

_AI-powered service mesh incident debugger_ 🦝

[![CI](https://github.com/NickTheDevOpsGuy/meshlens-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/NickTheDevOpsGuy/meshlens-ai/actions/workflows/ci.yml)
![Last Commit](https://img.shields.io/github/last-commit/NickTheDevOpsGuy/meshlens-ai)
![Built with React](https://img.shields.io/badge/Built%20with-React-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38bdf8?logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/github/license/NickTheDevOpsGuy/meshlens-ai)
![Contributions welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg)

---

## 🎯 Problem & Solution

**Problem:** When service mesh incidents happen, engineers spend hours correlating metrics, traces, and alerts to find root cause. Distributed failures cascade across services, making it hard to see the full picture.

**Solution:** Meshlens AI aggregates incidents from sample data, Prometheus, Jaeger, and Alertmanager—then uses **Tetrate Agent Router Service (TARS)** to analyze dependency graphs and suggest root causes. One dashboard, AI-powered analysis, PDF reports, and Slack/PagerDuty integration.

---

## 🔗 Live Demo

**[→ Try Meshlens AI](https://meshlens-ai-api.vercel.app/)** · **[→ Docs](https://meshlens-ai-api.vercel.app/docs)**

---

## 🖼 Preview

> 📸 _Add screenshots: `./apps/web/public/preview.png` or record a short GIF of the Dashboard and Incident Detail flow._

---

## 🚀 Features

- **Dashboard** – Incident list with severity/status filters, search, and live telemetry
- **AI root cause analysis** – TARS-powered "Analyze with AI" on any incident
- **Incident correlation** – Group by service or by time (shared services, within 30 min)
- **Service topology** – Visualize failing dependencies (sample + live from Prometheus/Jaeger)
- **Incident timeline** – Overlapping incidents and duration
- **SLO/SLI view** – Service level objectives vs actuals (sample + live Prometheus)
- **PDF export** – Export incident reports with AI analysis, root cause, recommendations
- **Hot-reload samples** – API watches `samples/incidents/`; dashboard auto-refreshes on Import
- **Alertmanager integration** – Firing alerts surfaced as incidents
- **Export / share** – Export JSON, copy shareable link, notify Slack/PagerDuty
- **Runbook links** – Associate runbooks with incidents
- **Trace drill-down** – Link to Jaeger trace from incident
- **Auto-refresh** – Configurable refresh for live telemetry
- **Import** – Paste or upload JSON; saves to samples (local only)

---

## 🏗 Architecture

```
┌─────────────────┐     ┌──────────────────────────────────────────────────┐
│   React + Vite  │     │                    Hono API                       │
│   (port 5173)   │────►│  /api/samples  /api/ai/analyze  /api/prometheus   │
│   Tailwind v4   │     │  /api/jaeger   /api/alertmanager  /api/notify      │
└─────────────────┘     └──────────────────────────────────────────────────┘
        │                                    │
        │                                    ├──► TARS (AI analysis)
        │                                    ├──► Prometheus (metrics/SLO)
        └── localStorage (settings)           ├──► Jaeger (traces)
                                             ├──► Alertmanager (alerts)
                                             └──► Slack / PagerDuty
```

---

## 🛠 Tech Stack

| Layer    | Tech                                              |
| -------- | ------------------------------------------------- |
| Frontend | React 19, Vite 6, Tailwind CSS v4, React Router 7 |
| Backend  | Hono (Node + Vercel serverless)                   |
| AI       | Tetrate Agent Router Service (TARS)               |
| Data     | TypeScript, pnpm monorepo, `@meshlens/shared`     |
| Deploy   | Vercel                                            |

---

## 📦 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/NickTheDevOpsGuy/meshlens-ai.git
   cd meshlens-ai
   ```

2. **Configure environment (TARS)**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your **Tetrate Agent Router Service (TARS)** API key:
   - Sign up at [router.tetrate.ai](https://router.tetrate.ai/)
   - Get your API key from [API keys](https://router.tetrate.ai/api-keys)
   - Set `TETRATE_API_KEY` in `.env`

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Run the development server**

   ```bash
   pnpm dev
   ```

   This starts the web app (http://localhost:5173) and API (http://localhost:3001). Configure Prometheus and Jaeger URLs in Settings for live telemetry.

---

## 🚢 Deploy to Vercel

1. **Connect the repo** to [Vercel](https://vercel.com) (import from GitHub).
2. **Project Settings** → **General** → **Build & Development Settings**:
   - **Root Directory**: `apps/web`
   - **Framework Preset**: `Vite` or `React`
   - **Include source files outside of the Root Directory**: enable (for monorepo)
   - Build/Output/Install: leave auto-detected or use `pnpm run build`, `dist`, `pnpm install`
3. **Environment variables** (optional): `TETRATE_API_KEY`, `TARS_API_BASE_URL`, `TARS_MODEL`

The API runs as serverless functions at `/api/*`. Sample incidents are read from the repo; **Import** is read-only on Vercel.

---

## 🧪 Try it yourself

1. Open the **Dashboard** — you’ll see sample incidents.
2. Click an incident to open its **Incident Detail** page.
3. Click **"Analyze with AI"** (requires `TETRATE_API_KEY` in `.env`).
4. Use **Export PDF** to download a report.
5. Toggle **View** to "Group by service" or "Correlated" on the Dashboard.
6. Go to **Import** to paste or upload JSON (needs API running locally).

---

## 📁 Sample incident data

Add incident JSON files to `samples/incidents/` and list them in `manifest.json`. See `samples/incidents/README.md` for the schema.

## 🤖 AI root cause analysis

Click **"Analyze with AI"** on any incident. Add `TETRATE_API_KEY` to `.env` and restart the API.

## 📡 Live telemetry

When Prometheus or Jaeger URLs are configured in Settings:

- **Dashboard** fetches live incidents (high error rates from Istio metrics)
- **Service Map** shows "Load live topology" for the live graph
- The API proxies requests to avoid CORS

Prometheus must scrape `istio_requests_total` (or similar). Jaeger's `/api/dependencies` provides the service graph.

---

## 📂 Project Structure

```
├── apps/
│   ├── api/              # Hono API (port 3001, Vercel serverless)
│   └── web/              # React + Vite app (port 5173)
│       ├── api/          # Vercel serverless entry
│       └── src/
├── packages/shared/      # Incident types, schemas
├── samples/incidents/    # JSON incident bundles
└── vercel.json
```

---

## 🗓️ Roadmap

- [x] PDF export for incident reports
- [x] Incident correlation/grouping
- [x] Hot-reload samples
- [ ] Prometheus SLO recording rules for richer live SLO data

---

## 🤝 Contributing

- 🐛 Report bugs in [Issues](https://github.com/NickTheDevOpsGuy/meshlens-ai/issues)
- 💡 Suggest features or improvements
- 🔧 Open a Pull Request

---

## 🦝 Built by NickDoesDevOps

Created with ☕, curiosity, and a touch of chaos by [Nicholas Clark](https://www.linkedin.com/in/nickdoesdevops).  
Follow the journey → [GitHub](https://github.com/NickTheDevOpsGuy) • [LinkedIn](https://www.linkedin.com/in/nickdoesdevops)

🏷 #NickDoesDevOps • #LearningInPublic • #BuiltInPublic
