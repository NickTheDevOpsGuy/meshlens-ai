import { useParams, Link } from "react-router-dom";
import { sampleIncidents } from "../data/sampleIncidents";
import type { IncidentSeverity, IncidentStatus } from "@meshlens/shared";

const severityStyles: Record<IncidentSeverity, string> = {
  critical: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  high: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  medium: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const statusStyles: Record<IncidentStatus, string> = {
  open: "bg-rose-500/10 text-rose-400",
  investigating: "bg-amber-500/10 text-amber-400",
  resolved: "bg-emerald-500/10 text-emerald-400",
  dismissed: "bg-slate-500/10 text-slate-500",
};

export default function IncidentDetailPage() {
  const { id } = useParams();
  const incident = sampleIncidents.find((i) => i.id === id);

  if (!incident) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-300">Incident not found</h1>
        <Link to="/dashboard" className="mt-4 inline-block text-cyan-400 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const { aiAnalysis, dependencyGraph } = incident;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 mb-6 transition-colors"
      >
        ← Back to dashboard
      </Link>

      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${severityStyles[incident.severity]}`}>
            {incident.severity}
          </span>
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusStyles[incident.status]}`}>
            {incident.status}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {incident.id} · {new Date(incident.createdAt).toLocaleString()}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100">{incident.title}</h1>
        <p className="text-slate-400 mt-2">Affected: {incident.affectedServices.join(", ")}</p>
      </div>

      {aiAnalysis && (
        <section className="mb-8 p-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
          <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-4">
            AI Root Cause Analysis
          </h2>
          <p className="text-slate-200 mb-4">{aiAnalysis.summary}</p>
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-1">Root cause</h3>
              <p className="text-slate-200 font-medium">{aiAnalysis.rootCause}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-2">Affected path</h3>
              <ul className="space-y-1 text-sm text-slate-300 font-mono">
                {aiAnalysis.affectedPath.map((path, i) => (
                  <li key={i}>{path}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-2">Recommendations</h3>
              <ul className="space-y-2">
                {aiAnalysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2 text-slate-300">
                    <span className="text-cyan-500">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Confidence: {(aiAnalysis.confidence * 100).toFixed(0)}% · Analyzed at{" "}
            {new Date(aiAnalysis.analyzedAt).toLocaleString()}
          </p>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Dependency graph</h2>
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 font-mono text-sm">
          <div className="space-y-4">
            <div>
              <span className="text-slate-500">Nodes:</span>
              <ul className="mt-2 grid sm:grid-cols-2 gap-2">
                {dependencyGraph.nodes.map((n) => (
                  <li key={n.name} className="text-slate-300">
                    <span className="text-cyan-400">{n.name}</span>
                    {n.namespace && (
                      <span className="text-slate-500"> ({n.namespace})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-slate-500">Edges:</span>
              <ul className="mt-2 space-y-2">
                {dependencyGraph.edges.map((e, i) => (
                  <li key={i} className="text-slate-300">
                    <span className="text-cyan-400">{e.source}</span>
                    <span className="text-slate-500"> → </span>
                    <span className="text-indigo-400">{e.target}</span>
                    {e.errorRate !== undefined && (
                      <span className="text-rose-400 ml-2">
                        (err: {(e.errorRate * 100).toFixed(1)}%)
                      </span>
                    )}
                    {e.p99LatencyMs !== undefined && (
                      <span className="text-amber-400 ml-2">
                        p99: {e.p99LatencyMs}ms
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Link
        to={`/topology?incident=${incident.id}`}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all text-sm font-medium"
      >
        View in Service Map →
      </Link>
    </div>
  );
}
