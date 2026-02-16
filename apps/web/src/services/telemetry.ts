import type {
  IncidentBundle,
  ServiceNode,
  ServiceEdge,
  ServiceDependencyGraph,
} from "@meshlens/shared";

const API_BASE = "";

async function prometheusQuery(
  baseUrl: string,
  query: string,
  time?: string
): Promise<{
  status: string;
  data?: {
    result: Array<{ metric: Record<string, string>; value: [number, string] }>;
  };
}> {
  const res = await fetch(`${API_BASE}/api/prometheus/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ baseUrl, query, time }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Prometheus query failed");
  return data;
}

async function jaegerDependencies(
  baseUrl: string,
  endTs: number,
  lookback: number
): Promise<{
  data?: Array<{ parent: string; child: string; callCount: number }>;
}> {
  const url = `${API_BASE}/api/jaeger/dependencies?baseUrl=${encodeURIComponent(baseUrl)}&endTs=${endTs}&lookback=${lookback}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Jaeger dependencies failed");
  return data;
}

export async function fetchPrometheusTopology(
  prometheusUrl: string
): Promise<ServiceDependencyGraph> {
  const nodes = new Map<string, ServiceNode>();
  const edgesMap = new Map<
    string,
    { source: string; target: string; requestRate: number; errorCount: number }
  >();

  const istioTotalQuery = `sum by (source_app, source_workload_namespace, destination_app, destination_workload_namespace) (rate(istio_requests_total{reporter="destination"}[5m]))`;
  const istioErrorQuery = `sum by (source_app, source_workload_namespace, destination_app, destination_workload_namespace) (rate(istio_requests_total{reporter="destination",response_code=~"5.."}[5m]))`;

  const addResults = (
    result: { metric: Record<string, string>; value: [number, string] }[],
    isError: boolean
  ) => {
    for (const item of result) {
      const m = item.metric;
      const sourceApp = m.source_app || m.source_workload || "unknown";
      const sourceNs = m.source_workload_namespace || "";
      const destApp = m.destination_app || m.destination_workload || "unknown";
      const destNs = m.destination_workload_namespace || "";

      const source = sourceApp !== "unknown" ? sourceApp : sourceNs || "source";
      const target = destApp !== "unknown" ? destApp : destNs || "target";

      nodes.set(source, { name: source, namespace: sourceNs || undefined });
      nodes.set(target, { name: target, namespace: destNs || undefined });

      const key = `${source}->${target}`;
      const val = parseFloat(item.value[1]) || 0;
      const existing = edgesMap.get(key) ?? {
        source,
        target,
        requestRate: 0,
        errorCount: 0,
      };
      if (isError) {
        existing.errorCount += val;
      } else {
        existing.requestRate += val;
      }
      edgesMap.set(key, existing);
    }
  };

  try {
    const [totalRes, errorRes] = await Promise.all([
      prometheusQuery(prometheusUrl, istioTotalQuery),
      prometheusQuery(prometheusUrl, istioErrorQuery),
    ]);
    if (totalRes.data?.result) addResults(totalRes.data.result, false);
    if (errorRes.data?.result) addResults(errorRes.data.result, true);
  } catch (err) {
    throw new Error(
      `Prometheus query failed. Ensure Prometheus is reachable and scraping Istio/Envoy metrics. ${err instanceof Error ? err.message : ""}`,
      { cause: err }
    );
  }

  if (nodes.size === 0) {
    throw new Error(
      "No service mesh metrics found. Ensure Istio or Envoy metrics (istio_requests_total) are scraped by Prometheus."
    );
  }

  const edges: ServiceEdge[] = Array.from(edgesMap.values()).map((e) => ({
    source: e.source,
    target: e.target,
    requestRate: e.requestRate,
    errorRate: e.requestRate > 0 ? e.errorCount / e.requestRate : 0,
  }));

  return { nodes: Array.from(nodes.values()), edges };
}

export async function fetchJaegerTopology(
  jaegerUrl: string
): Promise<ServiceDependencyGraph> {
  const endTs = Date.now() * 1000;
  const lookback = 3600000;

  const depRes = await jaegerDependencies(jaegerUrl, endTs, lookback);
  const deps = depRes.data ?? [];

  const nodes = new Map<string, ServiceNode>();
  const edges: ServiceEdge[] = [];

  for (const d of deps) {
    const parent = d.parent || "unknown";
    const child = d.child || "unknown";
    if (parent === "unknown" || child === "unknown") continue;

    nodes.set(parent, { name: parent });
    nodes.set(child, { name: child });
    edges.push({ source: parent, target: child, requestRate: d.callCount });
  }

  return { nodes: Array.from(nodes.values()), edges };
}

export async function fetchLiveTopology(
  prometheusUrl?: string,
  jaegerUrl?: string
): Promise<ServiceDependencyGraph | null> {
  try {
    if (prometheusUrl) return await fetchPrometheusTopology(prometheusUrl);
    if (jaegerUrl) return await fetchJaegerTopology(jaegerUrl);
  } catch {
    return null;
  }
  return null;
}

export async function fetchLiveIncidents(
  prometheusUrl?: string,
  jaegerUrl?: string
): Promise<IncidentBundle[]> {
  const incidents: IncidentBundle[] = [];
  const now = new Date().toISOString();

  try {
    const graph = await fetchLiveTopology(prometheusUrl, jaegerUrl);

    if (graph && graph.edges.length > 0) {
      const failingEdges = graph.edges.filter((e) => (e.errorRate ?? 0) > 0.1);

      if (failingEdges.length > 0) {
        const affectedServices = new Set<string>();
        failingEdges.forEach((e) => {
          affectedServices.add(e.source);
          affectedServices.add(e.target);
        });

        incidents.push({
          id: `live-${Date.now()}`,
          title: "High error rate detected from Prometheus",
          severity: "high",
          status: "open",
          createdAt: now,
          updatedAt: now,
          affectedServices: Array.from(affectedServices),
          dependencyGraph: graph,
          summary: `${failingEdges.length} service edge(s) with >10% error rate.`,
          aiAnalysis: undefined,
        });
      }
    }
  } catch (err) {
    console.warn("Telemetry fetch failed:", err);
  }

  return incidents;
}
