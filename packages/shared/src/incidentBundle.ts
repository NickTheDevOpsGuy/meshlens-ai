/**
 * Incident bundle - aggregates telemetry data for AI-powered root cause analysis
 */

export type IncidentSeverity = "critical" | "high" | "medium" | "low";

export type IncidentStatus = "open" | "investigating" | "resolved" | "dismissed";

export interface ServiceNode {
  name: string;
  namespace?: string;
  version?: string;
  workload?: string;
}

export interface ServiceEdge {
  source: string;
  target: string;
  requestRate?: number;
  errorRate?: number;
  p99LatencyMs?: number;
}

export interface ServiceDependencyGraph {
  nodes: ServiceNode[];
  edges: ServiceEdge[];
}

export interface TelemetrySpan {
  traceId: string;
  spanId: string;
  serviceName: string;
  operation?: string;
  durationMs: number;
  statusCode?: number;
  error?: string;
  timestamp: string;
}

export interface MetricSample {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: string;
}

export interface IncidentBundle {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  affectedServices: string[];
  dependencyGraph: ServiceDependencyGraph;
  telemetrySpans?: TelemetrySpan[];
  metrics?: MetricSample[];
  rawLogs?: string[];
  summary?: string;
  rootCause?: string;
  aiAnalysis?: AIRootCauseAnalysis;
  runbookUrl?: string;
  traceId?: string;
}

export interface FiringAlert {
  fingerprint: string;
  labels: Record<string, string>;
  annotations?: Record<string, string>;
  startsAt: string;
  endsAt?: string;
}

export interface SLOState {
  name: string;
  target: number;
  current: number;
  unit: string;
  status: "healthy" | "warning" | "breach";
}

export interface AIRootCauseAnalysis {
  summary: string;
  rootCause: string;
  affectedPath: string[];
  recommendations: string[];
  confidence: number;
  analyzedAt: string;
}
