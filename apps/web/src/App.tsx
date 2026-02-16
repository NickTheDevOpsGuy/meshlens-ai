import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import IncidentDetailPage from "./pages/IncidentDetailPage";
import ServiceMapPage from "./pages/ServiceMapPage";
import SettingsPage from "./pages/SettingsPage";
import TimelinePage from "./pages/TimelinePage";
import SLOPage from "./pages/SLOPage";
import ImportPage from "./pages/ImportPage";
import RunbookPage from "./pages/RunbookPage";
import DocsPage from "./pages/DocsPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
        <Route path="/topology" element={<ServiceMapPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/slo" element={<SLOPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/runbooks/:topic" element={<RunbookPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
}
