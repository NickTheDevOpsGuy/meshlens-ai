import type { IncidentBundle } from "@meshlens/shared";
import { sampleIncidents } from "../data/sampleIncidents";

const SAMPLES_BASE = "/samples/incidents";

export type LoadResult = { incidents: IncidentBundle[]; apiAvailable: boolean };

export async function loadSampleIncidents(): Promise<LoadResult> {
  const fromFiles: IncidentBundle[] = [];
  let apiAvailable = false;

  try {
    const apiRes = await fetch("/api/samples/incidents");
    apiAvailable = apiRes.ok;
    if (apiRes.ok) {
      const data = (await apiRes.json()) as IncidentBundle[];
      if (Array.isArray(data)) {
        data.forEach((inc) => {
          if (inc?.id && inc?.dependencyGraph) fromFiles.push(inc);
        });
      }
    }
  } catch {
    /* API not available, fall back to static files */
  }

  if (fromFiles.length === 0) {
    try {
      const manifestRes = await fetch(`${SAMPLES_BASE}/manifest.json`);
      if (manifestRes.ok) {
        const { incidents: files } = (await manifestRes.json()) as {
          incidents: string[];
        };
        for (const file of files || []) {
          try {
            const res = await fetch(`${SAMPLES_BASE}/${file}`);
            if (res.ok) {
              const data = (await res.json()) as IncidentBundle;
              if (data?.id && data?.dependencyGraph) fromFiles.push(data);
            }
          } catch {
            /* skip */
          }
        }
      }
    } catch {
      /* skip */
    }
  }

  return { incidents: [...fromFiles, ...sampleIncidents], apiAvailable };
}
