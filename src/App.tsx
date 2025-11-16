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
import { TeamFileSharePage } from "./components/teams/TeamFileSharePage";
import { DashboardPage } from "./components/teams/pages/DashboardPage";
import { TeamsPage } from "./components/teams/pages/TeamsPage";
import { ReceiveFilesPage } from "./components/teams/pages/ReceiveFilesPage";
import { ShareFilesPage } from "./components/teams/pages/ShareFilesPage";
import { InvitesPage } from "./components/teams/pages/InvitesPage";
import { PoliciesPage } from "./components/teams/pages/PoliciesPage";
import { AuditPage } from "./components/teams/pages/AuditPage";
import { SettingsPage as TeamSettingsPage } from "./components/teams/pages/SettingsPage";
import { PublicSharePage } from "@/components/sharing/PublicSharePage";
import { ReceiveUploadPage } from "./pages/ReceiveUploadPage";
import CodePage from "./pages/CodePage";
import { SubscriptionPage } from "@/components/subscription/SubscriptionPage";
import { SubscriptionSuccess } from "./pages/SubscriptionSuccess";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
const App = () => <QueryClientProvider client={queryClient}>
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
              <Route path="/auth" element={<AuthGuard requireAuth={false}>
                  <AuthPage />
                </AuthGuard>} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/subscription-success" element={<SubscriptionSuccess />} />
              <Route path="/share/:token" element={<PublicSharePage />} />
              <Route path="/receive/:token" element={<ReceiveUploadPage />} />
              <Route path="/code" element={<CodePage />} />
              
              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={<ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>} />
              <Route path="/dashboard/upload" element={<ProtectedRoute>
                  <DashboardLayout>
                    <FileUpload />
                  </DashboardLayout>
                </ProtectedRoute>} />
              <Route path="/dashboard/files" element={<ProtectedRoute>
                  <DashboardLayout>
                    <FileManager />
                  </DashboardLayout>
                </ProtectedRoute>} />
              <Route path="/dashboard/receive" element={<ProtectedRoute>
                  <DashboardLayout>
                    <FileReceiver />
                  </DashboardLayout>
                </ProtectedRoute>} />
              <Route path="/dashboard/teams" element={<ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>} />
              <Route path="/dashboard/teams/manage" element={<ProtectedRoute>
                  <TeamsPage />
                </ProtectedRoute>} />
              <Route path="/dashboard/teams/receive" element={<ProtectedRoute>
                  <ReceiveFilesPage />
                </ProtectedRoute>} />
              <Route path="/dashboard/teams/share" element={<ProtectedRoute>
                  <ShareFilesPage />
                </ProtectedRoute>} />
              <Route path="/dashboard/teams/invites" element={<ProtectedRoute>
                  <InvitesPage />
                </ProtectedRoute>} />
              <Route path="/dashboard/teams/policies" element={<ProtectedRoute>
                  <PoliciesPage />
                </ProtectedRoute>} />
              <Route path="/dashboard/teams/audit" element={<ProtectedRoute>
                  <AuditPage />
                </ProtectedRoute>} />
              <Route path="/dashboard/teams/settings" element={<ProtectedRoute>
                  <TeamSettingsPage />
                </ProtectedRoute>} />
              <Route path="/dashboard/shared" element={<ProtectedRoute>
                  <DashboardLayout>
                    <SharedLinks />
                  </DashboardLayout>
                </ProtectedRoute>} />
              <Route path="/dashboard/analytics" element={<ProtectedRoute>
                  <DashboardLayout>
                    <Analytics />
                  </DashboardLayout>
                </ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </ProtectedRoute>} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>;
export default App; 