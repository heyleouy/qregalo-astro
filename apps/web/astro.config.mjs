import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// Solo importar adapter si estamos en Vercel o haciendo build para producción
let adapter = undefined;
if (process.env.VERCEL || process.env.CI) {
  // Dynamic import solo cuando sea necesario
  const vercelModule = await import("@astrojs/vercel/serverless");
  adapter = vercelModule.default({
    runtime: "nodejs20.x",
  });
}

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  output: "server",
  adapter: adapter,
  server: {
    port: 4321,
  },
});
