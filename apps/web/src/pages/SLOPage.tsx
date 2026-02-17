import { useState, useEffect } from "react";
import { sampleSLOs } from "../data/sampleSLOs";
import { loadSettings } from "../hooks/useSettings";

type SLOEntry = {
  name: string;
  value: number;
  target?: number;
  unit: string;
  status: string;
};

export default function SLOPage() {
  const [liveSLOs, setLiveSLOs] = useState<SLOEntry[] | null>(null);
  const settings = loadSettings();

  useEffect(() => {
    if (!settings.prometheusUrl) return;
    (async () => {
      try {
        const r = await fetch("/api/prometheus/slo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ baseUrl: settings.prometheusUrl }),
        });
        const data = await r.json();
        setLiveSLOs(Array.isArray(data) ? data : null);
      } catch {
        setLiveSLOs(null);
      }
    })();
  }, [settings.prometheusUrl]);

  const slos =
    liveSLOs ??
    sampleSLOs.map((s) => ({
      name: s.name,
      value: s.current,
      target: s.target,
      unit: s.unit,
      status: s.status,
    }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">
          SLO / SLI overview
        </h1>
        <p className="text-slate-400 mt-1">
          Service level objectives vs actuals
        </p>
        {liveSLOs && (
          <span className="text-sm text-emerald-400">
            ● Live from Prometheus
          </span>
        )}
      </div>

      <div className="space-y-4">
        {slos.map((slo) => {
          const val = slo.value;
          const target = slo.target ?? 0;
          const isHigherBetter = slo.unit === "%" || slo.status === "healthy";
          const barPct =
            target > 0
              ? isHigherBetter
                ? Math.min((val / target) * 100, 100)
                : Math.max(100 - (val / target) * 100, 0)
              : 50;
          const statusColor =
            slo.status === "breach" || slo.status === "unknown"
              ? "border-rose-500/50 bg-rose-500/10"
              : slo.status === "warning"
                ? "border-amber-500/50 bg-amber-500/10"
                : "border-emerald-500/50 bg-emerald-500/10";
          return (
            <div
              key={slo.name}
              className={`p-4 rounded-xl border ${statusColor}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-200">{slo.name}</span>
                <span className="text-sm text-slate-400">
                  {val}
                  {slo.unit} {target > 0 ? `/ ${target}${slo.unit} target` : ""}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    slo.status === "breach" || slo.status === "unknown"
                      ? "bg-rose-500"
                      : slo.status === "warning"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(barPct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Connect Prometheus with SLO recording rules for live SLO data.
      </p>
    </div>
  );
}
