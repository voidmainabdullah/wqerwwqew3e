import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      usePolling: true, // safer for some file systems
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // 🧩 --- FIX SECTION ---
  optimizeDeps: {
    // prevent broken deps from being pre-bundled by esbuild
    exclude: [
      "lucide-react",
      "d3",
      "d3-color",
      "recharts",
      "react-transition-group",
      "@radix-ui/react-dialog",
      "decimal.js-light",
      "@tabler/icons-react",
    ],
  },

  // ensure older esbuild behaves predictably
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
    supported: {
      "top-level-await": true,
    },
  },

  // keep build target modern, avoid transpilation issues
  build: {
    target: "esnext",
  },
}));
