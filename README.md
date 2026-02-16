# 🌌 Project Name

_Short tagline about what this project does_ 🦝

[![CI](https://github.com/NickTheDevOpsGuy/meshlens-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/NickTheDevOpsGuy/meshlens-ai/actions/workflows/ci.yml)
![Last Commit](https://img.shields.io/github/last-commit/NickTheDevOpsGuy/meshlens-ai)
![Built with React](https://img.shields.io/badge/Built%20with-React-61dafb?logo=react&logoColor=white)

![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38bdf8?logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/github/license/NickTheDevOpsGuy/meshlens-ai)
![Contributions welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg)

---

## 🖼 Preview

### Main App Demo
![App Demo GIF](./public/assets/preview.gif)

### Feature Highlights
![Feature Showcase](./public/assets/feature.gif)

> 🎞️ *Previews are short animated GIFs recorded directly from the live app using screen capture — perfect for quick demos in READMEs.*

---

## 🚀 Features

- **Dashboard** – Incident list with severity/status filters and search
- **AI root cause analysis** – TARS-powered analysis with "Analyze with AI" button
- **Service topology** – Visualize failing dependencies (sample + live from Prometheus/Jaeger)
- **Incident timeline** – Overlapping incidents and duration
- **SLO/SLI view** – Service level objectives vs actuals
- **Alertmanager integration** – Firing alerts as incidents
- **Export / share** – Export incident JSON, copy shareable link
- **Runbook links** – Associate runbooks with incidents
- **Trace drill-down** – Link to Jaeger trace from incident
- **Auto-refresh** – Configurable refresh for live telemetry

---

## 🔒 Privacy

This app is designed for **local use only** — all processing happens in your browser.

---

## 🗓️ Roadmap

- [ ] Prometheus SLO recording rules for live SLO data
- [ ] PDF export for incident reports

---

## 🛠 Tech Stack

- React + Vite
- TypeScript
- TailwindCSS v4

---

## 📦 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/NickTheDevOpsGuy/Project Name.git
   cd Project Name
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
   npm install
   ```

4. **Run the development server**

   ```bash
   pnpm dev
   ```

   This starts both the web app (http://localhost:5173) and the API proxy
   (http://localhost:3001). The API proxy forwards requests to Prometheus and
   Jaeger—configure their URLs in Settings to enable live telemetry.
---

## 📁 Sample incident data

Add your own incident scenarios by placing JSON files in `apps/web/public/samples/incidents/` and listing them in `manifest.json`. Each file should follow the `IncidentBundle` schema (see `samples/incidents/README.md`).

## 🤖 AI root cause analysis

Click **"Analyze with AI"** on any incident detail to get TARS-powered root cause analysis. Add `TETRATE_API_KEY` to your `.env` (at repo root) and restart the API server.

## 📡 Live telemetry

When Prometheus or Jaeger URLs are configured in Settings:

- **Dashboard** fetches live incidents (high error rates from Istio metrics)
- **Service Map** shows a "Load live topology" link to render the service graph from Prometheus/Jaeger
- The API proxy (port 3001) forwards requests to avoid CORS

Prometheus must scrape `istio_requests_total` (Istio) or similar service mesh metrics. Jaeger's `/api/dependencies` endpoint provides the service graph.

---

## 📂 Project Structure

<details>
<summary>📁 Click to expand file structure</summary>

```plaintext
.
├── apps/
│   ├── api/                # Proxy for Prometheus/Jaeger (port 3001)
│   └── web/                # React + Vite + Tailwind app (port 5173)
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── data/
│       │   └── services/   # Telemetry fetch & normalize
│       └── ...
├── packages/
│   └── shared/             # Incident types, telemetry schemas
├── .env.example
├── package.json
└── README.md
```
</details>

---

## 🤝 Contributing

- 🐛 Report bugs in [Issues](../../../../issues)
- 💡 Suggest features or improvements
- 🔧 Open a Pull Request

---

## 🦝 Built by NickDoesDevOps

Created with ☕, curiosity, and a touch of chaos by [Nicholas Clark](https://www.linkedin.com/in/nickdoesdevops).  
Follow the journey → [GitHub](https://github.com/NickTheDevOpsGuy) • [LinkedIn](https://www.linkedin.com/in/nickdoesdevops)

🏷 #NickDoesDevOps • #LearningInPublic • #BuiltInPublic