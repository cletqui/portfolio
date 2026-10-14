import build from "@hono/vite-build/cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import adapter from "@hono/vite-dev-server/cloudflare";
import { defineConfig } from "vite";

import { assetVersions } from "./build/asset-versions";

export default defineConfig({
  define: {
    __ASSET_VERSIONS__: JSON.stringify(assetVersions()),
  },
  plugins: [
    build(),
    devServer({
      adapter,
      entry: "src/index.tsx",
    }),
  ],
  optimizeDeps: {
    include: ["hono"],
  },
});
