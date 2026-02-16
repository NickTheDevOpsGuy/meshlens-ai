import { useState, useMemo } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import { useIncidents } from "../hooks/useIncidents";
import { loadSettings } from "../hooks/useSettings";
import type { IncidentSeverity, IncidentStatus, AIRootCauseAnalysis } from "@meshlens/shared";

const severityStyles: Record<IncidentSeverity, string> = {
  critical: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  high: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  medium: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const statusStyles: Record<IncidentStatus, string> = {
  open: "bg-rose-500/10 text-rose-400",
  investigating: "bg-amber-500/10 text-amber-400",
  resolved: "bg-emerald-500/10 text-emerald-400",
  dismissed: "bg-slate-500/10 text-slate-500",
};

export default function IncidentDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { incidents } = useIncidents();
  const incident =
    (location.state as { incident?: (typeof incidents)[0] } | null)?.incident ??
    incidents.find((i) => i.id === id);

  if (!incident) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-300">Incident not found</h1>
        <Link to="/dashboard" className="mt-4 inline-block text-cyan-400 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const [aiAnalysis, setAiAnalysis] = useState<AIRootCauseAnalysis | undefined>(incident.aiAnalysis);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: incident.title,
          summary: incident.summary,
          affectedServices: incident.affectedServices,
          dependencyGraph: incident.dependencyGraph,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAiAnalysis({
        ...data,
        analyzedAt: data.analyzedAt || new Date().toISOString(),
      });
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const { dependencyGraph } = incident;
  const settings = loadSettings();

  const traceUrl = incident.traceId && settings.traceUrl
    ? `${settings.traceUrl.replace(/\/$/, "")}/trace/${incident.traceId}`
    : null;

  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify({ ...incident, aiAnalysis: aiAnalysis ?? incident.aiAnalysis }, null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `incident-${incident.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageW = doc.getPageWidth();
    const pageH = doc.getPageHeight();
    const maxW = pageW - margin * 2;
    let y = margin;
    const lineH = 6;
    const addText = (text: string, opts?: { bold?: boolean; section?: boolean }) => {
      const lines = doc.splitTextToSize(text, maxW);
      for (const line of lines) {
        if (y > pageH - 25) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += lineH;
      }
      if (opts?.section) y += 2;
    };

    doc.setFontSize(18);
    addText(incident.title);
    y += 4;
    doc.setFontSize(10);
    addText(`Severity: ${incident.severity} | Status: ${incident.status}`);
    addText(`Affected: ${incident.affectedServices.join(", ")}`);
    addText(`Created: ${new Date(incident.createdAt).toLocaleString()}`);
    y += 4;
    if (incident.summary) { addText(incident.summary, { section: true }); y += 2; }

    const analysis = aiAnalysis ?? incident.aiAnalysis;
    if (analysis) {
      doc.setFont("helvetica", "bold");
      addText("AI Root Cause Analysis", { section: true });
      doc.setFont("helvetica", "normal");
      addText(analysis.summary);
      addText(`Root cause: ${analysis.rootCause}`);
      if (analysis.affectedPath?.length) {
        addText(`Affected path: ${analysis.affectedPath.join(" → ")}`);
      }
      if (analysis.recommendations?.length) {
        addText("Recommendations:");
        for (const r of analysis.recommendations) addText(`• ${r}`);
      }
      addText(`Confidence: ${((analysis.confidence ?? 0) * 100).toFixed(0)}%`);
    }

    doc.save(`incident-${incident.id}.pdf`);
  };

  const handleNotify = async () => {
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incident: { id: incident.id, title: incident.title, severity: incident.severity, affectedServices: incident.affectedServices, summary: incident.summary },
          slackWebhookUrl: settings.slackWebhookUrl || undefined,
          pagerdutyIntegrationKey: settings.pagerdutyIntegrationKey || undefined,
        }),
      });
      const data = await res.json();
      if (data.slack === "ok" || data.pagerduty === "ok") {
        alert("Notification sent");
      } else if (data.slack || data.pagerduty) {
        alert(`Sent. Status: ${JSON.stringify(data)}`);
      } else {
        alert("Add Slack webhook or PagerDuty key in Settings");
      }
    } catch {
      alert("Notification failed");
    }
  };

  const relatedIncidents = useMemo(() => {
    const services = new Set(incident.affectedServices);
    return incidents.filter((i) => i.id !== incident.id && i.affectedServices.some((s) => services.has(s))).slice(0, 5);
  }, [incidents, incident]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 mb-6 transition-colors"
      >
        ← Back to dashboard
      </Link>

      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${severityStyles[incident.severity]}`}>
            {incident.severity}
          </span>
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusStyles[incident.status]}`}>
            {incident.status}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {incident.id} · {new Date(incident.createdAt).toLocaleString()}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100">{incident.title}</h1>
        <p className="text-slate-400 mt-2">Affected: {incident.affectedServices.join(", ")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {incident.runbookUrl && (
            <a
              href={incident.runbookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cyan-400 hover:underline"
            >
              📋 View runbook →
            </a>
          )}
          {traceUrl && (
            <a
              href={traceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cyan-400 hover:underline"
            >
              🔍 View trace in Jaeger →
            </a>
          )}
          <button onClick={handleExport} className="text-sm text-slate-400 hover:text-cyan-400">
            Export JSON
          </button>
          <button onClick={handleExportPdf} className="text-sm text-slate-400 hover:text-cyan-400">
            Export PDF
          </button>
          <button onClick={handleCopyLink} className="text-sm text-slate-400 hover:text-cyan-400">
            Copy share link
          </button>
          {(settings.slackWebhookUrl || settings.pagerdutyIntegrationKey) && (
            <button onClick={handleNotify} className="text-sm text-cyan-400 hover:underline">
              Notify Slack / PagerDuty
            </button>
          )}
        </div>
      </div>

      <section className="mb-8 p-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
            AI Root Cause Analysis
          </h2>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 disabled:opacity-50"
          >
            {analyzing ? "Analyzing…" : aiAnalysis ? "Re-analyze" : "Analyze with AI"}
          </button>
        </div>
        {analyzeError && (
          <p className="text-rose-400 text-sm mb-4">{analyzeError}</p>
        )}
      {aiAnalysis ? (
        <>
          <p className="text-slate-200 mb-4">{aiAnalysis.summary}</p>
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-1">Root cause</h3>
              <p className="text-slate-200 font-medium">{aiAnalysis.rootCause}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-2">Affected path</h3>
              <ul className="space-y-1 text-sm text-slate-300 font-mono">
                {aiAnalysis.affectedPath.map((path, i) => (
                  <li key={i}>{path}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-2">Recommendations</h3>
              <ul className="space-y-2">
                {aiAnalysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2 text-slate-300">
                    <span className="text-cyan-500">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Confidence: {(aiAnalysis.confidence * 100).toFixed(0)}% · Analyzed at{" "}
            {new Date(aiAnalysis.analyzedAt).toLocaleString()}
          </p>
        </>
      ) : (
        <p className="text-slate-500 text-sm">Click &quot;Analyze with AI&quot; to get root cause analysis. Requires TETRATE_API_KEY in .env.</p>
      )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Dependency graph</h2>
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 font-mono text-sm">
          <div className="space-y-4">
            <div>
              <span className="text-slate-500">Nodes:</span>
              <ul className="mt-2 grid sm:grid-cols-2 gap-2">
                {dependencyGraph.nodes.map((n) => (
                  <li key={n.name} className="text-slate-300">
                    <span className="text-cyan-400">{n.name}</span>
                    {n.namespace && (
                      <span className="text-slate-500"> ({n.namespace})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-slate-500">Edges:</span>
              <ul className="mt-2 space-y-2">
                {dependencyGraph.edges.map((e, i) => (
                  <li key={i} className="text-slate-300">
                    <span className="text-cyan-400">{e.source}</span>
                    <span className="text-slate-500"> → </span>
                    <span className="text-indigo-400">{e.target}</span>
                    {e.errorRate !== undefined && (
                      <span className="text-rose-400 ml-2">
                        (err: {(e.errorRate * 100).toFixed(1)}%)
                      </span>
                    )}
                    {e.p99LatencyMs !== undefined && (
                      <span className="text-amber-400 ml-2">
                        p99: {e.p99LatencyMs}ms
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          to={`/topology?incident=${incident.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all text-sm font-medium"
        >
          View in Service Map →
        </Link>
      </div>

      {relatedIncidents.length > 0 && (
        <section className="mt-8 p-6 rounded-xl border border-slate-800 bg-slate-900/50">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Related incidents</h2>
          <p className="text-sm text-slate-500 mb-3">Other incidents affecting the same services:</p>
          <ul className="space-y-2">
            {relatedIncidents.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/incidents/${r.id}`}
                  state={{ incident: r }}
                  className="text-cyan-400 hover:underline"
                >
                  {r.title}
                </Link>
                <span className="text-slate-500 text-sm ml-2">({r.severity})</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
