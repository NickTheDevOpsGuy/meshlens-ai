import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/topology", label: "Service Map" },
  { to: "/timeline", label: "Timeline" },
  { to: "/slo", label: "SLO" },
  { to: "/import", label: "Import" },
  { to: "/settings", label: "Settings" },
];

export default function Layout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              to="/"
              className="flex items-center gap-2 text-slate-100 hover:text-cyan-400 transition-colors"
            >
              <span className="text-xl font-semibold tracking-tight">
                Meshlens
              </span>
              <span className="text-cyan-400 font-mono text-sm">AI</span>
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map(({ to, label }) => {
                const isActive =
                  location.pathname === to ||
                  (to !== "/" && location.pathname.startsWith(to));
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-800 text-cyan-400"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
