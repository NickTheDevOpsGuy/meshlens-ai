import { describe, it, expect, vi, beforeEach } from "vitest";
import { app } from "./app";

describe("API", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("GET /api/health", () => {
    it("returns status ok", async () => {
      const res = await app.request("/api/health");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { status: string };
      expect(data.status).toBe("ok");
    });
  });

  describe("GET /api/samples/incidents", () => {
    it("returns an array of incidents", async () => {
      const res = await app.request("/api/samples/incidents");
      expect(res.status).toBe(200);
      const data = (await res.json()) as unknown[];
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe("GET /api/samples/version", () => {
    it("returns version object", async () => {
      const res = await app.request("/api/samples/version");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { version: number };
      expect(typeof data.version).toBe("number");
    });
  });

  describe("POST /api/prometheus/query", () => {
    it("returns 400 when baseUrl and query missing", async () => {
      const res = await app.request("/api/prometheus/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
      const data = (await res.json()) as { error: string };
      expect(data.error).toContain("baseUrl");
    });
  });

  describe("POST /api/ai/analyze", () => {
    it("returns 503 when TETRATE_API_KEY not configured", async () => {
      const res = await app.request("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test",
          affectedServices: ["svc-a"],
          dependencyGraph: { nodes: [{ name: "a" }], edges: [] },
        }),
      });
      expect(res.status).toBe(503);
      const data = (await res.json()) as { error: string };
      expect(data.error).toContain("TETRATE_API_KEY");
    });
  });

  describe("POST /api/prometheus/slo", () => {
    it("returns 400 when baseUrl missing", async () => {
      const res = await app.request("/api/prometheus/slo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/jaeger/services", () => {
    it("returns 400 when baseUrl missing", async () => {
      const res = await app.request("/api/jaeger/services");
      expect(res.status).toBe(400);
      const data = (await res.json()) as { error: string };
      expect(data.error).toContain("baseUrl");
    });
  });
});
