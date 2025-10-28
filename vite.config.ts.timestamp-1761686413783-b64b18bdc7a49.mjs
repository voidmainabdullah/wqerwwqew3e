// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      usePolling: true
      // safer for some file systems
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
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
      "@tabler/icons-react"
    ]
  },
  // ensure older esbuild behaves predictably
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
    supported: {
      "top-level-await": true
    }
  },
  // keep build target modern, avoid transpilation issues
  build: {
    target: "esnext"
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gICAgd2F0Y2g6IHtcbiAgICAgIHVzZVBvbGxpbmc6IHRydWUsIC8vIHNhZmVyIGZvciBzb21lIGZpbGUgc3lzdGVtc1xuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKSxcbiAgXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcblxuICAvLyBcdUQ4M0VcdURERTkgLS0tIEZJWCBTRUNUSU9OIC0tLVxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICAvLyBwcmV2ZW50IGJyb2tlbiBkZXBzIGZyb20gYmVpbmcgcHJlLWJ1bmRsZWQgYnkgZXNidWlsZFxuICAgIGV4Y2x1ZGU6IFtcbiAgICAgIFwibHVjaWRlLXJlYWN0XCIsXG4gICAgICBcImQzXCIsXG4gICAgICBcImQzLWNvbG9yXCIsXG4gICAgICBcInJlY2hhcnRzXCIsXG4gICAgICBcInJlYWN0LXRyYW5zaXRpb24tZ3JvdXBcIixcbiAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LWRpYWxvZ1wiLFxuICAgICAgXCJkZWNpbWFsLmpzLWxpZ2h0XCIsXG4gICAgICBcIkB0YWJsZXIvaWNvbnMtcmVhY3RcIixcbiAgICBdLFxuICB9LFxuXG4gIC8vIGVuc3VyZSBvbGRlciBlc2J1aWxkIGJlaGF2ZXMgcHJlZGljdGFibHlcbiAgZXNidWlsZDoge1xuICAgIGxvZ092ZXJyaWRlOiB7IFwidGhpcy1pcy11bmRlZmluZWQtaW4tZXNtXCI6IFwic2lsZW50XCIgfSxcbiAgICBzdXBwb3J0ZWQ6IHtcbiAgICAgIFwidG9wLWxldmVsLWF3YWl0XCI6IHRydWUsXG4gICAgfSxcbiAgfSxcblxuICAvLyBrZWVwIGJ1aWxkIHRhcmdldCBtb2Rlcm4sIGF2b2lkIHRyYW5zcGlsYXRpb24gaXNzdWVzXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiBcImVzbmV4dFwiLFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsWUFBWTtBQUFBO0FBQUEsSUFDZDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQWlCLGdCQUFnQjtBQUFBLEVBQzVDLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxjQUFjO0FBQUE7QUFBQSxJQUVaLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLFNBQVM7QUFBQSxJQUNQLGFBQWEsRUFBRSw0QkFBNEIsU0FBUztBQUFBLElBQ3BELFdBQVc7QUFBQSxNQUNULG1CQUFtQjtBQUFBLElBQ3JCO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsRUFDVjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
