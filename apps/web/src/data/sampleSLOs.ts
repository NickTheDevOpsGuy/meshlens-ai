import type { SLOState } from "@meshlens/shared";

export const sampleSLOs: SLOState[] = [
  {
    name: "API availability (orders)",
    target: 99.9,
    current: 98.2,
    unit: "%",
    status: "breach",
  },
  {
    name: "API latency p99",
    target: 500,
    current: 2100,
    unit: "ms",
    status: "breach",
  },
  {
    name: "Payment success rate",
    target: 99.95,
    current: 99.1,
    unit: "%",
    status: "warning",
  },
  {
    name: "Search p95",
    target: 200,
    current: 145,
    unit: "ms",
    status: "healthy",
  },
  {
    name: "Auth token validation",
    target: 50,
    current: 180,
    unit: "ms",
    status: "breach",
  },
];
