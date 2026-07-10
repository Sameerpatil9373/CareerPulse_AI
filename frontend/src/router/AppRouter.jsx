import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import JobMatching from "../pages/JobMatching";
import AIInsights from "../pages/AIInsights";
import AptitudePrep from "../pages/Aptitude"
import History from "../pages/History";
import ColdEmail from "../pages/ColdEmail";
import UploadResume from "../pages/UploadResume";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Dashboard Shell */}
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="upload" element={<UploadResume />} />
                  <Route path="job-matching" element={<JobMatching />} />
                  
                  {/* Ensure the path "insights" matches your Sidebar Link */}
                  <Route path="insights" element={<AIInsights />} />
                  <Route path="aptitude" element={<AptitudePrep />} />
                  <Route path="cold-email" element={<ColdEmail />} />
                  
                  <Route path="history" element={<History />} />
                  
                  {/* Catch-all for invalid /app paths */}
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Global Redirect for non-existent root paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;