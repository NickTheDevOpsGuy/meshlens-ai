# Meshlens AI Documentation

Meshlens AI is an **AI-powered service mesh incident debugger** that helps engineers correlate incidents, analyze root causes, and respond faster.

---

## What is Meshlens AI?

When service mesh incidents happen—cascading failures, timeout storms, config rollbacks—engineers often spend hours correlating metrics, traces, and logs to find the root cause. Meshlens AI aggregates incident data from multiple sources and uses **Tetrate Agent Router Service (TARS)** to suggest root causes and recommendations.

### Key concepts

- **Incidents** – Failures, outages, or degraded behavior affecting one or more services. Each incident has a title, severity, status, affected services, and a dependency graph.
- **Dependency graph** – Nodes (services) and edges (calls between them) with error rates and latency. Used for topology visualization and AI analysis.
- **TARS** – Tetrate’s AI routing service. When you click **Analyze with AI**, the incident and graph are sent to TARS, which returns a suggested root cause and recommendations.

---

## Documentation index

In the app, open **Docs** in the nav or go to `/docs`. On GitHub, browse the markdown files:

| Page                                                                  | Description                                                            |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [Getting Started](./getting-started.md)                               | Install, run, and first steps                                          |
| [Configuration](./configuration.md)                                   | TARS, Prometheus, Jaeger, Loki, Grafana, Alertmanager, Slack/PagerDuty |
| [Incidents & Import](./incidents.md)                                  | Sample data, import, incident lifecycle                                |
| [Runbooks](./runbooks.md)                                             | Runbook links and templates                                            |
| [Deployment](./deployment.md)                                         | Vercel deployment                                                      |
| [Prometheus SLO Recording Rules](./prometheus-slo-recording-rules.md) | Pre-compute SLO metrics for better performance                         |

---

## Architecture overview

```
┌─────────────────┐     ┌──────────────────────────────────────────────────┐
│   React + Vite  │     │                    Hono API                     │
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
- **Live telemetry**: Optional. When Prometheus/Jaeger URLs are configured, the dashboard fetches live incidents and topology.
