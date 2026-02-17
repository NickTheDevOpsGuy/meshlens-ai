import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Hono } from "hono";
import { cors } from "hono/cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isVercel = !!process.env.VERCEL;
// On Vercel: bundled __dirname is wrong; use process.cwd() + public path
// Locally: path relative to this file
function resolveSamplesDir(): string {
  if (!isVercel) return path.resolve(__dirname, "../../../samples/incidents");
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "public", "samples", "incidents"),
    path.join(cwd, "apps", "web", "public", "samples", "incidents"),
    path.join(cwd, "samples", "incidents"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return candidates[0];
}
const SAMPLES_DIR = resolveSamplesDir();

let samplesVersion = 0;
if (!isVercel && fs.existsSync(SAMPLES_DIR)) {
  try {
    fs.watch(SAMPLES_DIR, { recursive: false }, () => {
      samplesVersion += 1;
    });
  } catch {
    /* ignore */
  }
}

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) =>
      !origin ||
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.0.0.1") ||
      origin.includes("vercel.app")
        ? origin || "*"
        : null,
  })
);

app.get("/api/health", (c) =>
  c.json({
    status: "ok",
    tarsConfigured: !!(
      process.env.TETRATE_API_KEY &&
      process.env.TETRATE_API_KEY.trim().length > 0
    ),
  })
);

function loadIncidentsFromFolder(): unknown[] {
  const incidents: unknown[] = [];
  try {
    if (!fs.existsSync(SAMPLES_DIR)) return incidents;
    let files: string[] = [];
    const manifestPath = path.join(SAMPLES_DIR, "manifest.json");
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as {
        incidents?: string[];
      };
      files = manifest.incidents ?? [];
    }
    if (files.length === 0) {
      files = fs
        .readdirSync(SAMPLES_DIR)
        .filter((f) => f.endsWith(".json") && f !== "manifest.json");
    }
    for (const file of files) {
      const filePath = path.join(SAMPLES_DIR, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if (data?.id && data?.dependencyGraph) incidents.push(data);
      }
    }
  } catch {
    /* ignore */
  }
  return incidents;
}

app.get("/api/samples/incidents", async (c) => {
  return c.json(loadIncidentsFromFolder());
});

app.get("/api/samples/version", (c) =>
  c.json({ version: isVercel ? 0 : samplesVersion })
);

app.post("/api/samples/incidents", async (c) => {
  if (isVercel) {
    return c.json(
      {
        error: "Import is read-only on Vercel. Run the API locally for import.",
      },
      503
    );
  }
  const body = (await c.req.json()) as {
    id?: string;
    title?: string;
    [key: string]: unknown;
  };
  if (!body?.id || !body?.dependencyGraph) {
    return c.json({ error: "id and dependencyGraph required" }, 400);
  }
  const safeName = `${String(body.id)
    .replace(/[^a-z0-9-_]/gi, "-")
    .toLowerCase()}.json`;
  const filePath = path.join(SAMPLES_DIR, safeName);
  try {
    fs.mkdirSync(SAMPLES_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2));
    const manifestPath = path.join(SAMPLES_DIR, "manifest.json");
    let manifest: { incidents: string[] } = { incidents: [] };
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    }
    if (!manifest.incidents.includes(safeName)) {
      manifest.incidents.push(safeName);
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    }
    samplesVersion += 1;
    return c.json({ ok: true, file: safeName });
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : "Write failed" },
      500
    );
  }
});

app.post("/api/ai/analyze", async (c) => {
  const apiKey = process.env.TETRATE_API_KEY;
  const baseUrl =
    process.env.TARS_API_BASE_URL || "https://api.router.tetrate.ai";
  const model = process.env.TARS_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    return c.json(
      {
        error:
          "TETRATE_API_KEY not configured. Add it to .env and restart the API.",
      },
      503
    );
  }

  const body = await c.req.json<{
    title: string;
    summary?: string;
    affectedServices: string[];
    dependencyGraph: {
      nodes: { name: string }[];
      edges: { source: string; target: string; errorRate?: number }[];
    };
  }>();

  const prompt = `You are a service mesh incident analyst. Analyze this incident and provide root cause analysis.

**Incident:** ${body.title}
${body.summary ? `**Summary:** ${body.summary}` : ""}
**Affected services:** ${body.affectedServices?.join(", ") || "unknown"}
**Dependency graph edges (source → target, error rate):**
${body.dependencyGraph?.edges?.map((e) => `- ${e.source} → ${e.target}${e.errorRate != null ? ` (${(e.errorRate * 100).toFixed(1)}% errors)` : ""}`).join("\n") || "unknown"}

Respond with a JSON object (no markdown) containing:
{
  "summary": "One paragraph root cause summary",
  "rootCause": "The specific root cause",
  "affectedPath": ["service-a → service-b", ...],
  "recommendations": ["Recommendation 1", "Recommendation 2", ...],
  "confidence": 0.95
}`;

  try {
    const res = await fetch(
      `${baseUrl.replace(/\/$/, "")}/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        }),
      }
    );

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return c.json({ error: "No response from AI" }, 502);
    }

    const parsed = JSON.parse(content.replace(/```json\s*|\s*```/g, "")) as {
      summary: string;
      rootCause: string;
      affectedPath: string[];
      recommendations: string[];
      confidence: number;
    };

    return c.json({
      ...parsed,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : "AI analysis failed" },
      502
    );
  }
});

app.post("/api/prometheus/query", async (c) => {
  const body = await c.req.json<{
    baseUrl: string;
    query: string;
    time?: string;
  }>();
  const { baseUrl, query, time } = body;
  if (!baseUrl || !query) {
    return c.json({ error: "baseUrl and query required" }, 400);
  }
  const url = new URL("/api/v1/query", baseUrl.replace(/\/$/, ""));
  url.searchParams.set("query", query);
  if (time) url.searchParams.set("time", time);
  try {
    const res = await fetch(url.toString());
    const data = await res.json();
    return c.json(data);
  } catch (err) {
    return c.json(
      {
        error: err instanceof Error ? err.message : "Prometheus request failed",
      },
      502
    );
  }
});

app.post("/api/prometheus/query_range", async (c) => {
  const body = await c.req.json<{
    baseUrl: string;
    query: string;
    start: string;
    end: string;
    step?: string;
  }>();
  const { baseUrl, query, start, end, step = "15s" } = body;
  if (!baseUrl || !query || !start || !end) {
    return c.json({ error: "baseUrl, query, start, end required" }, 400);
  }
  const url = new URL("/api/v1/query_range", baseUrl.replace(/\/$/, ""));
  url.searchParams.set("query", query);
  url.searchParams.set("start", start);
  url.searchParams.set("end", end);
  url.searchParams.set("step", step);
  try {
    const res = await fetch(url.toString());
    const data = await res.json();
    return c.json(data);
  } catch (err) {
    return c.json(
      {
        error: err instanceof Error ? err.message : "Prometheus request failed",
      },
      502
    );
  }
});

app.get("/api/jaeger/services", async (c) => {
  const baseUrl = c.req.query("baseUrl");
  if (!baseUrl) return c.json({ error: "baseUrl required" }, 400);
  const url = `${baseUrl.replace(/\/$/, "")}/api/services`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return c.json(data);
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : "Jaeger request failed" },
      502
    );
  }
});

app.get("/api/jaeger/dependencies", async (c) => {
  const baseUrl = c.req.query("baseUrl");
  const endTs = c.req.query("endTs");
  const lookback = c.req.query("lookback");
  if (!baseUrl || !endTs || !lookback) {
    return c.json({ error: "baseUrl, endTs, lookback required" }, 400);
  }
  const url = new URL("/api/dependencies", baseUrl.replace(/\/$/, ""));
  url.searchParams.set("endTs", endTs);
  url.searchParams.set("lookback", lookback);
  try {
    const res = await fetch(url.toString());
    const data = await res.json();
    return c.json(data);
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : "Jaeger request failed" },
      502
    );
  }
});

app.get("/api/alertmanager/alerts", async (c) => {
  const baseUrl = c.req.query("baseUrl");
  if (!baseUrl) return c.json({ error: "baseUrl required" }, 400);
  const url = `${baseUrl.replace(/\/$/, "")}/api/v2/alerts?active=true`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return c.json(data);
  } catch (err) {
    return c.json(
      {
        error:
          err instanceof Error ? err.message : "Alertmanager request failed",
      },
      502
    );
  }
});

app.post("/api/notify", async (c) => {
  const body = (await c.req.json()) as {
    incident: {
      id: string;
      title: string;
      severity: string;
      affectedServices: string[];
      summary?: string;
    };
    slackWebhookUrl?: string;
    pagerdutyIntegrationKey?: string;
  };
  const { incident, slackWebhookUrl, pagerdutyIntegrationKey } = body;
  if (!incident?.id) return c.json({ error: "incident required" }, 400);

  const results: { slack?: string; pagerduty?: string } = {};

  if (slackWebhookUrl) {
    try {
      const res = await fetch(slackWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚨 *${incident.title}*`,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `Incident: ${incident.title}`,
                emoji: true,
              },
            },
            {
              type: "section",
              fields: [
                { type: "mrkdwn", text: `*Severity:* ${incident.severity}` },
                {
                  type: "mrkdwn",
                  text: `*Services:* ${(incident.affectedServices || []).join(", ")}`,
                },
              ],
            },
            ...(incident.summary
              ? [
                  {
                    type: "section",
                    text: { type: "mrkdwn", text: incident.summary },
                  },
                ]
              : []),
          ],
        }),
      });
      results.slack = res.ok ? "ok" : await res.text();
    } catch (err) {
      results.slack = err instanceof Error ? err.message : "failed";
    }
  }

  if (pagerdutyIntegrationKey) {
    try {
      const res = await fetch("https://events.pagerduty.com/v2/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routing_key: pagerdutyIntegrationKey,
          event_action: "trigger",
          dedup_key: incident.id,
          payload: {
            summary: incident.title,
            severity: incident.severity === "critical" ? "critical" : "error",
            source: "meshlens-ai",
            custom_details: {
              affected_services: incident.affectedServices,
              summary: incident.summary,
            },
          },
        }),
      });
      const data = (await res.json()) as { status?: string };
      results.pagerduty =
        data.status === "success" ? "ok" : JSON.stringify(data);
    } catch (err) {
      results.pagerduty = err instanceof Error ? err.message : "failed";
    }
  }

  return c.json(results);
});

app.post("/api/prometheus/slo", async (c) => {
  const body = (await c.req.json()) as {
    baseUrl: string;
    queries?: {
      name: string;
      query: string;
      target?: number;
      unit?: string;
      higherBetter?: boolean;
    }[];
  };
  const { baseUrl, queries } = body;
  if (!baseUrl) return c.json({ error: "baseUrl required" }, 400);

  const defaultQueries = [
    {
      name: "Error rate",
      query:
        'sum(rate(istio_requests_total{response_code=~"5.."}[5m]))/sum(rate(istio_requests_total[5m]))*100',
      target: 1,
      unit: "%",
      higherBetter: false,
    },
    {
      name: "Request rate",
      query: "sum(rate(istio_requests_total[5m]))",
      target: 100,
      unit: "/s",
      higherBetter: true,
    },
  ];
  const toRun = queries?.length ? queries : defaultQueries;
  const results: {
    name: string;
    value: number;
    target?: number;
    unit: string;
    status: string;
  }[] = [];

  for (const q of toRun) {
    try {
      const url = new URL("/api/v1/query", baseUrl.replace(/\/$/, ""));
      url.searchParams.set("query", q.query);
      const res = await fetch(url.toString());
      const data = (await res.json()) as {
        data?: { result?: { value?: [number, string] }[] };
      };
      const val = parseFloat(data.data?.result?.[0]?.value?.[1] ?? "0") || 0;
      const target = q.target ?? 0;
      const higherBetter = q.higherBetter ?? false;
      let status = "healthy";
      if (target > 0) {
        const ok = higherBetter ? val >= target : val <= target;
        status = ok ? "healthy" : val > target * 1.5 ? "breach" : "warning";
      }
      results.push({
        name: q.name,
        value: val,
        target,
        unit: q.unit ?? "",
        status,
      });
    } catch {
      results.push({
        name: q.name,
        value: 0,
        target: q.target,
        unit: q.unit ?? "",
        status: "unknown",
      });
    }
  }
  return c.json(results);
});

app.get("/api/jaeger/traces", async (c) => {
  const baseUrl = c.req.query("baseUrl");
  const service = c.req.query("service");
  const limit = c.req.query("limit") || "20";
  if (!baseUrl) return c.json({ error: "baseUrl required" }, 400);
  const url = new URL("/api/traces", baseUrl.replace(/\/$/, ""));
  if (service) url.searchParams.set("service", service);
  url.searchParams.set("limit", limit);
  try {
    const res = await fetch(url.toString());
    const data = await res.json();
    return c.json(data);
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : "Jaeger request failed" },
      502
    );
  }
});

export { app };
