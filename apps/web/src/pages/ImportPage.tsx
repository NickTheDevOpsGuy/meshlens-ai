import { useState } from "react";
import { Link } from "react-router-dom";

export default function ImportPage() {
  const [json, setJson] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const handleImport = async () => {
    setStatus("loading");
    setMessage("");
    try {
      const parsed = JSON.parse(json) as {
        id?: string;
        dependencyGraph?: unknown;
      };
      if (!parsed.id || !parsed.dependencyGraph) {
        throw new Error("JSON must have id and dependencyGraph");
      }
      const res = await fetch("/api/samples/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setStatus("ok");
      setMessage(`Saved as ${data.file}. Dashboard will update automatically.`);
      setJson("");
      window.dispatchEvent(new CustomEvent("meshlens-samples-changed"));
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setJson(String(reader.result));
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 mb-6"
      >
        ← Back to dashboard
      </Link>
      <h1 className="text-3xl font-bold text-slate-100 mb-2">
        Import incident
      </h1>
      <p className="text-slate-400 mb-6">
        Paste JSON or upload a file. Saves to{" "}
        <code className="text-slate-500">samples/incidents/</code>. Requires the
        API to be running.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Incident JSON
          </label>
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder='{"id":"my-incident","title":"...","severity":"high","status":"open","createdAt":"...","updatedAt":"...","affectedServices":[],"dependencyGraph":{"nodes":[],"edges":[]}}'
            className="w-full h-48 px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium cursor-pointer hover:bg-slate-700"
          >
            Upload .json file
          </label>
          <button
            onClick={handleImport}
            disabled={!json.trim() || status === "loading"}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 disabled:opacity-50"
          >
            {status === "loading" ? "Saving…" : "Save to samples"}
          </button>
        </div>
        {message && (
          <p
            className={`text-sm ${status === "ok" ? "text-emerald-400" : "text-rose-400"}`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
