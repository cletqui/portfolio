import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SOURCE = "https://keybase.io/clet/pgp_keys.asc";
const EMAIL = "admin@cybai.re";
const [local] = EMAIL.split("@");

const armored = await (await fetch(SOURCE)).text();
if (!armored.includes("BEGIN PGP PUBLIC KEY BLOCK")) throw new Error("no key at " + SOURCE);

const home = mkdtempSync(join(tmpdir(), "gnupg-"));
const gpg = (args, input) =>
  execFileSync("gpg", ["--homedir", home, "--batch", ...args], { input });

gpg(["--import"], armored);
const colons = gpg(["--with-colons", "--fingerprint", "--list-keys", EMAIL]).toString();
const fingerprint = /^fpr:+([0-9A-F]{40}):/m.exec(colons)?.[1];
if (!fingerprint) throw new Error("fingerprint not found for " + EMAIL);
const keyId = fingerprint.slice(-16);
const binary = gpg(["--export", fingerprint]);

const ZBASE32 = "ybndrfg8ejkmcpqxot1uwisza345h769";
const zbase32 = (buf) => {
  let bits = "";
  for (const byte of buf) bits += byte.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i < bits.length; i += 5) out += ZBASE32[parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];
  return out;
};
const hash = zbase32(createHash("sha1").update(local.toLowerCase()).digest());

mkdirSync("public/.well-known/openpgpkey/hu", { recursive: true });
writeFileSync("public/pgp.asc", armored);
writeFileSync(`public/.well-known/openpgpkey/hu/${hash}`, binary);
writeFileSync("public/.well-known/openpgpkey/policy", "");
writeFileSync(
  "src/utils/pgp.ts",
  `export const PGP = {\n  email: ${JSON.stringify(EMAIL)},\n  fingerprint: ${JSON.stringify(fingerprint)},\n  keyId: ${JSON.stringify(keyId)},\n  keybase: ${JSON.stringify(SOURCE)},\n};\n`,
);
console.log(`pgp: ${fingerprint}\nwkd: /.well-known/openpgpkey/hu/${hash}`);
