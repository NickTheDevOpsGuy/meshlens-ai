# Contributing to Meshlens AI

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone and install**

   ```bash
   git clone https://github.com/NickTheDevOpsGuy/meshlens-ai.git
   cd meshlens-ai
   pnpm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Add your `TETRATE_API_KEY` from [router.tetrate.ai](https://router.tetrate.ai/api-keys) for AI analysis.

3. **Run locally**

   ```bash
   pnpm dev
   ```

   This starts the web app at http://localhost:5173 and the API at http://localhost:3001.

## Code Standards

- **Formatting:** Run `pnpm run format` (Prettier) before committing.
- **Linting:** Run `pnpm run lint` and fix any issues. Use `pnpm run lint:fix` for auto-fixable rules.
- **Testing:** Run `pnpm run test` before pushing.
- **Pre-push:** Husky runs a full precheck (empty files, Prettier, ESLint, TypeScript, tests). Bypass with `[skip-precheck]` in the last commit message only when necessary.

## Pull Request Process

1. Fork the repository and create a branch from `develop`.
2. Make your changes, ensuring tests pass and lint succeeds.
3. Run `pnpm run precheck` locally to validate everything before pushing.
4. Open a PR with a clear description of the change.
5. Ensure CI passes and address any review feedback.

## Project Structure

- `apps/web` – React + Vite frontend
- `apps/api` – Hono API (Node + Vercel serverless)
- `packages/shared` – Shared TypeScript types
- `samples/incidents/` – Sample incident JSON files
- `docs/` – Documentation (mirrored to `apps/web/public/docs` for in-app viewing)

## Reporting Issues

Use [GitHub Issues](https://github.com/NickTheDevOpsGuy/meshlens-ai/issues) to report bugs or suggest features. Include relevant context (versions, environment, steps to reproduce).
