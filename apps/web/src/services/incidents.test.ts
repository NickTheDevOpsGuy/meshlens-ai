import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadSampleIncidents } from "./incidents";

describe("loadSampleIncidents", () => {
  const validIncident = {
    id: "test-1",
    title: "Test",
    severity: "high",
    status: "open",
    createdAt: "2025-02-13T10:00:00Z",
    updatedAt: "2025-02-13T10:00:00Z",
    affectedServices: ["orders"],
    dependencyGraph: { nodes: [{ name: "orders" }], edges: [] },
  };

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns incidents and apiAvailable true when API succeeds", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([validIncident]),
    });

    const { incidents, apiAvailable } = await loadSampleIncidents();

    expect(apiAvailable).toBe(true);
    expect(incidents).toContainEqual(
      expect.objectContaining({
        id: "test-1",
        dependencyGraph: expect.any(Object),
      })
    );
  });

  it("returns apiAvailable false when API fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Network error")
    );

    const { incidents, apiAvailable } = await loadSampleIncidents();

    expect(apiAvailable).toBe(false);
    expect(incidents.length).toBeGreaterThan(0); // fallback to sampleIncidents
  });

  it("filters out invalid incidents (missing id or dependencyGraph)", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          validIncident,
          { id: "no-graph", dependencyGraph: null },
          { id: null, dependencyGraph: { nodes: [], edges: [] } },
        ]),
    });

    const { incidents } = await loadSampleIncidents();

    const fromApi = incidents.filter((i) => i.id === "test-1");
    expect(fromApi).toHaveLength(1);
    expect(incidents.some((i) => i.id === "no-graph")).toBe(false);
  });
});
