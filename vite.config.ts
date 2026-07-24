/// <reference types="vitest" />
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Component tests are .tsx and need a DOM; pure-logic tests stay in node.
    environmentMatchGlobs: [["**/*.test.tsx", "jsdom"]],
  },
});
