# Changelog

All notable changes to Meshlens AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Observability hub** – Central page at `/observability` for metrics (Prometheus), traces (Jaeger/Tempo), logs (Loki), dashboards (Grafana), and alerts (Alertmanager). Quick links to each backend when configured in Settings. Loki URL added to Settings for logs pillar.
- **ESLint** (web) with React + TypeScript rules
- **Prettier** with format/format:check scripts, wired into precheck
- **Husky** pre-commit and pre-push hooks
- **CONTRIBUTING.md** – development setup and PR guidelines
- **SECURITY.md** – responsible disclosure policy
- **CHANGELOG.md** – release notes
- **Dependabot** – weekly dependency updates
- **Issue templates** – bug report, feature request
- **Pull request template** – with checklist
- **API tests** – Vitest tests for Hono routes
- **Docker** – Dockerfile and docker-compose for deployment
- **Release workflow** – runs precheck and build on version tags
- **Prometheus SLO recording rules** – docs and sample `samples/prometheus/slo-recording-rules.yml`
- **Preview screenshot** – dashboard mockup in README
