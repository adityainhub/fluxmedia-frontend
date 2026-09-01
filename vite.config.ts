import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // hls.js is a single ~520 kB library and is already confined to the lazy
    // watch/embed/video-detail routes, so it can't be split further. The limit is
    // raised just past it so the warning still fires on genuinely new bloat.
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        // Split rarely-changing vendor code into its own chunks so app deploys
        // don't invalidate them. Route-level splitting lives in App.tsx; hls.js
        // and recharts are already isolated because only lazy routes import them.
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "motion-vendor": ["framer-motion"],
        },
      },
    },
  },
}));
