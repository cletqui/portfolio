import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

const FLAG = "cybai{G1t_N3v3r_F0rg3ts}";
const root = mkdtempSync(join(tmpdir(), "fake-git-"));
const template = mkdtempSync(join(tmpdir(), "empty-template-"));
const env = {
  ...process.env,
  GIT_AUTHOR_NAME: "dev",
  GIT_AUTHOR_EMAIL: "dev@cybai.re",
  GIT_COMMITTER_NAME: "dev",
  GIT_COMMITTER_EMAIL: "dev@cybai.re",
};
const git = (args, extra = {}) =>
  execFileSync("git", args, { cwd: root, env: { ...env, ...extra } });

git(["init", "-q", "-b", "main", `--template=${template}`]);

writeFileSync(
  join(root, "README.md"),
  "# internal-dashboard\n\nPrototype of the admin dashboard. Not for production.\n",
);
writeFileSync(
  join(root, "server.js"),
  'const config = require("./config");\n\nconsole.log("dashboard listening", config.port);\n',
);
writeFileSync(
  join(root, "config.js"),
  `module.exports = {\n  port: 8080,\n  dbPassword: "hunter2",\n  apiToken: "${FLAG}",\n};\n`,
);
git(["add", "."]);
git(["commit", "-q", "-m", "initial prototype"], {
  GIT_AUTHOR_DATE: "2025-03-02T10:00:00+0000",
  GIT_COMMITTER_DATE: "2025-03-02T10:00:00+0000",
});

writeFileSync(
  join(root, "config.js"),
  "module.exports = {\n  port: 8080,\n  dbPassword: process.env.DB_PASSWORD,\n  apiToken: process.env.API_TOKEN,\n};\n",
);
git(["add", "."]);
git(["commit", "-q", "-m", "remove hardcoded secrets"], {
  GIT_AUTHOR_DATE: "2025-03-02T10:42:00+0000",
  GIT_COMMITTER_DATE: "2025-03-02T10:42:00+0000",
});

const gitDir = join(root, ".git");
const files = {};
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else files[relative(gitDir, full)] = readFileSync(full).toString("base64");
  }
};
walk(gitDir);

const body = Object.keys(files)
  .sort()
  .map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(files[k])},`)
  .join("\n");
writeFileSync(
  "src/utils/fake-git.ts",
  `export const FAKE_GIT: Record<string, string> = {\n${body}\n};\n`,
);
console.log(`fake-git: ${Object.keys(files).length} files`);
