import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useIncidents } from "../hooks/useIncidents";
import { fetchLiveTopology } from "../services/telemetry";
import { loadSettings } from "../hooks/useSettings";
import type { ServiceDependencyGraph } from "@meshlens/shared";

export default function ServiceMapPage() {
  const [searchParams] = useSearchParams();
  const [liveGraph, setLiveGraph] = useState<ServiceDependencyGraph | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  const settings = loadSettings();
  const hasTelemetry = !!(settings.prometheusUrl || settings.traceUrl);
  const { incidents } = useIncidents();

  const incidentId = searchParams.get("incident");
  const useLive = searchParams.get("live") === "1";
  const incident = incidentId
    ? incidents.find((i) => i.id === incidentId)
    : incidents[0];
  const sampleGraph = incident?.dependencyGraph ?? (incidents[0]?.dependencyGraph ?? { nodes: [], edges: [] });

  useEffect(() => {
    if (!hasTelemetry || !useLive) return;
    setLiveLoading(true);
    setLiveError(null);
    fetchLiveTopology(settings.prometheusUrl || undefined, settings.traceUrl || undefined)
      .then(setLiveGraph)
      .catch((e) => setLiveError(e instanceof Error ? e.message : "Failed to fetch"))
      .finally(() => setLiveLoading(false));
  }, [hasTelemetry, useLive, settings.prometheusUrl, settings.traceUrl]);

  const graph = (useLive && liveGraph) ? liveGraph : sampleGraph;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Service topology</h1>
          <p className="text-slate-400 mt-1">
            Failing service dependencies and request flows
          </p>
        </div>
        <div className="flex items-center gap-4">
          {incident && !useLive && (
            <span className="text-sm text-slate-400">
              Viewing topology for{" "}
              <span className="text-cyan-400 font-medium">{incident.title}</span>
            </span>
          )}
          {useLive && (
            <span className="text-sm text-emerald-400">● Live from Prometheus/Jaeger</span>
          )}
          {hasTelemetry && (
            <Link
              to={useLive ? "/topology" : "/topology?live=1"}
              className="text-sm text-cyan-400 hover:underline"
            >
              {useLive ? "Switch to sample" : "Load live topology"}
            </Link>
          )}
        </div>
      </div>

      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 min-h-[500px]">
        {liveLoading && (
          <div className="mb-4 text-sm text-slate-400">Fetching live topology...</div>
        )}
        {liveError && (
          <div className="mb-4 text-sm text-rose-400">{liveError}</div>
        )}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <TopologyVisualization graph={graph} />
          </div>
          <div className="lg:w-72 flex-shrink-0 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Services ({graph.nodes.length})
              </h3>
              <ul className="space-y-2">
                {graph.nodes.map((n) => (
                  <li
                    key={n.name}
                    className="flex items-center gap-2 text-sm text-slate-300"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <span className="font-mono">{n.name}</span>
                    {n.namespace && (
                      <span className="text-slate-500 text-xs">{n.namespace}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Connections
              </h3>
              <ul className="space-y-2">
                {graph.edges.map((e, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-mono text-cyan-400">{e.source}</span>
                    <span className="text-slate-600 mx-1">→</span>
                    <span className="font-mono text-indigo-400">{e.target}</span>
                    {e.errorRate !== undefined && e.errorRate > 0.1 && (
                      <span className="ml-2 text-rose-400 text-xs">
                        {(e.errorRate * 100).toFixed(1)}% err
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        This is a simplified topology view using sample incident data.         To test
        different topologies, visit{" "}
        <Link to="/dashboard" className="text-cyan-500 hover:underline">
          Dashboard
        </Link>{" "}
        and open an incident, or add{" "}
        <code className="text-slate-400">?incident=inc-002</code> to this URL.
        Connect Prometheus, Jaeger, or Istio telemetry in Settings for live
        dependency discovery.
      </p>
    </div>
  );
}

function TopologyVisualization({
  graph,
}: {
  graph: { nodes: { name: string }[]; edges: { source: string; target: string; errorRate?: number }[] };
}) {
  const nodePositions = layoutNodes(graph.nodes, graph.edges);
  const width = 640;
  const height = 440;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-h-[440px] text-slate-700"
    >
      <defs>
        <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="errorEdge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {graph.edges.map((e, i) => {
        const src = nodePositions[e.source];
        const tgt = nodePositions[e.target];
        if (!src || !tgt) return null;
        const hasError = (e.errorRate ?? 0) > 0.1;
        return (
          <line
            key={i}
            x1={src.x}
            y1={src.y}
            x2={tgt.x}
            y2={tgt.y}
            stroke={hasError ? "url(#errorEdge)" : "url(#edgeGradient)"}
            strokeWidth={hasError ? 2.5 : 1.5}
            strokeOpacity={hasError ? 0.9 : 0.5}
          />
        );
      })}
      {graph.nodes.map((n) => {
        const pos = nodePositions[n.name];
        if (!pos) return null;
        return (
          <g key={n.name}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={20}
              fill="#0f172a"
              stroke="#22d3ee"
              strokeWidth={2}
            />
            <text
              x={pos.x}
              y={pos.y + 32}
              textAnchor="middle"
              className="fill-slate-300 font-mono text-[11px]"
            >
              {n.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function layoutNodes(
  nodes: { name: string }[],
  edges: { source: string; target: string }[]
): Record<string, { x: number; y: number }> {
  const width = 640;
  const height = 440;
  const positions: Record<string, { x: number; y: number }> = {};
  const layers = partitionLayers(nodes, edges);
  const maxInLayer = Math.max(1, ...layers.map((l) => l.length));
  const layerHeight = (height - 80) / maxInLayer;
  const layerWidth = width / (layers.length + 1);

  layers.forEach((layer, layerIdx) => {
    layer.forEach((node, nodeIdx) => {
      positions[node] = {
        x: (layerIdx + 1) * layerWidth,
        y: 50 + (nodeIdx + 0.5) * layerHeight,
      };
    });
  });

  return positions;
}

function partitionLayers(
  nodes: { name: string }[],
  edges: { source: string; target: string }[]
): string[][] {
  const inDegree: Record<string, number> = {};
  nodes.forEach((n) => (inDegree[n.name] = 0));
  edges.forEach((e) => {
    if (inDegree[e.target] !== undefined) inDegree[e.target]++;
  });

  const layers: string[][] = [];
  const assigned = new Set<string>();
  let remaining = new Set(nodes.map((n) => n.name));

  while (remaining.size > 0) {
    const layer = [...remaining].filter((n) => {
      const deps = edges.filter((e) => e.target === n).map((e) => e.source);
      return deps.every((d) => assigned.has(d));
    });
    if (layer.length === 0) {
      const first = [...remaining][0];
      layer.push(first);
      assigned.add(first);
      remaining.delete(first);
    } else {
      layer.forEach((n) => {
        assigned.add(n);
        remaining.delete(n);
      });
    }
    layers.push(layer);
  }

  return layers;
}
