import type { IncomingMessage, ServerResponse } from "http";
import { app } from "@meshlens/api";

async function toWebRequest(
  req: IncomingMessage & { body?: unknown }
): Promise<Request> {
  const protocol = (req.headers["x-forwarded-proto"] as string) ?? "https";
  const host =
    (req.headers["x-forwarded-host"] as string) ??
    req.headers.host ??
    "localhost";
  const url = `${protocol}://${host}${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v != null) headers.set(k, Array.isArray(v) ? v.join(", ") : String(v));
  }
  let body: ArrayBuffer | string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (req.body !== undefined) {
      body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    } else {
      const chunks: Uint8Array[] = [];
      for await (const chunk of req) chunks.push(chunk);
      body = Buffer.concat(chunks as Buffer[]).buffer as ArrayBuffer;
    }
  }
  return new Request(url, { method: req.method ?? "GET", headers, body });
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const request = await toWebRequest(req);
    const response = await app.fetch(request);
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    const buf = await response.arrayBuffer();
    res.end(Buffer.from(buf));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("[api]", msg, err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: msg,
        ...(process.env.NODE_ENV !== "production" &&
          err instanceof Error && { stack: err.stack }),
      })
    );
  }
}
