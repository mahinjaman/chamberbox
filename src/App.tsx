import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DoctorRoute } from "@/components/auth/DoctorRoute";
import { StaffRoute } from "@/components/auth/StaffRoute";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";


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
import PrescriptionTemplates from "./pages/PrescriptionTemplates";
import Finances from "./pages/Finances";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import QueueStatus from "./pages/QueueStatus";
import ProfileEditor from "./pages/ProfileEditor";
import DoctorPublicProfile from "./pages/DoctorPublicProfile";
import DirectBooking from "./pages/DirectBooking";
import IntegrationSettings from "./pages/IntegrationSettings";
import MyTickets from "./pages/MyTickets";
import Tutorials from "./pages/Tutorials";
import PaymentHistory from "./pages/PaymentHistory";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import DoctorManagement from "./pages/admin/DoctorManagement";
import SubscriptionManagement from "./pages/admin/SubscriptionManagement";
import TicketManagement from "./pages/admin/TicketManagement";
import TutorialManagement from "./pages/admin/TutorialManagement";
import PlanConfiguration from "./pages/admin/PlanConfiguration";
import PaymentVerification from "./pages/admin/PaymentVerification";
import DoctorDetail from "./pages/admin/DoctorDetail";
 import AdminManagement from "./pages/admin/AdminManagement";
import PaymentAnalytics from "./pages/admin/PaymentAnalytics";
import AdminSmsConfig from "./pages/admin/AdminSmsConfig";

// Staff Pages
import StaffManagement from "./pages/StaffManagement";
import StaffDashboard from "./pages/StaffDashboard";
import StaffQueue from "./pages/staff/StaffQueue";
import StaffPatients from "./pages/staff/StaffPatients";
import StaffPatientDetail from "./pages/staff/StaffPatientDetail";
import StaffPrescriptions from "./pages/staff/StaffPrescriptions";
import StaffChambers from "./pages/staff/StaffChambers";
import StaffFinances from "./pages/staff/StaffFinances";
import StaffTeam from "./pages/staff/StaffTeam";
import StaffIntegrations from "./pages/staff/StaffIntegrations";
import StaffSettings from "./pages/staff/StaffSettings";

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
            <Route path="/book/:slug" element={<DirectBooking />} />
            
            {/* Auth Routes - Separate portals for each role */}
            <Route path="/login" element={<DoctorLogin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff/signup" element={<StaffSignup />} />
            <Route path="/2243" element={<AdminLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Doctor Dashboard Routes - Only doctors can access */}
            <Route
              path="/dashboard"
              element={
                <DoctorRoute>
                  <Dashboard />
                </DoctorRoute>
              }
            />
            <Route
              path="/dashboard/patients"
              element={
                <DoctorRoute>
                  <Patients />
                </DoctorRoute>
              }
            />
            <Route
              path="/dashboard/patients/new"
              element={
                <DoctorRoute>
                  <NewPatient />
                </DoctorRoute>
              }
            />
            <Route
              path="/dashboard/patients/:id/edit"
              element={
                <DoctorRoute>
                  <EditPatient />
                </DoctorRoute>
              }
            />
            <Route
              path="/dashboard/patients/:id"
              element={
                <DoctorRoute>
                  <PatientDetail />
                </DoctorRoute>
              }
            />
            <Route
              path="/dashboard/queue"
              element={
                <DoctorRoute>
                  <Queue />
                </DoctorRoute>
              }
            />
            <Route
              path="/dashboard/prescriptions"
              element={
                <DoctorRoute>
                  <Prescriptions />
                </DoctorRoute>
              }
            />
            <Route
              path="/dashboard/prescriptions/templates"
              element={
                <DoctorRoute>
                  <PrescriptionTemplates />
                </DoctorRoute>
              }
            />
            <Route
              path="/dashboard/finances"
              element={
                <DoctorRoute>
                  <Finances />
                </DoctorRoute>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <DoctorRoute>
                  <Analytics />
                </DoctorRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <DoctorRoute>
                  <Settings />
                </DoctorRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <DoctorRoute>
                  <ProfileEditor />
                </DoctorRoute>
              }
            />
            <Route
              path="/dashboard/integrations"
              element={
                <DoctorRoute>
                  <IntegrationSettings />
                </DoctorRoute>
              }
            />
            <Route
              path="/dashboard/tickets"
              element={
                <DoctorRoute>
                  <MyTickets />
                </DoctorRoute>
              }
            />
            <Route
              path="/dashboard/staff"
              element={
                <DoctorRoute>
                  <StaffManagement />
                </DoctorRoute>
              }
            />
            <Route
              path="/dashboard/tutorials"
              element={
                <DoctorRoute>
                  <Tutorials />
                </DoctorRoute>
              }
            />
            <Route
              path="/dashboard/payments"
              element={
                <DoctorRoute>
                  <PaymentHistory />
                </DoctorRoute>
              }
            />

            {/* Staff Routes - Only staff can access */}
            <Route
              path="/staff"
              element={
                <StaffRoute>
                  <StaffDashboard />
                </StaffRoute>
              }
            />
            <Route
              path="/staff/queue"
              element={
                <StaffRoute>
                  <StaffQueue />
                </StaffRoute>
              }
            />
            <Route
              path="/staff/patients"
              element={
                <StaffRoute>
                  <StaffPatients />
                </StaffRoute>
              }
            />
            <Route
              path="/staff/patients/:id"
              element={
                <StaffRoute>
                  <StaffPatientDetail />
                </StaffRoute>
              }
            />
            <Route
              path="/staff/prescriptions"
              element={
                <StaffRoute>
                  <StaffPrescriptions />
                </StaffRoute>
              }
            />
            <Route
              path="/staff/chambers"
              element={
                <StaffRoute>
                  <StaffChambers />
                </StaffRoute>
              }
            />
            <Route
              path="/staff/finances"
              element={
                <StaffRoute>
                  <StaffFinances />
                </StaffRoute>
              }
            />
            <Route
              path="/staff/team"
              element={
                <StaffRoute>
                  <StaffTeam />
                </StaffRoute>
              }
            />
            <Route
              path="/staff/integrations"
              element={
                <StaffRoute>
                  <StaffIntegrations />
                </StaffRoute>
              }
            />
            <Route
              path="/staff/settings"
              element={
                <StaffRoute>
                  <StaffSettings />
                </StaffRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
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
              path="/admin/doctors/:id"
              element={
                <ProtectedRoute>
                  <DoctorDetail />
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
              path="/admin/plans"
              element={
                <ProtectedRoute>
                  <PlanConfiguration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute>
                  <PaymentVerification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute>
                  <PaymentAnalytics />
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
             <Route
               path="/admin/users"
               element={
                 <ProtectedRoute>
                   <AdminManagement />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/admin/sms"
               element={
                 <ProtectedRoute>
                   <AdminSmsConfig />
                 </ProtectedRoute>
               }
             />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
