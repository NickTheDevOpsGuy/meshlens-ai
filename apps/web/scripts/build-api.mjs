#!/usr/bin/env node
import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.join(__dirname, "..");
const apiDir = path.join(webDir, "api");
const rootApiDir = path.join(webDir, "..", "..", "api");

const entries = [
  { in: path.join(webDir, "src", "api", "[[...path]].ts"), out: "[[...path]].js" },
  { in: path.join(webDir, "src", "api", "ai", "analyze.ts"), out: "ai/analyze.js" },
];

for (const { in: entry, out: outRel } of entries) {
  const outfile = path.join(apiDir, outRel);
  fs.mkdirSync(path.dirname(outfile), { recursive: true });
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile,
    target: "node20",
  });
  // Copy to repo root api/ for Vercel when Root Directory is empty
  if (!fs.existsSync(rootApiDir)) {
    fs.mkdirSync(rootApiDir, { recursive: true });
  }
  const rootOut = path.join(rootApiDir, outRel);
  fs.mkdirSync(path.dirname(rootOut), { recursive: true });
  fs.copyFileSync(outfile, rootOut);
}
