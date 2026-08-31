import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ConsoleLayout from "./console/ConsoleLayout";
import DashboardPage from "./console/DashboardPage";
import VideosPage from "./console/VideosPage";
import VideoDetailPage from "./console/VideoDetailPage";
import UploadPage from "./console/UploadPage";
import BillingPage from "./console/BillingPage";
import SettingsPage from "./console/SettingsPage";

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
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            {/* Legacy public upload URL now lives in the console */}
            <Route path="/upload" element={<Navigate to="/console/upload" replace />} />

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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
