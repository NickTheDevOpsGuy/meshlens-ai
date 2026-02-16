import { describe, it, expect } from "vitest";
import { correlateIncidents, groupByService } from "./incidentUtils";
import type { IncidentBundle } from "@meshlens/shared";

const baseGraph = { nodes: [{ name: "svc" }], edges: [] };

function incident(
  id: string,
  services: string[],
  createdAt: string
): IncidentBundle {
  return {
    id,
    title: id,
    severity: "high",
    status: "open",
    createdAt,
    updatedAt: createdAt,
    affectedServices: services,
    dependencyGraph: baseGraph,
  };
}

describe("correlateIncidents", () => {
  it("returns empty array for empty input", () => {
    expect(correlateIncidents([])).toEqual([]);
  });

  it("returns single-item groups for unrelated incidents", () => {
    const a = incident("a", ["orders"], "2025-02-13T10:00:00Z");
    const b = incident("b", ["payments"], "2025-02-13T10:05:00Z");
    const groups = correlateIncidents([a, b]);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveLength(1);
    expect(groups[1]).toHaveLength(1);
  });

  it("groups incidents sharing a service within 30 min", () => {
    const base = "2025-02-13T10:00:00Z";
    const a = incident("a", ["orders"], base);
    const b = incident("b", ["orders"], "2025-02-13T10:15:00Z");
    const groups = correlateIncidents([a, b]);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(2);
    expect(groups[0].map((i) => i.id).sort()).toEqual(["a", "b"]);
  });

  it("splits incidents outside time window", () => {
    const a = incident("a", ["orders"], "2025-02-13T10:00:00Z");
    const b = incident("b", ["orders"], "2025-02-13T10:45:00Z"); // 45 min later
    const groups = correlateIncidents([a, b]);
    expect(groups).toHaveLength(2);
  });

  it("chains correlated incidents (a-b, b-c)", () => {
    const base = "2025-02-13T10:00:00Z";
    const a = incident("a", ["orders"], base);
    const b = incident("b", ["orders", "payments"], "2025-02-13T10:10:00Z");
    const c = incident("c", ["payments"], "2025-02-13T10:20:00Z");
    const groups = correlateIncidents([a, b, c]);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(3);
  });
});

describe("groupByService", () => {
  it("returns empty map for empty input", () => {
    const map = groupByService([]);
    expect(map.size).toBe(0);
  });

  it("groups incidents by shared service", () => {
    const a = incident("a", ["orders"], "2025-02-13T10:00:00Z");
    const b = incident("b", ["orders"], "2025-02-13T10:05:00Z");
    const c = incident("c", ["payments"], "2025-02-13T10:10:00Z");
    const map = groupByService([a, b, c]);
    expect(map.get("orders")).toHaveLength(2);
    expect(map.get("payments")).toHaveLength(1);
  });

  it("puts incidents with no services in (no services)", () => {
    const a = incident("a", [], "2025-02-13T10:00:00Z");
    const map = groupByService([a]);
    expect(map.get("(no services)")).toHaveLength(1);
  });

  it("deduplicates incidents that appear in multiple services", () => {
    const a = incident("a", ["orders", "payments"], "2025-02-13T10:00:00Z");
    const map = groupByService([a]);
    expect(map.get("orders")).toContainEqual(a);
    expect(map.get("payments")).toContainEqual(a);
    expect(map.get("orders")).toHaveLength(1);
  });
});
