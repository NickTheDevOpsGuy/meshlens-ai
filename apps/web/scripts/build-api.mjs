#!/usr/bin/env node
import * as esbuild from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, "..", "api");
const entry = path.join(apiDir, "[[...path]].ts");
const outfile = path.join(apiDir, "[[...path]].js");

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile,
  external: [], // bundle everything
  target: "node20",
});
