# Configuration

## Environment variables (.env)

| Variable            | Required     | Description                                                               |
| ------------------- | ------------ | ------------------------------------------------------------------------- |
| `TETRATE_API_KEY`   | Yes (for AI) | TARS API key from [router.tetrate.ai](https://router.tetrate.ai/api-keys) |
| `TARS_API_BASE_URL` | No           | Default: `https://api.router.tetrate.ai`                                  |
| `TARS_MODEL`        | No           | Model name, e.g. `gpt-4o-mini`, `claude-4-sonnet-20250514`                |
| `PORT`              | No           | API port, default `3001`                                                  |

Copy `.env.example` to `.env` and fill in values.

### Verifying TARS configuration

The `/api/health` endpoint returns whether TARS is configured:

```bash
curl -s https://your-deployment.vercel.app/api/health
# {"status":"ok","tarsConfigured":true}
```

If `tarsConfigured` is `false`, the `TETRATE_API_KEY` environment variable is not set or not available to the serverless function. Add it in Vercel **Settings → Environment Variables** and redeploy.

## App settings (Settings page)

These are stored in browser `localStorage` and can be changed in **Settings**:

### Telemetry backends

| Setting                | Purpose                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| **Prometheus URL**     | Metrics (Istio `istio_requests_total`, etc.). Used for live incidents and SLO. |
| **Jaeger / Tempo URL** | Traces. Enables trace drill-down links and live topology.                      |
| **Grafana URL**        | Optional. For linking to dashboards from the Observability hub.                |
| **Loki URL**           | Optional. Logs. Shown on Observability hub for correlation with traces.        |
| **Alertmanager URL**   | Firing alerts surfaced as incidents on the dashboard.                          |

These URLs appear on the **Observability** page, which provides a central hub for the three pillars of observability (metrics, traces, logs) plus dashboards and alerts.

### Notifications

| Setting                       | Purpose                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| **Slack webhook URL**         | Post incident summaries to Slack via **Notify Slack / PagerDuty**. |
| **PagerDuty integration key** | Create PagerDuty incidents (Events API v2).                        |

### Other

| Setting                   | Purpose                                                          |
| ------------------------- | ---------------------------------------------------------------- |
| **Live refresh interval** | How often to poll Prometheus/Alertmanager. Off, 30s, 1m, 2m, 5m. |

## Prometheus requirements

For live incidents, Prometheus should scrape:

- `istio_requests_total` (or similar service mesh metrics)
- `response_code`, `destination_service`, etc.

For SLO, the API runs default Istio error-rate and request-rate queries. Custom SLO recording rules can be used with the SLO API.

## Jaeger requirements

Jaeger’s `/api/dependencies` endpoint provides the service graph. Configure the base URL (e.g. `http://jaeger:16686`) in Settings.
