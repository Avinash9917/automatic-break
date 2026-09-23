import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { BreakProvider } from "@/contexts/BreakContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BreakOverlay } from "@/components/break/BreakOverlay";
import { BreakWarningNotification } from "@/components/break/BreakWarningNotification";
import { lazy, Suspense } from "react";
import { Loading } from "@/components/Loading";
import { CursorSparkleEffect } from "@/components/3d/CursorSparkleEffect";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Lazy load routes for better performance
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const OAuthCallback = lazy(() => import("./pages/auth/OAuthCallback"));
const YouTubeCallback = lazy(() => import("./pages/auth/YouTubeCallback"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Integrations = lazy(() => import("./pages/settings/Integrations"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const History = lazy(() => import("./pages/History"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const Recommendations = lazy(() => import("./pages/Recommendations"));
const Offline = lazy(() => import("./pages/Offline"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BreakProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <CursorSparkleEffect />
            <HashRouter>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />
                  <Route path="/auth/reset-password" element={<ResetPassword />} />
                  <Route path="/auth/callback" element={<OAuthCallback />} />
                  <Route path="/auth/youtube-callback" element={<YouTubeCallback />} />
                  <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                  <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/settings/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/offline" element={<Offline />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <BreakOverlay />
              <BreakWarningNotification />
            </HashRouter>
          </TooltipProvider>
        </BreakProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
