# Meshlens AI Documentation

Meshlens AI is an **AI-powered service mesh incident debugger** that helps engineers correlate incidents, analyze root causes, and respond faster.

---

## What is Meshlens AI?

When service mesh incidents happen—cascading failures, timeout storms, config rollbacks—engineers often spend hours correlating metrics, traces, and logs to find the root cause. Meshlens AI aggregates incident data from multiple sources and uses **Tetrate Agent Router Service (TARS)** to suggest root causes and recommendations.

### Key concepts

- **Incidents** – Failures, outages, or degraded behavior affecting one or more services. Each incident has a title, severity, status, affected services, and a dependency graph.
- **Dependency graph** – Nodes (services) and edges (calls between them) with error rates and latency. Used for topology visualization and AI analysis.
- **TARS** – Tetrate's AI routing service. When you click **Analyze with AI**, the incident and graph are sent to TARS, which returns a suggested root cause and recommendations.

---

## Documentation index

Use the sidebar to navigate between pages.

---

## Architecture overview

```
┌─────────────────┐     ┌──────────────────────────────────────────────────┐
│   React + Vite  │     │                    Hono API                       │
│   (port 5173)   │────►│  /api/samples  /api/ai/analyze  /api/prometheus   │
│   Tailwind v4   │     │  /api/jaeger   /api/alertmanager  /api/notify     │
└─────────────────┘     └──────────────────────────────────────────────────┘
        │                                    │
        │                                    ├──► TARS (AI analysis)
        │                                    ├──► Prometheus (metrics/SLO)
        └── localStorage (settings)           ├──► Jaeger (traces)
                                             ├──► Alertmanager (alerts)
                                             └──► Slack / PagerDuty
```

- **Frontend**: React SPA. Settings stored in `localStorage`.
- **API**: Hono server that proxies Prometheus, Jaeger, Alertmanager; runs AI analysis via TARS; serves sample incidents from `samples/incidents/`.
- **Observability**: The **Observability** page is a central hub for metrics (Prometheus), traces (Jaeger/Tempo), logs (Loki), dashboards (Grafana), and alerts (Alertmanager). Configure URLs in Settings to get quick links to each tool.
- **Live telemetry**: Optional. When Prometheus/Jaeger URLs are configured, the dashboard fetches live incidents and topology.
