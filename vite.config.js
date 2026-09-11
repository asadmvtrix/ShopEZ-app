import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // So phones on the same Wi‑Fi can open the Network URL Vite prints.
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
  build: {
    rollupOptions: {
      output: {
        // MUI and React change far less often than the store code, so keeping them
        // in their own chunks lets returning visitors reuse the cached copies.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@mui") || id.includes("@emotion")) return "mui";
          if (/node_modules[/\\](react|react-dom|scheduler|react-router)/.test(id)) {
            return "react";
          }
          return undefined;
        },
      },
    },
  },
});
