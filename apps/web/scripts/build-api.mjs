#!/usr/bin/env node
import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.join(__dirname, "..");
const apiDir = path.join(webDir, "api");
const entry = path.join(webDir, "src", "api", "[[...path]].ts");
const outfile = path.join(apiDir, "[[...path]].js");

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile,
  target: "node20",
});

// Also copy to repo root api/ so it works when Vercel Root Directory is empty
const rootApiDir = path.join(webDir, "..", "..", "api");
if (!fs.existsSync(rootApiDir)) {
  fs.mkdirSync(rootApiDir, { recursive: true });
}
fs.copyFileSync(outfile, path.join(rootApiDir, "[[...path]].js"));
