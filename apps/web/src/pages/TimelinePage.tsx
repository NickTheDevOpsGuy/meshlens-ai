import { Link } from "react-router-dom";
import { useIncidents } from "../hooks/useIncidents";

export default function TimelinePage() {
  const { incidents } = useIncidents();

  const sorted = [...incidents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const ONE_DAY_MS = 86400000;
  const minTime = sorted.length
    ? Math.min(...incidents.map((i) => new Date(i.createdAt).getTime()))
    : 0;
  const maxTime = sorted.length
    ? Math.max(
        ...incidents.map((i) => new Date(i.updatedAt).getTime()),
        minTime + ONE_DAY_MS
      )
    : ONE_DAY_MS;
  const range = maxTime - minTime || 1;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Incident timeline</h1>
        <p className="text-slate-400 mt-1">
          Overlapping incidents and duration
        </p>
      </div>

      <div className="relative">
        <div className="h-1 bg-slate-700 rounded-full" />
        <div className="mt-4 space-y-2">
          {sorted.map((inc) => {
            const start = (new Date(inc.createdAt).getTime() - minTime) / range;
            const end = (new Date(inc.updatedAt).getTime() - minTime) / range;
            const width = Math.max(((end - start) / range) * 100, 2);
            const left = (start / range) * 100;
            const severityColor =
              inc.severity === "critical"
                ? "bg-rose-500"
                : inc.severity === "high"
                  ? "bg-amber-500"
                  : inc.severity === "medium"
                    ? "bg-cyan-500"
                    : "bg-slate-500";
            return (
              <Link
                key={inc.id}
                to={`/incidents/${inc.id}`}
                state={{ incident: inc }}
                className="block group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-8 rounded ${severityColor} min-w-[40px] group-hover:opacity-80`}
                    style={{
                      width: `${Math.max(width * 4, 80)}px`,
                      marginLeft: `${left * 2}%`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-slate-200 group-hover:text-cyan-400 truncate block">
                      {inc.title}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(inc.createdAt).toLocaleString()} →
                      {new Date(inc.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">
                    {inc.severity}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {sorted.length === 0 && (
        <p className="text-slate-500 text-center py-12">
          No incidents to display
        </p>
      )}
    </div>
  );
}
