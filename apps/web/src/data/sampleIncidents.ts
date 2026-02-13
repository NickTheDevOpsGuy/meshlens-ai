import type { IncidentBundle } from "@meshlens/shared";

export const sampleIncidents: IncidentBundle[] = [
  {
    id: "inc-001",
    title: "Payment service cascade failure",
    severity: "critical",
    status: "investigating",
    createdAt: "2025-02-13T08:15:00Z",
    updatedAt: "2025-02-13T09:42:00Z",
    affectedServices: ["payment-gateway", "auth-service", "order-service"],
    dependencyGraph: {
      nodes: [
        { name: "frontend", namespace: "web", workload: "deployment" },
        { name: "order-service", namespace: "orders", workload: "deployment" },
        { name: "payment-gateway", namespace: "payments", workload: "deployment" },
        { name: "auth-service", namespace: "auth", workload: "deployment" },
        { name: "postgres", namespace: "data", workload: "statefulset" },
      ],
      edges: [
        { source: "frontend", target: "order-service", requestRate: 1200, errorRate: 0.45, p99LatencyMs: 2100 },
        { source: "order-service", target: "payment-gateway", requestRate: 980, errorRate: 0.89, p99LatencyMs: 5100 },
        { source: "order-service", target: "auth-service", requestRate: 980, errorRate: 0.12, p99LatencyMs: 340 },
        { source: "payment-gateway", target: "postgres", requestRate: 450, errorRate: 0.92, p99LatencyMs: 8000 },
      ],
    },
    summary: "Payment gateway experiencing 503 errors, causing order-service failures. Database connection pool exhaustion suspected.",
    rootCause: "PostgreSQL connection pool exhausted due to slow queries and connection leaks in payment-gateway.",
    aiAnalysis: {
      summary: "Cascade failure originating from payment-gateway's inability to acquire database connections.",
      rootCause: "Connection pool exhaustion in payment-gateway. Slow queries (8s+ p99) and a connection leak in the refund handler are holding connections open. Postgres max_connections (100) reached.",
      affectedPath: ["frontend → order-service", "order-service → payment-gateway", "payment-gateway → postgres"],
      recommendations: [
        "Increase connection pool size or add connection pooling (PgBouncer)",
        "Fix connection leak in refund handler - ensure connections are returned to pool",
        "Add query timeout and optimize slow payment validation queries",
        "Consider circuit breaker for payment-gateway → postgres calls",
      ],
      confidence: 0.94,
      analyzedAt: "2025-02-13T09:35:00Z",
    },
  },
  {
    id: "inc-002",
    title: "Elevated 5xx from recommend-service",
    severity: "high",
    status: "open",
    createdAt: "2025-02-13T10:02:00Z",
    updatedAt: "2025-02-13T10:02:00Z",
    affectedServices: ["recommend-service", "ml-inference"],
    dependencyGraph: {
      nodes: [
        { name: "api-gateway", namespace: "gateway", workload: "deployment" },
        { name: "recommend-service", namespace: "ml", workload: "deployment" },
        { name: "ml-inference", namespace: "ml", workload: "deployment" },
      ],
      edges: [
        { source: "api-gateway", target: "recommend-service", requestRate: 3400, errorRate: 0.15, p99LatencyMs: 890 },
        { source: "recommend-service", target: "ml-inference", requestRate: 3100, errorRate: 0.22, p99LatencyMs: 1200 },
      ],
    },
    summary: "ML inference service returning timeouts. Recommend-service error rate spiked to 15%.",
    aiAnalysis: {
      summary: "Downstream ML inference service is timing out, causing recommend-service to fail.",
      rootCause: "ML inference GPU pod scaled to 0 during low-traffic window. Cold start + queue backlog causing 30s+ latencies and timeouts.",
      affectedPath: ["api-gateway → recommend-service", "recommend-service → ml-inference"],
      recommendations: [
        "Increase ml-inference min replicas to 1 during business hours",
        "Add request queue depth alerting",
        "Consider pre-warming inference pods on schedule",
      ],
      confidence: 0.88,
      analyzedAt: "2025-02-13T10:12:00Z",
    },
  },
  {
    id: "inc-003",
    title: "Auth token validation latency spike",
    severity: "medium",
    status: "resolved",
    createdAt: "2025-02-12T14:30:00Z",
    updatedAt: "2025-02-12T16:45:00Z",
    affectedServices: ["auth-service"],
    dependencyGraph: {
      nodes: [
        { name: "auth-service", namespace: "auth", workload: "deployment" },
        { name: "redis", namespace: "cache", workload: "statefulset" },
      ],
      edges: [
        { source: "auth-service", target: "redis", requestRate: 8500, errorRate: 0.01, p99LatencyMs: 45 },
      ],
    },
    summary: "P99 latency for token validation increased from 25ms to 180ms. Resolved after Redis failover.",
    rootCause: "Redis primary failover caused temporary connection churn.",
    aiAnalysis: {
      summary: "Redis failover event caused auth-service connection pool to thrash.",
      rootCause: "Scheduled Redis maintenance triggered failover. Auth-service Redis client did not handle failover gracefully—connection resets caused retry storms.",
      affectedPath: ["auth-service → redis"],
      recommendations: [
        "Upgrade Redis client to version with improved failover handling",
        "Add connection retry with exponential backoff",
        "Consider Redis Sentinel for smoother failover",
      ],
      confidence: 0.91,
      analyzedAt: "2025-02-12T15:00:00Z",
    },
  },
];
