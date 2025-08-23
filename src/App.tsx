import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthPage } from "@/components/auth/AuthPage";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Analytics } from "@/components/dashboard/Analytics";
import { Settings } from "@/components/dashboard/Settings";
import { FileUpload } from "@/components/upload/FileUpload";
import { AuthPage } from "@/components/auth";
import { FileManager } from "@/components/files/FileManager";
import { SharedLinks } from "@/components/files/SharedLinks";
import { FileReceiver } from "@/components/files/FileReceiver";
import TeamsManager from "./components/teams/TeamsManager";
import TeamFileShare from "./components/teams/TeamFileShare";
import { TeamFiles } from "@/components/teams/TeamFiles";
import { PublicSharePage } from "@/components/sharing/PublicSharePage";
import { CodeSharePage } from "@/components/sharing/CodeSharePage";
import { SubscriptionPage } from "@/components/subscription/SubscriptionPage";
import { SubscriptionSuccess } from "./pages/SubscriptionSuccess";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <div className="dark">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              } />
              <Route path="/dashboard/upload" element={
                <DashboardLayout>
                  <FileUpload />
                </DashboardLayout>
              } />
              <Route path="/dashboard/files" element={
                <DashboardLayout>
                  <FileManager />
                </DashboardLayout>
              } />
              <Route path="/dashboard/receive" element={
                <DashboardLayout>
                  <FileReceiver />
                </DashboardLayout>
              } />
              <Route path="/dashboard/teams" element={
                <DashboardLayout>
                  <div className="space-y-8">
                    <TeamsManager />
                    <TeamFiles />
                  </div>
                </DashboardLayout>
              } />
              <Route path="/dashboard/team-files" element={
                <DashboardLayout>
                  <TeamFileShare />
                </DashboardLayout>
              } />
              <Route path="/dashboard/shared" element={
                <DashboardLayout>
                  <SharedLinks />
                </DashboardLayout>
              } />
              <Route path="/dashboard/analytics" element={
                <DashboardLayout>
                  <Analytics />
                </DashboardLayout>
              } />
              <Route path="/dashboard/settings" element={
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              } />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/subscription-success" element={<SubscriptionSuccess />} />
              <Route path="/share/:token" element={<PublicSharePage />} />
              <Route path="/code" element={<CodeSharePage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
