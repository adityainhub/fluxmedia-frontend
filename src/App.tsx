import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageLoader } from "@/components/PageLoader";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// The landing page is the most common first paint, so it stays in the main bundle.
import Home from "./pages/Home";

// Everything else splits out. The console pulls in recharts and the marketing
// visitor never pays for it; the player/embed routes pull in hls.js the same way.
const Services = lazy(() => import("./pages/Services"));
const Pricing = lazy(() => import("./pages/Pricing"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Watch = lazy(() => import("./pages/Watch"));
const Embed = lazy(() => import("./pages/Embed"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));

const ConsoleLayout = lazy(() => import("./console/ConsoleLayout"));
const DashboardPage = lazy(() => import("./console/DashboardPage"));
const VideosPage = lazy(() => import("./console/VideosPage"));
const VideoDetailPage = lazy(() => import("./console/VideoDetailPage"));
const UploadPage = lazy(() => import("./console/UploadPage"));
const BillingPage = lazy(() => import("./console/BillingPage"));
const SettingsPage = lazy(() => import("./console/SettingsPage"));

const queryClient = new QueryClient();

// Marketing pages share the public navbar + footer; the console has its own chrome.
const MarketingLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<MarketingLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
              </Route>

              {/* Legacy public upload URL now lives in the console */}
              <Route path="/upload" element={<Navigate to="/console/upload" replace />} />

              {/* Public playback — no auth, standalone chrome */}
              <Route path="/watch/:token" element={<Watch />} />
              <Route path="/embed/:token" element={<Embed />} />

              <Route
                path="/console"
                element={
                  <ProtectedRoute>
                    <ConsoleLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="videos" element={<VideosPage />} />
                <Route path="videos/:id" element={<VideoDetailPage />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              <Route
                path="*"
                element={
                  <>
                    <Navbar />
                    <NotFound />
                    <Footer />
                  </>
                }
              />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
