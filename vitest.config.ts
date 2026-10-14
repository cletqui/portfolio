import { defineConfig } from "vitest/config";

import { assetVersions } from "./build/asset-versions";

export default defineConfig({
  define: {
    __ASSET_VERSIONS__: JSON.stringify(assetVersions()),
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
  },
});
