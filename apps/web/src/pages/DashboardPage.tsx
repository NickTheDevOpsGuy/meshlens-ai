import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useIncidents } from "../hooks/useIncidents";
import type { IncidentSeverity, IncidentStatus } from "@meshlens/shared";
import type { IncidentBundle } from "@meshlens/shared";

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

type SeverityFilter = IncidentSeverity | "all";
type StatusFilter = IncidentStatus | "all";
type ViewMode = "list" | "by-service" | "correlated";

const CORRELATION_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

function correlateIncidents(incidents: IncidentBundle[]): IncidentBundle[][] {
  const sorted = [...incidents].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const groups: IncidentBundle[][] = [];
  const used = new Set<string>();

  for (const inc of sorted) {
    if (used.has(inc.id)) continue;
    const group: IncidentBundle[] = [inc];
    used.add(inc.id);
    let services = new Set(inc.affectedServices);
    let groupTimes = [new Date(inc.createdAt).getTime()];
    let changed = true;
    while (changed) {
      changed = false;
      for (const other of sorted) {
        if (used.has(other.id)) continue;
        const t1 = new Date(other.createdAt).getTime();
        const sharesService = other.affectedServices.some((s) => services.has(s));
        const withinWindow = groupTimes.some((t) => Math.abs(t1 - t) <= CORRELATION_WINDOW_MS);
        if (sharesService && withinWindow) {
          group.push(other);
          used.add(other.id);
          other.affectedServices.forEach((s) => services.add(s));
          groupTimes.push(t1);
          changed = true;
        }
      }
    }
    groups.push(group);
  }
  return groups.filter((g) => g.length > 0);
}

function groupByService(incidents: IncidentBundle[]): Map<string, IncidentBundle[]> {
  const map = new Map<string, IncidentBundle[]>();
  for (const inc of incidents) {
    const services = inc.affectedServices.length > 0 ? inc.affectedServices : ["(no services)"];
    for (const svc of services) {
      const list = map.get(svc) ?? [];
      if (!list.some((i) => i.id === inc.id)) list.push(inc);
      map.set(svc, list);
    }
  }
  return map;
}

export default function DashboardPage() {
  const { incidents, loading, liveLoading, error, hasTelemetry, hasAlertmanager } = useIncidents();
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      if (severity !== "all" && i.severity !== severity) return false;
      if (status !== "all" && i.status !== status) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = i.title.toLowerCase().includes(q);
        const matchServices = i.affectedServices.some((s) => s.toLowerCase().includes(q));
        if (!matchTitle && !matchServices) return false;
      }
      return true;
    });
  }, [incidents, severity, status, search]);

  const groupedByService = useMemo(
    () => groupByService(filtered),
    [filtered]
  );

  const correlatedGroups = useMemo(
    () => correlateIncidents(filtered),
    [filtered]
  );

  const openCount = incidents.filter((i) => i.status !== "resolved" && i.status !== "dismissed").length;
  const criticalCount = incidents.filter((i) => i.severity === "critical").length;

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
          value={incidents.length}
          color="indigo"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <input
            type="search"
            placeholder="Search by title or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Severity</span>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as SeverityFilter)}
            className="rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-sm px-2 py-1"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-sm px-2 py-1"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">View</span>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className="rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-sm px-2 py-1"
          >
            <option value="list">List</option>
            <option value="by-service">Group by service</option>
            <option value="correlated">Correlated</option>
          </select>
        </div>
        {(hasTelemetry || hasAlertmanager) && (
          <>
            <span className="text-sm text-emerald-400">● Live</span>
            {liveLoading && <span className="text-sm text-slate-500">Fetching...</span>}
            {error && <span className="text-sm text-rose-400">{error}</span>}
          </>
        )}
        {loading && <span className="text-sm text-slate-500">Loading samples...</span>}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">
          {viewMode === "list" && "Recent Incidents"}
          {viewMode === "by-service" && "Incidents by Service"}
          {viewMode === "correlated" && "Correlated Incident Groups"}
        </h2>

        {viewMode === "list" &&
          filtered.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}

        {viewMode === "by-service" &&
          Array.from(groupedByService.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([svc, list]) => (
              <div key={svc} className="space-y-2">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  {svc} ({list.length})
                </h3>
                <div className="space-y-2 pl-4 border-l-2 border-slate-700">
                  {list.map((incident) => (
                    <IncidentCard key={incident.id} incident={incident} />
                  ))}
                </div>
              </div>
            ))}

        {viewMode === "correlated" &&
          correlatedGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Correlated group · {group.length} incident{group.length !== 1 ? "s" : ""} · shared services, within 30 min
              </h3>
              <div className="space-y-2 pl-4 border-l-2 border-cyan-500/30">
                {group.map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function IncidentCard({ incident }: { incident: IncidentBundle }) {
  return (
    <Link
      to={`/incidents/${incident.id}`}
      state={{ incident }}
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
