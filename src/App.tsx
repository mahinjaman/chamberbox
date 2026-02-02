import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { FloatingWidgets } from "@/components/common/FloatingWidgets";

// Pages
import Landing from "./pages/Landing";
import DoctorLogin from "./pages/auth/DoctorLogin";
import StaffLogin from "./pages/auth/StaffLogin";
import StaffSignup from "./pages/auth/StaffSignup";
import AdminLogin from "./pages/auth/AdminLogin";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import NewPatient from "./pages/NewPatient";
import EditPatient from "./pages/EditPatient";
import PatientDetail from "./pages/PatientDetail";
import Queue from "./pages/Queue";
import Prescriptions from "./pages/Prescriptions";
import Finances from "./pages/Finances";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import QueueStatus from "./pages/QueueStatus";
import ProfileEditor from "./pages/ProfileEditor";
import DoctorPublicProfile from "./pages/DoctorPublicProfile";
import IntegrationSettings from "./pages/IntegrationSettings";
import MyTickets from "./pages/MyTickets";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import DoctorManagement from "./pages/admin/DoctorManagement";
import SubscriptionManagement from "./pages/admin/SubscriptionManagement";
import TicketManagement from "./pages/admin/TicketManagement";
import TutorialManagement from "./pages/admin/TutorialManagement";

// Staff Pages
import StaffManagement from "./pages/StaffManagement";
import StaffDashboard from "./pages/StaffDashboard";
import StaffQueue from "./pages/staff/StaffQueue";
import StaffPatients from "./pages/staff/StaffPatients";
import StaffPrescriptions from "./pages/staff/StaffPrescriptions";
import StaffChambers from "./pages/staff/StaffChambers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/queue-status" element={<QueueStatus />} />
            <Route path="/doctor/:slug" element={<DoctorPublicProfile />} />
            
            {/* Auth Routes - Separate portals for each role */}
            <Route path="/login" element={<DoctorLogin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff/signup" element={<StaffSignup />} />
            <Route path="/2243" element={<AdminLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/patients"
              element={
                <ProtectedRoute>
                  <Patients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/patients/new"
              element={
                <ProtectedRoute>
                  <NewPatient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/patients/:id/edit"
              element={
                <ProtectedRoute>
                  <EditPatient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/patients/:id"
              element={
                <ProtectedRoute>
                  <PatientDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/queue"
              element={
                <ProtectedRoute>
                  <Queue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/prescriptions"
              element={
                <ProtectedRoute>
                  <Prescriptions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/finances"
              element={
                <ProtectedRoute>
                  <Finances />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute>
                  <ProfileEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/integrations"
              element={
                <ProtectedRoute>
                  <IntegrationSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/tickets"
              element={
                <ProtectedRoute>
                  <MyTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/staff"
              element={
                <ProtectedRoute>
                  <StaffManagement />
                </ProtectedRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/queue"
              element={
                <ProtectedRoute>
                  <StaffQueue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/patients"
              element={
                <ProtectedRoute>
                  <StaffPatients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/patients/:id"
              element={
                <ProtectedRoute>
                  <PatientDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/prescriptions"
              element={
                <ProtectedRoute>
                  <StaffPrescriptions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/chambers"
              element={
                <ProtectedRoute>
                  <StaffChambers />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/doctors"
              element={
                <ProtectedRoute>
                  <DoctorManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subscriptions"
              element={
                <ProtectedRoute>
                  <SubscriptionManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tickets"
              element={
                <ProtectedRoute>
                  <TicketManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tutorials"
              element={
                <ProtectedRoute>
                  <TutorialManagement />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FloatingWidgets />
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
