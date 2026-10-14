import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { FLAGS } from "../src/utils/flags.ts";

const BASE = (process.argv[2] ?? "http://localhost:8799").replace(/\/$/, "");
const LOCAL = /localhost|127\.0\.0\.1/.test(BASE);
const IP = LOCAL ? { "cf-connecting-ip": "81.2.69.142" } : {};

const get = (path, init = {}) =>
  fetch(BASE + path, { redirect: "manual", ...init, headers: { ...IP, ...init.headers } });
const text = async (path, init) => (await get(path, init)).text();
const header = async (path, name, init) => (await get(path, init)).headers.get(name) ?? "";
const b64 = (s) => Buffer.from(s, "base64");
const b64url = (b) => Buffer.from(b).toString("base64url");

const hmac = async (data) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode("letmein"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return b64url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
};

const checks = {
  source: async () => await text("/"),
  console: async () => await text("/ctf"),
  teapot: async () => await header("/teapot", "x-flag"),
  hacker: async () => (await text("/about/me")).includes("h@ck3rm@n69420") ? FLAGS.hacker : "",
  manifest: async () => {
    const manifest = await text("/.well-known/manifest.webmanifest");
    return manifest.includes("/fl@g.txt") ? await text("/fl@g.txt") : "";
  },
  "ctf-txt": async () => await text("/ctf.txt"),
  humans: async () => await text("/humans.txt"),
  readme: async () => readFileSync("README.md", "utf8"),
  "security-txt": async () => await text("/.well-known/security.txt"),
  private: async () => await text("/.well-known/private.txt"),
  options: async () => await header("/", "x-flag", { method: "OPTIONS" }),
  dns: async () => {
    try {
      return execFileSync("dig", ["+short", "TXT", "www.cybai.re"], { encoding: "utf8" });
    } catch {
      return "";
    }
  },
  french: async () =>
    await text("/about/you", { headers: { cookie: "lang=fr" } }),
  curl: async () => await header("/", "x-curl-flag", { headers: { "user-agent": "curl/8.7.1" } }),
  header: async () => await header("/", "x-flag"),
  konami: async () => await text("/static/site.js"),
  jsobj: async () => await text("/static/site.js"),
  cookie: async () => {
    const raw = await header("/ctf", "set-cookie");
    const token = /ctf_token=([^;]+)/.exec(raw)?.[1] ?? "";
    return b64(decodeURIComponent(token)).toString();
  },
  css: async () => await text("/styles.css"),
  sudo: async () => await text("/static/shell.js"),
  negotiation: async () => await text("/", { headers: { accept: "application/json" } }),
  "hidden-file": async () => await text("/static/shell.js"),
  env: async () => await text("/.env"),
  stego: async () => {
    const png = Buffer.from(await (await get("/static/avatar.png")).arrayBuffer());
    const tail = png.subarray(png.lastIndexOf(Buffer.from("IEND")) + 8).toString().trim();
    return b64(tail).toString();
  },
  crypto: async () => {
    const js = await text("/static/shell.js");
    const blob = /var CIPHER = "([^"]+)"/.exec(js)?.[1] ?? "";
    const rot13 = (s) => s.replace(/[a-z]/gi, (c) => String.fromCharCode(((c.charCodeAt(0) - (c < "a" ? 65 : 97) + 13) % 26) + (c < "a" ? 65 : 97)));
    return Buffer.from(rot13(b64(blob).toString()), "hex").toString();
  },
  gate: async () => {
    const res = await get("/ctf/gate", {
      headers: { "x-forwarded-for": "127.0.0.1", "user-agent": "Lynx/2.9", "accept-language": "tlh" },
    });
    return await res.text();
  },
  jwt: async () => {
    const body = `${b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }))}.${b64url(JSON.stringify({ role: "admin" }))}`;
    return await text("/ctf/admin", { headers: { authorization: `Bearer ${body}.${await hmac(body)}` } });
  },
  git: async () => {
    const { FAKE_GIT } = await import("../src/utils/fake-git.ts");
    let found = "";
    for (const key of Object.keys(FAKE_GIT).filter((k) => k.startsWith("objects/"))) {
      const res = await get(`/.git/${key}`);
      if (res.status !== 200) return "";
      try {
        found += inflateSync(Buffer.from(await res.arrayBuffer())).toString("latin1");
      } catch {}
    }
    return found;
  },
};

const submit = async (flag) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await get("/ctf/submit", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(LOCAL ? { "cf-connecting-ip": `198.51.100.${Math.floor(Math.random() * 250) + 1}` } : {}),
      },
      body: JSON.stringify({ flag }),
    });
    if (res.status === 429) {
      const wait = Number(res.headers.get("retry-after") ?? 60) + 1;
      console.log(`  rate limited, waiting ${wait}s`);
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    return (await res.json()).valid === true;
  }
  return false;
};

let bad = 0;
for (const [id, flag] of Object.entries(FLAGS)) {
  const check = checks[id];
  let found = false;
  let note = "";
  if (!check) note = "NO CHECK DEFINED";
  else {
    try {
      found = (await check()).includes(flag);
    } catch (e) {
      note = String(e.message ?? e);
    }
  }
  const accepted = await submit(flag);
  const ok = found && accepted;
  if (!ok) bad++;
  console.log(`${ok ? "✓" : "✗"} ${id.padEnd(13)} found=${found ? "yes" : "NO "} accepted=${accepted ? "yes" : "NO"} ${note}`);
}
const staticFiles = [
  "/.well-known/robots.txt",
  "/.well-known/keybase.txt",
  "/.well-known/atproto-did",
  "/.well-known/manifest.webmanifest",
  "/.well-known/openpgpkey/policy",
  "/pgp.asc",
  "/styles.css",
  "/static/avatar.png",
  "/static/favicon.ico",
];
for (const path of staticFiles) {
  const res = await get(path);
  const type = res.headers.get("content-type") ?? "";
  const ok = res.status === 200 && !type.includes("text/html");
  if (!ok) bad++;
  console.log(`${ok ? "✓" : "✗"} static ${path} ${res.status} ${type}`);
}

console.log(bad ? `\n${bad} item(s) need attention` : "\nall flags reachable and accepted, static files served");
process.exit(bad ? 1 : 0);
