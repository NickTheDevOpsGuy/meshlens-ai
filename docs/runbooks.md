# Runbooks

## Runbook links

Each incident can have a `runbookUrl` that points to a runbook. In the Incident Detail page, a **📋 View runbook →** link appears when `runbookUrl` is set.

## Internal runbooks

Meshlens AI includes internal runbook templates at `/runbooks/:topic`:

| Topic               | Description                      |
| ------------------- | -------------------------------- |
| `payment-cascade`   | Payment service cascade failure  |
| `ml-timeouts`       | ML inference timeouts            |
| `config-rollback`   | Config rollback procedures       |
| `network-partition` | Network partition / connectivity |
| `memory-leak`       | Memory leak investigation        |

Use internal URLs in your incident JSON:

```json
"runbookUrl": "/runbooks/payment-cascade"
```

## External runbooks

You can link to external docs:

```json
"runbookUrl": "https://your-company.github.io/runbooks/payment-outage"
```

External links open in a new tab; internal links stay in the app.

## Adding templates

Edit `apps/web/src/pages/RunbookPage.tsx` and add entries to `RUNBOOK_TEMPLATES`:

```ts
"my-topic": {
  title: "My Runbook",
  steps: [
    "1. First step",
    "2. Second step",
    // ...
  ],
},
```

Then use `runbookUrl: "/runbooks/my-topic"` in your incidents.
