import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 8080,
    watch: {
      usePolling: true,
      interval: 1000,
      binaryInterval: 1000,
      alwaysStat: true,
      followSymlinks: true,
      disableGlobbing: false,
    },
    hmr: {
      clientPort: 8080,
      protocol: 'ws',
    },
    proxy: {
      // Proxy API requests to backend
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy API v1 direct access
      '/api/v1': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));