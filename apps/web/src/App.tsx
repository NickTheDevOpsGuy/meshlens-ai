import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import IncidentDetailPage from "./pages/IncidentDetailPage";
import ServiceMapPage from "./pages/ServiceMapPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
        <Route path="/topology" element={<ServiceMapPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
}
