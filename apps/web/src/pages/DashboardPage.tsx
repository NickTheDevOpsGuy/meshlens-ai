import { Link } from "react-router-dom";
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

export default function DashboardPage() {
  const openCount = sampleIncidents.filter((i) => i.status !== "resolved" && i.status !== "dismissed").length;
  const criticalCount = sampleIncidents.filter((i) => i.severity === "critical").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Incident Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Active incidents and AI-powered analysis
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <StatCard
          label="Open incidents"
          value={openCount}
          color="cyan"
        />
        <StatCard
          label="Critical"
          value={criticalCount}
          color="rose"
        />
        <StatCard
          label="Total today"
          value={sampleIncidents.length}
          color="indigo"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Recent Incidents</h2>
        {sampleIncidents.map((incident) => (
          <Link
            key={incident.id}
            to={`/incidents/${incident.id}`}
            className="block p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80 transition-all group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-100 group-hover:text-cyan-400 transition-colors truncate">
                  {incident.title}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {incident.affectedServices.join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border ${severityStyles[incident.severity]}`}
                >
                  {incident.severity}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusStyles[incident.status]}`}
                >
                  {incident.status}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(incident.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            {incident.aiAnalysis && (
              <p className="mt-3 text-sm text-slate-400 line-clamp-2">
                {incident.aiAnalysis.summary}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "cyan" | "rose" | "indigo";
}) {
  const colorClasses = {
    cyan: "text-cyan-400 border-cyan-500/30",
    rose: "text-rose-400 border-rose-500/30",
    indigo: "text-indigo-400 border-indigo-500/30",
  };
  return (
    <div className={`p-5 rounded-xl border bg-slate-900/50 ${colorClasses[color]}`}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
