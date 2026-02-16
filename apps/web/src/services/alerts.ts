import type { FiringAlert } from "@meshlens/shared";

export async function fetchFiringAlerts(alertmanagerUrl: string): Promise<FiringAlert[]> {
  const res = await fetch(`/api/alertmanager/alerts?baseUrl=${encodeURIComponent(alertmanagerUrl)}`);
  const raw = await res.json();
  if (!res.ok) throw new Error(raw.error || "Failed to fetch alerts");
  const data = Array.isArray(raw) ? raw : (raw.data ?? raw.alerts ?? []);
  return data.map((a: { fingerprint?: string; labels?: Record<string, string>; annotations?: Record<string, string>; startsAt?: string; endsAt?: string }) => ({
    fingerprint: a.fingerprint || "",
    labels: a.labels || {},
    annotations: a.annotations,
    startsAt: a.startsAt || new Date().toISOString(),
    endsAt: a.endsAt,
  }));
}
