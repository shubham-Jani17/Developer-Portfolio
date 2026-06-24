import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PortfolioProvider } from "./context/PortfolioContext";
import PublicApp from "./PublicApp";

// Admin Dashboard Components
import AdminLayout from "./Admin/components/AdminLayout";
import ProtectedRoute from "./Admin/components/ProtectedRoute";
import AboutPage from "./Admin/pages/AboutPage";
import BlogsPage from "./Admin/pages/BlogsPage";
import DashboardPage from "./Admin/pages/DashboardPage";
import ExperiencePage from "./Admin/pages/ExperiencePage";
import LoginPage from "./Admin/pages/LoginPage";
import MessagesPage from "./Admin/pages/MessagesPage";
import ProjectsPage from "./Admin/pages/ProjectsPage";
import SkillsPage from "./Admin/pages/SkillsPage";
import SettingsPage from "./Admin/pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Login Route */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Protected Admin routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/about" element={<AboutPage />} />
            <Route path="/admin/skills" element={<SkillsPage />} />
            <Route path="/admin/projects" element={<ProjectsPage />} />
            <Route path="/admin/experience" element={<ExperiencePage />} />
            <Route path="/admin/blogs" element={<BlogsPage />} />
            <Route path="/admin/messages" element={<MessagesPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Public Portfolio Route */}
        <Route
          path="/*"
          element={
            <PortfolioProvider>
              <PublicApp />
            </PortfolioProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

