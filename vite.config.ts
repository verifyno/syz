import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isVercel = !!process.env.VERCEL;
const vercelOutput = {
  dir: ".vercel/output",
  serverDir: ".vercel/output/functions/__server.func",
  publicDir: ".vercel/output/static",
};

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: isVercel ? { preset: "vercel", output: vercelOutput } : true,
});
