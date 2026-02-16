# Incidents & Import

## Incident sources

Incidents in Meshlens AI can come from:

1. **Sample incidents** – Hardcoded in `sampleIncidents.ts`, always available
2. **API** – JSON files in `samples/incidents/` loaded by the API
3. **Static files** – `/samples/incidents/manifest.json` and listed JSON files (fallback when API is down)
4. **Prometheus** – Live incidents from high error rates (when configured)
5. **Alertmanager** – Firing alerts as incidents (when configured)

## Incident structure

Each incident has:

- `id` – Unique identifier
- `title` – Short description
- `severity` – `critical`, `high`, `medium`, `low`
- `status` – `open`, `investigating`, `resolved`, `dismissed`
- `affectedServices` – Array of service names
- `dependencyGraph` – `{ nodes: [...], edges: [...] }` with names, error rates, latency
- `runbookUrl` – Optional link (internal `/runbooks/...` or external URL)
- `traceId` – Optional Jaeger trace ID
- `aiAnalysis` – Optional cached AI result

See `packages/shared/src/incidentBundle.ts` for the full schema.

## Adding sample incidents

### Via JSON files

1. Add a `.json` file to `samples/incidents/`
2. Include it in `manifest.json`:

   ```json
   { "incidents": ["my-incident.json", "other.json"] }
   ```

3. If `manifest.json` is missing, all `*.json` files in the folder are loaded

### Via Import page

1. Go to **Import**
2. Paste incident JSON or upload a `.json` file
3. Click **Save to samples**

   - Requires the API to be running
   - Writes to `samples/incidents/` and updates `manifest.json`
   - On Vercel, Import is read-only; run locally to add incidents

## Hot-reload

When the API runs locally, it watches `samples/incidents/`. The dashboard polls `/api/samples/version` and refetches when the folder changes. After Import, the dashboard updates automatically.

## Incident correlation

On the Dashboard, use the **View** dropdown:

- **List** – Chronological list
- **Group by service** – Incidents grouped by affected service
- **Correlated** – Incidents that share a service and occurred within 30 minutes
