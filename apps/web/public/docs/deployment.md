# Deployment

## Vercel

Meshlens AI deploys to Vercel with the web app and API as serverless functions.

### Steps

1. Import the repo at [vercel.com](https://vercel.com)
2. **Project Settings** → **Build & Development**:
   - **Root Directory**: leave **empty** (repo root) — required for `/api/*` functions
   - **Framework Preset**: Vite or React
   - **Include source files outside of the Root Directory**: enable
3. Add env vars (optional): `TETRATE_API_KEY`, `TARS_API_BASE_URL`, `TARS_MODEL`. If POST requests fail, add `NODEJS_HELPERS=0`.
4. Redeploy after adding env vars (they are baked in at build time).

### Verifying AI analysis on Vercel

Check that TARS is configured:

```bash
curl -s https://your-project.vercel.app/api/health
# {"status":"ok","tarsConfigured":true}
```

If `tarsConfigured` is `false`, add `TETRATE_API_KEY` in **Settings → Environment Variables** and redeploy.

### Behavior on Vercel

- **Static**: Frontend built and served from CDN
- **API**: Serverless at `/api/*` (from `apps/web/api/`)
- **Samples**: Read from repo; Import is **read-only** on Vercel
- **AI analysis**: Works if `TETRATE_API_KEY` is set (verify via `/api/health`)

### Import on Vercel

Import (save new incidents) writes to the filesystem, which is read-only on Vercel. To add incidents when deployed, run the API locally and use Import, or add JSON files via Git.

## Local production build

```bash
pnpm build
```

Then serve `apps/web/dist` with any static host. The API must run separately (e.g. `pnpm dev:api` or deploy to Railway/Render) and the frontend must proxy `/api` to it, or use absolute API URLs via env.
