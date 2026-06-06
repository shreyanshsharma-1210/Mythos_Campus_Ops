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

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CampusOSProvider>
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

            <Route path="/dashboard2" element={<ProtectedRoute requiredRole="student"><Dashboard2 /></ProtectedRoute>} />

            {/* CampusOS Modules */}
            <Route path="/grievances/submit" element={<GrievanceSubmit />} />
            <Route path="/grievances/dashboard" element={<GrievanceDashboard />} />

            <Route path="/maintenance/report" element={<MaintenanceReport />} />
            <Route path="/maintenance/dashboard" element={<MaintenanceDashboard />} />

            <Route path="/policy" element={<PolicyNavigator />} />

            <Route path="/lost" element={<LostReport />} />
            <Route path="/found" element={<FoundReport />} />
            <Route path="/lost-found" element={<MatchFeed />} />
            <Route path="/heatmap" element={<HeatmapView />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </SidebarProvider>
      </CampusOSProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
