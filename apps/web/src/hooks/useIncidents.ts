import { useState, useEffect, useCallback, useRef } from "react";
import { loadSampleIncidents } from "../services/incidents";
import { fetchLiveIncidents } from "../services/telemetry";
import { fetchFiringAlerts } from "../services/alerts";
import { loadSettings } from "./useSettings";
import type { IncidentBundle, FiringAlert } from "@meshlens/shared";

function alertsToIncidents(alerts: FiringAlert[]): IncidentBundle[] {
  const now = new Date().toISOString();
  return alerts.map((a) => ({
    id: `alert-${a.fingerprint}`,
    title: a.labels?.alertname || "Firing alert",
    severity: (a.labels?.severity as IncidentBundle["severity"]) || "high",
    status: "open" as const,
    createdAt: a.startsAt,
    updatedAt: a.endsAt || now,
    affectedServices: a.labels?.service ? [a.labels.service] : [],
    dependencyGraph: { nodes: [], edges: [] },
    summary: a.annotations?.summary,
  }));
}

export function useIncidents() {
  const lastSamplesVersionRef = useRef<number>(-1);
  const [sampleIncidents, setSampleIncidents] = useState<IncidentBundle[]>([]);
  const [liveIncidents, setLiveIncidents] = useState<IncidentBundle[]>([]);
  const [alertIncidents, setAlertIncidents] = useState<IncidentBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveLoading, setLiveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const settings = loadSettings();
  const hasTelemetry = !!(settings.prometheusUrl || settings.traceUrl);
  const hasAlertmanager = !!settings.alertmanagerUrl;
  const refreshInterval = settings.refreshIntervalSec > 0 ? settings.refreshIntervalSec * 1000 : 0;

  const fetchLive = useCallback(() => {
    if (!hasTelemetry) return;
    setLiveLoading(true);
    setError(null);
    fetchLiveIncidents(settings.prometheusUrl || undefined, settings.traceUrl || undefined)
      .then(setLiveIncidents)
      .catch((e) => setError(e instanceof Error ? e.message : "Telemetry fetch failed"))
      .finally(() => setLiveLoading(false));
  }, [hasTelemetry, settings.prometheusUrl, settings.traceUrl]);

  const fetchAlerts = useCallback(() => {
    if (!hasAlertmanager) return;
    fetchFiringAlerts(settings.alertmanagerUrl)
      .then((a) => setAlertIncidents(alertsToIncidents(a)))
      .catch(() => setAlertIncidents([]));
  }, [hasAlertmanager, settings.alertmanagerUrl]);

  const [apiAvailable, setApiAvailable] = useState(false);
  const refetchSamples = useCallback(() => {
    setLoading(true);
    loadSampleIncidents()
      .then(({ incidents, apiAvailable: ok }) => {
        setSampleIncidents(incidents);
        setApiAvailable(ok);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetchSamples();
  }, [refetchSamples]);

  useEffect(() => {
    const onSamplesChanged = () => refetchSamples();
    window.addEventListener("meshlens-samples-changed", onSamplesChanged);
    return () => window.removeEventListener("meshlens-samples-changed", onSamplesChanged);
  }, [refetchSamples]);

  useEffect(() => {
    let first = true;
    const tick = async () => {
      try {
        const res = await fetch("/api/samples/version");
        if (res.ok) {
          const { version } = (await res.json()) as { version?: number };
          if (typeof version === "number") {
            if (first) { lastSamplesVersionRef.current = version; first = false; }
            else if (version !== lastSamplesVersionRef.current) {
              lastSamplesVersionRef.current = version;
              refetchSamples();
            }
          }
        }
      } catch {
        /* API not available */
      }
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [refetchSamples]);

  useEffect(() => {
    fetchLive();
  }, [fetchLive]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    if (refreshInterval <= 0) return;
    const id = setInterval(() => {
      fetchLive();
      fetchAlerts();
    }, refreshInterval);
    return () => clearInterval(id);
  }, [refreshInterval, fetchLive, fetchAlerts]);

  const allIncidents = [...alertIncidents, ...liveIncidents, ...sampleIncidents];

  return {
    incidents: allIncidents,
    sampleIncidents,
    liveIncidents,
    alertIncidents,
    loading,
    liveLoading,
    error,
    hasTelemetry,
    hasAlertmanager,
    apiAvailable,
    refetchSamples,
  };
}
