import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UploadResume from "./pages/UploadResume";
import History from "./pages/History";
import JobMatching from "./pages/JobMatching";
import AIInsights from "./pages/AIInsights";
import Aptitude from "./pages/Aptitude";
import ColdEmail from "./pages/ColdEmail";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Dashboard - root route */}
          <Route 
            path="/" 
            element={
              <DashboardLayout>
                <Dashboard demoMode={true} />
              </DashboardLayout>
            } 
          />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Public Upload Route */}
          <Route 
            path="/app/upload" 
            element={
              <DashboardLayout>
                <UploadResume />
              </DashboardLayout>
            } 
          />

          {/* Protected Routes */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route 
              path="dashboard" 
              element={
                <DashboardLayout>
                  <Dashboard demoMode={false} />
                </DashboardLayout>
              } 
            />
            <Route 
              path="history" 
              element={
                <DashboardLayout>
                  <History />
                </DashboardLayout>
              } 
            />
            <Route 
              path="job-matching" 
              element={
                <DashboardLayout>
                  <JobMatching />
                </DashboardLayout>
              } 
            />
            <Route 
              path="insights" 
              element={
                <DashboardLayout>
                  <AIInsights />
                </DashboardLayout>
              } 
            />
            <Route 
              path="aptitude" 
              element={
                <DashboardLayout>
                  <Aptitude />
                </DashboardLayout>
              } 
            />
            <Route 
              path="cold-email" 
              element={
                <DashboardLayout>
                  <ColdEmail />
                </DashboardLayout>
              } 
            />
          </Route>

          {/* Catch all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
