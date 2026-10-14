import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const FILES = ["/styles.css", "/static/site.js", "/static/scan.js", "/static/shell.js"];

export const assetVersions = (root = process.cwd()) =>
  Object.fromEntries(
    FILES.map((file) => {
      const path = `${root}/public${file}`;
      const hash = existsSync(path)
        ? createHash("sha1").update(readFileSync(path)).digest("hex").slice(0, 8)
        : "";
      return [file, hash];
    }),
  );
