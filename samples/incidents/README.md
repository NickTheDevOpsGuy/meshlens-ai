# Sample incident bundles

Add JSON files here to extend Meshlens with your own incident scenarios. Each file should follow the `IncidentBundle` schema.

**Loading:** The API reads from this folder at runtime. Add JSON files and list them in `manifest.json`. They appear in the Dashboard when the API is running. If the API is unavailable, the app falls back to static files in `apps/web/public/samples/incidents/`.

## Schema (minimal)

```json
{
  "id": "unique-id",
  "title": "Short description",
  "severity": "critical|high|medium|low",
  "status": "open|investigating|resolved|dismissed",
  "createdAt": "2025-02-13T12:00:00Z",
  "updatedAt": "2025-02-13T12:00:00Z",
  "affectedServices": ["service-a", "service-b"],
  "dependencyGraph": {
    "nodes": [{ "name": "service-a", "namespace": "default" }],
    "edges": [{ "source": "service-a", "target": "service-b", "errorRate": 0.5 }]
  }
}
```

See `packages/shared/src/incidentBundle.ts` for the full type definition.
