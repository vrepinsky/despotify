import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  envDir: "../..",
  plugins: [react()],
  server: {
    port: Number(process.env.WEB_PORT ?? 3000),
  },
});
