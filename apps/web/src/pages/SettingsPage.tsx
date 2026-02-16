import { useState, useEffect } from "react";
import { loadSettings, saveSettings, type Settings } from "../hooks/useSettings";

const defaults: Settings = {
  tetrateApiKey: "",
  tarsApiBaseUrl: "https://api.router.tetrate.ai",
  tarsModel: "gpt-4o-mini",
  prometheusUrl: "",
  traceUrl: "",
  grafanaUrl: "",
  alertmanagerUrl: "",
  refreshIntervalSec: 0,
  slackWebhookUrl: "",
  pagerdutyIntegrationKey: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Settings</h1>
        <p className="text-slate-400 mt-1">
          Configure TARS and telemetry backends
        </p>
      </div>

      <div className="space-y-8">
        <section className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">
            Tetrate Agent Router Service (TARS)
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            TARS powers AI root cause analysis. Add your API key from{" "}
            <a
              href="https://router.tetrate.ai/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              router.tetrate.ai
            </a>
            .
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                API key
              </label>
              <input
                type="password"
                placeholder="sk-..."
                value={settings.tetrateApiKey}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, tetrateApiKey: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                API base URL
              </label>
              <input
                type="url"
                placeholder="https://api.router.tetrate.ai"
                value={settings.tarsApiBaseUrl}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, tarsApiBaseUrl: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Model for analysis
              </label>
              <select
                value={settings.tarsModel}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, tarsModel: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
              >
                <option value="gpt-4o-mini">gpt-4o-mini (fast)</option>
                <option value="gpt-4o">gpt-4o</option>
                <option value="claude-4-sonnet-20250514">Claude Sonnet 4</option>
              </select>
            </div>
          </div>
        </section>

        <section className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">
            Telemetry backends
            <span className="ml-2 text-xs font-normal text-slate-500">
              (optional)
            </span>
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Prometheus, Jaeger, Grafana, and Alertmanager are optional. Add when
            you want live incident discovery.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Prometheus URL
              </label>
              <input
                type="url"
                placeholder="http://prometheus:9090"
                value={settings.prometheusUrl}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, prometheusUrl: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Jaeger / Tempo URL
              </label>
              <input
                type="url"
                placeholder="http://jaeger:16686"
                value={settings.traceUrl}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, traceUrl: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Alertmanager URL
              </label>
              <input
                type="url"
                placeholder="http://alertmanager:9093"
                value={settings.alertmanagerUrl}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, alertmanagerUrl: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Grafana URL (optional)
              </label>
              <input
                type="url"
                placeholder="http://grafana:3000"
                value={settings.grafanaUrl}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, grafanaUrl: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Slack webhook URL
              </label>
              <input
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={settings.slackWebhookUrl ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, slackWebhookUrl: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                PagerDuty integration key
              </label>
              <input
                type="password"
                placeholder="Events API v2 integration key"
                value={settings.pagerdutyIntegrationKey ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, pagerdutyIntegrationKey: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Live refresh interval (seconds)
              </label>
              <select
                value={settings.refreshIntervalSec}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    refreshIntervalSec: Number(e.target.value),
                  }))
                }
                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
              >
                <option value={0}>Off</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={120}>2 minutes</option>
                <option value={300}>5 minutes</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-4">
          {saved && (
            <span className="text-sm text-emerald-400">Settings saved</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors font-medium"
          >
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
}
