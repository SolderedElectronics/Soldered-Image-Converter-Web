import { defineConfig, loadEnv } from "vite";
import { version } from "./package.json";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: env.VITE_BASE ?? "/",
    plugins: [react()],
    define: {
      __APP_VERSION__: JSON.stringify(version),
      __GIT_HASH__: JSON.stringify(process.env.VITE_GIT_HASH || ""),
    },
  };
});
