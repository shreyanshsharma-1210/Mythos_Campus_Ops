import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { SidebarProvider } from "./contexts/SidebarContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CampusOSProvider } from "./contexts/CampusOSContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard2 from "./pages/Dashboard2";
import NotFound from "./pages/NotFound";

// CampusOS Modules
import GrievanceSubmit from "./pages/GrievanceSubmit";
import GrievanceDashboard from "./pages/GrievanceDashboard";
import MaintenanceReport from "./pages/MaintenanceReport";
import MaintenanceDashboard from "./pages/MaintenanceDashboard";
import PolicyNavigator from "./pages/PolicyNavigator";
import LostReport from "./pages/LostReport";
import FoundReport from "./pages/FoundReport";
import MatchFeed from "./pages/MatchFeed";
import HeatmapView from "./pages/HeatmapView";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminGrievances from "./pages/AdminGrievances";
import AdminMaintenance from "./pages/AdminMaintenance";
import AdminLostFound from "./pages/AdminLostFound";
import AdminPolicy from "./pages/AdminPolicy";

// New Modules
import AttendanceIntelligence from "./pages/AttendanceIntelligence";
import AntiRagging from "./pages/AntiRagging";
import CanteenPredictor from "./pages/CanteenPredictor";
import ScholarshipFinder from "./pages/ScholarshipFinder";
import AgentLog from "./pages/AgentLog";

// Allowed roles for student-facing pages (students + teachers, admins excluded to keep separation)
const STUDENT_ROLES = ["student", "teacher"] as const;
// Admin-only role
const ADMIN_ROLE = "admin" as const;

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CampusOSProvider>
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<Index />} />

            {/* Auth pages — redirect if already logged in */}
            <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

            {/* ── Student / Teacher routes ── */}
            <Route path="/dashboard2" element={
              <ProtectedRoute requiredRole={[...STUDENT_ROLES]}>
                <Dashboard2 />
              </ProtectedRoute>
            } />

            <Route path="/grievances/submit" element={
              <ProtectedRoute requiredRole={[...STUDENT_ROLES]}>
                <GrievanceSubmit />
              </ProtectedRoute>
            } />
            <Route path="/grievances/dashboard" element={
              <ProtectedRoute requiredRole={[...STUDENT_ROLES]}>
                <GrievanceDashboard />
              </ProtectedRoute>
            } />

            <Route path="/maintenance/report" element={
              <ProtectedRoute requiredRole={[...STUDENT_ROLES]}>
                <MaintenanceReport />
              </ProtectedRoute>
            } />
            <Route path="/maintenance/dashboard" element={
              <ProtectedRoute requiredRole={[...STUDENT_ROLES]}>
                <MaintenanceDashboard />
              </ProtectedRoute>
            } />

            <Route path="/policy" element={
              <ProtectedRoute requiredRole={[...STUDENT_ROLES]}>
                <PolicyNavigator />
              </ProtectedRoute>
            } />

            <Route path="/lost" element={
              <ProtectedRoute requiredRole={[...STUDENT_ROLES]}>
                <LostReport />
              </ProtectedRoute>
            } />
            <Route path="/found" element={
              <ProtectedRoute requiredRole={[...STUDENT_ROLES]}>
                <FoundReport />
              </ProtectedRoute>
            } />
            <Route path="/lost-found" element={
              <ProtectedRoute requiredRole={[...STUDENT_ROLES]}>
                <MatchFeed />
              </ProtectedRoute>
            } />
            <Route path="/heatmap" element={
              <ProtectedRoute requiredRole={[...STUDENT_ROLES]}>
                <HeatmapView />
              </ProtectedRoute>
            } />

            <Route path="/attendance" element={
              <ProtectedRoute requiredRole={[...STUDENT_ROLES]}>
                <AttendanceIntelligence />
              </ProtectedRoute>
            } />
            <Route path="/anti-ragging" element={
              <ProtectedRoute requiredRole={[...STUDENT_ROLES]}>
                <AntiRagging />
              </ProtectedRoute>
            } />
            <Route path="/canteen" element={
              <ProtectedRoute requiredRole={[...STUDENT_ROLES]}>
                <CanteenPredictor />
              </ProtectedRoute>
            } />
            <Route path="/scholarships" element={
              <ProtectedRoute requiredRole={[...STUDENT_ROLES]}>
                <ScholarshipFinder />
              </ProtectedRoute>
            } />
            <Route path="/agent" element={
              <ProtectedRoute requiredRole={ADMIN_ROLE}>
                <AgentLog />
              </ProtectedRoute>
            } />

            {/* ── Admin-only routes ── */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole={ADMIN_ROLE}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/grievances" element={
              <ProtectedRoute requiredRole={ADMIN_ROLE}>
                <AdminGrievances />
              </ProtectedRoute>
            } />
            <Route path="/admin/maintenance" element={
              <ProtectedRoute requiredRole={ADMIN_ROLE}>
                <AdminMaintenance />
              </ProtectedRoute>
            } />
            <Route path="/admin/lost-found" element={
              <ProtectedRoute requiredRole={ADMIN_ROLE}>
                <AdminLostFound />
              </ProtectedRoute>
            } />
            <Route path="/admin/policy" element={
              <ProtectedRoute requiredRole={ADMIN_ROLE}>
                <AdminPolicy />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </SidebarProvider>
      </CampusOSProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
