import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FontOptimization } from "@/components/ui/font-optimization";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthPage } from "@/components/auth/AuthPage";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Analytics } from "@/components/dashboard/Analytics";
import { Settings } from "@/components/dashboard/Settings";
import { FileUpload } from "@/components/upload/FileUpload";
import { FileManager } from "@/components/files/FileManager";
import { SharedLinks } from "@/components/files/SharedLinks";
import { FileReceiver } from "@/components/files/FileReceiver";
import { EnterpriseTeamsManager } from "./components/teams/EnterpriseTeamsManager";
import { PublicSharePage } from "@/components/sharing/PublicSharePage";
import CodePage from "./pages/CodePage";
import { SubscriptionPage } from "@/components/subscription/SubscriptionPage";
import { SubscriptionSuccess } from "./pages/SubscriptionSuccess";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <FontOptimization />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Public Routes */}
              <Route path="/auth" element={
                <AuthGuard requireAuth={false}>
                  <AuthPage />
                </AuthGuard>
              } />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/subscription-success" element={<SubscriptionSuccess />} />
              <Route path="/share/:token" element={<PublicSharePage />} />
              <Route path="/code" element={<CodePage />} />
              
              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/upload" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <FileUpload />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/files" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <FileManager />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/receive" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <FileReceiver />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/teams" element={
                <ProtectedRoute>
                  <EnterpriseTeamsManager />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/shared" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SharedLinks />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/analytics" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Analytics />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/settings" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
