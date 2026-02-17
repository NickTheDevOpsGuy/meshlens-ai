import { Link } from "react-router-dom";
import { loadSettings } from "../hooks/useSettings";

type ObservabilityCard = {
  id: string;
  title: string;
  description: string;
  icon: string;
  url?: string;
  configured: boolean;
};

export default function ObservabilityPage() {
  const settings = loadSettings();

  const cards: ObservabilityCard[] = [
    {
      id: "metrics",
      title: "Metrics",
      description:
        "Prometheus metrics for request rates, error rates, and latency. Istio and Envoy expose service mesh metrics.",
      icon: "📊",
      url: settings.prometheusUrl || undefined,
      configured: !!settings.prometheusUrl,
    },
    {
      id: "dashboards",
      title: "Dashboards",
      description:
        "Grafana dashboards for unified views of metrics, traces, and logs across your service mesh.",
      icon: "📈",
      url: settings.grafanaUrl || undefined,
      configured: !!settings.grafanaUrl,
    },
    {
      id: "traces",
      title: "Traces",
      description:
        "Jaeger or Tempo for distributed tracing. Follow requests across service boundaries.",
      icon: "🕸️",
      url: settings.traceUrl || undefined,
      configured: !!settings.traceUrl,
    },
    {
      id: "logs",
      title: "Logs",
      description:
        "Loki or similar for log aggregation. Correlate logs with traces via trace IDs.",
      icon: "📜",
      url: settings.lokiUrl || undefined,
      configured: !!settings.lokiUrl,
    },
    {
      id: "alerts",
      title: "Alerts",
      description:
        "Alertmanager for firing alerts. Prometheus rules trigger when SLOs breach or anomalies occur.",
      icon: "🔔",
      url: settings.alertmanagerUrl || undefined,
      configured: !!settings.alertmanagerUrl,
    },
  ];

  const configuredCount = cards.filter((c) => c.configured).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Observability</h1>
        <p className="text-slate-400 mt-1">
          Central hub for metrics, traces, logs, and alerts. Configure backends
          in{" "}
          <Link to="/settings" className="text-cyan-400 hover:underline">
            Settings
          </Link>
          .
        </p>
        {configuredCount > 0 && (
          <p className="text-sm text-emerald-400 mt-2">
            ● {configuredCount} of {cards.length} backends configured
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`p-6 rounded-xl border transition-colors ${
              card.configured
                ? "border-slate-700 bg-slate-900/50 hover:border-cyan-500/30"
                : "border-slate-800/50 bg-slate-900/30"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl" role="img" aria-hidden>
                {card.icon}
              </span>
              {card.configured ? (
                <span className="text-xs font-medium text-emerald-400/90 bg-emerald-500/10 px-2 py-1 rounded">
                  Connected
                </span>
              ) : (
                <span className="text-xs text-slate-500">Not configured</span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-slate-200 mb-2">
              {card.title}
            </h2>
            <p className="text-sm text-slate-400 mb-4">{card.description}</p>
            {card.configured && card.url ? (
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Open {card.title}
                <span aria-hidden>↗</span>
              </a>
            ) : (
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-cyan-400 transition-colors"
              >
                Add in Settings
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-xl border border-slate-800 bg-slate-900/50">
        <h2 className="text-lg font-semibold text-slate-200 mb-3">
          Observability pillars
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Meshlens AI integrates with the three pillars of observability:
        </p>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">•</span>
            <span>
              <strong className="text-slate-300">Metrics</strong> — Prometheus
              for rates, histograms, and SLOs. Power live incidents and
              topology.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">•</span>
            <span>
              <strong className="text-slate-300">Traces</strong> — Jaeger or
              Tempo for request flows. Links to traces from incident details.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">•</span>
            <span>
              <strong className="text-slate-300">Logs</strong> — Loki or
              similar. Correlate with traces via trace IDs for full context.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
