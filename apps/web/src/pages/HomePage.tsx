import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.15),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(99,102,241,0.08),transparent)]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center space-y-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="text-slate-100">Meshlens</span>
            <span className="text-cyan-400"> AI</span>
          </h1>
          <p className="text-xl sm:text-2xl text-slate-400 max-w-2xl mx-auto font-light">
            AI-powered service mesh incident debugger. Analyze telemetry,
            identify root causes, and visualize failing service dependencies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 hover:border-cyan-500/50 transition-all font-medium"
            >
              View Dashboard
            </Link>
            <Link
              to="/topology"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all font-medium"
            >
              Service Topology
            </Link>
          </div>
        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-3">
          <FeatureCard
            title="Telemetry Analysis"
            description="Ingest metrics, traces, and logs from Istio, Envoy, Prometheus, and Jaeger. AI correlates signals to surface anomalies."
            icon="📊"
          />
          <FeatureCard
            title="Root Cause Detection"
            description="TARS-powered AI pinpoints root causes from your telemetry. Get explanations, affected paths, and actionable recommendations."
            icon="🔍"
          />
          <FeatureCard
            title="Dependency Visualization"
            description="Interactive service map shows failing edges, error rates, and latency. Trace the blast radius of each incident."
            icon="🕸️"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80 transition-all">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
