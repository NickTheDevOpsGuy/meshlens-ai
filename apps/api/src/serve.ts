/**
 * Production server: API + static SPA.
 * Serves /api/* from Hono, everything else from ./public (SPA fallback to index.html).
 */
import type { IncomingMessage } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createReadStream, existsSync } from "fs";
import { createServer } from "http";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import { app } from "./app.js";

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.resolve(__dirname, "../../../public");

async function toRequest(req: IncomingMessage): Promise<Request> {
  const protocol = "http";
  const host = req.headers.host ?? "localhost";
  const url = req.url ?? "/";
  const requestUrl = `${protocol}://${host}${url}`;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v != null) headers.set(k, Array.isArray(v) ? v.join(", ") : String(v));
  }
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body =
    req.method !== "GET" && req.method !== "HEAD" && chunks.length > 0
      ? Buffer.concat(chunks as Buffer[]).buffer
      : undefined;
  return new Request(requestUrl, {
    method: req.method ?? "GET",
    headers,
    body,
  } as RequestInit);
}

const server = createServer(async (req, res) => {
  const url = req.url ?? "/";
  if (url.startsWith("/api")) {
    const request = await toRequest(req);
    const response = await app.fetch(request);
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    res.end(Buffer.from(await response.arrayBuffer()));
    return;
  }

  let filePath = path.join(PUBLIC_DIR, url === "/" ? "index.html" : url);
  if (!existsSync(filePath) || !filePath.startsWith(PUBLIC_DIR)) {
    filePath = path.join(PUBLIC_DIR, "index.html");
  }
  if (!existsSync(filePath)) {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }
  const ext = path.extname(filePath);
  const mimes: Record<string, string> = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
  };
  res.setHeader("Content-Type", mimes[ext] ?? "application/octet-stream");
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Meshlens AI listening on http://localhost:${PORT}`);
});
