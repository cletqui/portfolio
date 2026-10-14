import { build } from "vite";

const ENTRIES = {
  site: "src/client/site/index.ts",
  scan: "src/client/scan/index.ts",
  ctf: "src/client/ctf/index.ts",
  shell: "src/client/shell/index.ts",
  "shell-games": "src/client/shell/games/index.ts",
};

const only = process.argv.slice(2);
for (const [name, entry] of Object.entries(ENTRIES)) {
  if (only.length && !only.includes(name)) continue;
  await build({
    configFile: false,
    logLevel: "warn",
    publicDir: false,
    build: {
      lib: {
        entry,
        formats: ["iife"],
        name: `cybai_${name.replace(/-/g, "_")}`,
        fileName: () => `${name}.js`,
      },
      outDir: "public/static",
      emptyOutDir: false,
      target: "es2020",
      minify: true,
      sourcemap: false,
    },
  });
  console.log(`client: ${name}`);
}
