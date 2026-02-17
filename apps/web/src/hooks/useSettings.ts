const STORAGE_KEY = "meshlens-settings";

export type Settings = {
  tetrateApiKey: string;
  tarsApiBaseUrl: string;
  tarsModel: string;
  prometheusUrl: string;
  traceUrl: string;
  grafanaUrl: string;
  alertmanagerUrl: string;
  lokiUrl: string;
  refreshIntervalSec: number;
  slackWebhookUrl: string;
  pagerdutyIntegrationKey: string;
};

const defaults: Settings = {
  tetrateApiKey: "",
  tarsApiBaseUrl: "https://api.router.tetrate.ai",
  tarsModel: "gpt-4o-mini",
  prometheusUrl: "",
  traceUrl: "",
  grafanaUrl: "",
  alertmanagerUrl: "",
  lokiUrl: "",
  refreshIntervalSec: 0,
  slackWebhookUrl: "",
  pagerdutyIntegrationKey: "",
};

export function loadSettings(): Settings {
  if (typeof window === "undefined") return { ...defaults };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaults, ...JSON.parse(stored) };
  } catch {
    /* ignore */
  }
  return { ...defaults };
}

export function saveSettings(s: Partial<Settings>) {
  if (typeof window === "undefined") return;
  const current = loadSettings();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...s }));
}
