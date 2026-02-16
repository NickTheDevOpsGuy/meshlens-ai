import { useParams, Link } from "react-router-dom";

const RUNBOOK_TEMPLATES: Record<string, { title: string; steps: string[] }> = {
  "payment-cascade": {
    title: "Payment Service Cascade Failure",
    steps: [
      "1. Check payment-gateway health and error rates in Prometheus",
      "2. Verify database connection pool utilization (Postgres)",
      "3. Check for connection leaks in refund/async handlers",
      "4. Review slow query log; add timeouts if needed",
      "5. Consider PgBouncer or increase max_connections",
    ],
  },
  "ml-timeouts": {
    title: "ML Inference Timeouts",
    steps: [
      "1. Verify ml-inference pod count and scaling status",
      "2. Check queue depth and cold-start duration",
      "3. Increase min replicas during business hours",
      "4. Add request queue depth alerting",
      "5. Consider pre-warming pods on schedule",
    ],
  },
  "config-rollback": {
    title: "Config Rollback",
    steps: [
      "1. Identify the config change (Git, ConfigMap, rollout)",
      "2. Revert to last known good version",
      "3. Restart affected workloads if needed",
      "4. Monitor for stabilization",
      "5. Post-incident: add validation/canary for config changes",
    ],
  },
  "network-partition": {
    title: "Network Partition / Connectivity",
    steps: [
      "1. Verify network policies and service mesh rules",
      "2. Check pod-to-pod connectivity (kubectl exec, curl)",
      "3. Review node status and CNI logs",
      "4. Check for partial partition (split-brain scenarios)",
      "5. Restore connectivity; consider circuit breakers",
    ],
  },
  "memory-leak": {
    title: "Memory Leak",
    steps: [
      "1. Identify process with growing RSS/heap in metrics",
      "2. Take heap dump if supported (e.g. Java, Node)",
      "3. Restart affected pods to recover",
      "4. Analyze heap dump for leak suspects",
      "5. Add memory limit alerts and fix leak",
    ],
  },
};

export default function RunbookPage() {
  const { topic } = useParams<{ topic: string }>();
  const template = topic ? RUNBOOK_TEMPLATES[topic] : null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 mb-6 transition-colors"
      >
        ← Back to dashboard
      </Link>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">
          {template?.title ?? `Runbook: ${topic || "Unknown"}`}
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Standard incident response steps. Adapt to your environment.
        </p>

        {template ? (
          <ol className="space-y-3">
            {template.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-slate-300">
                <span className="text-cyan-500 font-medium">{i + 1}.</span>
                <span>{step.replace(/^\d+\.\s*/, "")}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-slate-500">
            No runbook template for &quot;{topic}&quot;. Add templates in{" "}
            <code className="text-slate-400">RunbookPage.tsx</code> or link to
            your external runbook docs.
          </p>
        )}
      </div>
    </div>
  );
}
