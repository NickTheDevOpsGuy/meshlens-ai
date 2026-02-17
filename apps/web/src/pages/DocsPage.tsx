import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const DOCS = [
  { id: "overview", label: "Overview", file: "overview.md" },
  {
    id: "getting-started",
    label: "Getting Started",
    file: "getting-started.md",
  },
  { id: "configuration", label: "Configuration", file: "configuration.md" },
  { id: "incidents", label: "Incidents & Import", file: "incidents.md" },
  { id: "runbooks", label: "Runbooks", file: "runbooks.md" },
  { id: "deployment", label: "Deployment", file: "deployment.md" },
];

export default function DocsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const docId = searchParams.get("page") || "overview";
  const doc = DOCS.find((d) => d.id === docId) ?? DOCS[0];
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const r = await fetch(`/docs/${doc.file}`);
        const text = r.ok
          ? await r.text()
          : "# Not found\n\nDocument not found.";
        setMarkdown(text);
      } catch {
        setMarkdown("# Error\n\nFailed to load documentation.");
      } finally {
        setLoading(false);
      }
    })();
  }, [doc.file]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <aside className="w-56 flex-shrink-0 hidden sm:block">
          <nav className="sticky top-24 space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Documentation
            </p>
            {DOCS.map((d) => (
              <Link
                key={d.id}
                to={`/docs?page=${d.id}`}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  docId === d.id
                    ? "bg-cyan-500/20 text-cyan-400 font-medium"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {d.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="sm:hidden mb-4">
            <select
              value={docId}
              onChange={(e) => setSearchParams({ page: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
            >
              {DOCS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <article className="max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-100 [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-200 [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-slate-200 [&_h3]:mt-4 [&_p]:text-slate-400 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-slate-400 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-slate-400 [&_ol]:mb-4 [&_li]:mb-1 [&_hr]:border-slate-700 [&_hr]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-cyan-500/50 [&_blockquote]:pl-4 [&_blockquote]:text-slate-400 [&_blockquote]:italic">
            {loading ? (
              <p className="text-slate-400">Loading...</p>
            ) : (
              <div className="docs-content">
                <ReactMarkdown
                  components={{
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target={href?.startsWith("http") ? "_blank" : undefined}
                        rel={
                          href?.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="text-cyan-400 hover:underline"
                      >
                        {children}
                      </a>
                    ),
                    code: ({ children }) => (
                      <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 text-sm">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="p-4 rounded-lg bg-slate-900 border border-slate-700 overflow-x-auto">
                        {children}
                      </pre>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-slate-700 rounded-lg overflow-hidden">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-2 bg-slate-800 text-left text-sm font-medium text-slate-300 border-b border-slate-700">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-2 border-b border-slate-700/50 text-slate-400 text-sm">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            )}
          </article>
        </main>
      </div>
    </div>
  );
}
