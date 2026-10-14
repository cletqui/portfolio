import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGP } from "../../src/utils/pgp";
import { FLAGS } from "../../src/utils/flags";
import { get, text } from "../helpers/app";

describe("security.txt", () => {
  it("is generated per request with a rolling Expires and the flag", async () => {
    const body = await text("/.well-known/security.txt");
    const expires = /^Expires: (.+)$/m.exec(body)?.[1] ?? "";
    const days = (new Date(expires).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(290);
    expect(days).toBeLessThan(310);
    expect(body).toContain(FLAGS["security-txt"]);
  });
  it("follows RFC 9116: Contact, Expires, canonical and the self-hosted key", async () => {
    const body = await text("/.well-known/security.txt");
    expect(body).toMatch(/^Contact: http:\/\/localhost\/contact$/m);
    expect(body).toMatch(/^Contact: mailto:admin@cybai\.re$/m);
    expect(body).toMatch(/^Encryption: http:\/\/localhost\/pgp\.asc$/m);
    expect(body).toMatch(/^Canonical: http:\/\/localhost\/\.well-known\/security\.txt$/m);
    expect(body).toMatch(/^Preferred-Languages: en, fr$/m);
  });
  it("has a short alias", async () => {
    const res = await get("/security.txt");
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("/.well-known/security.txt");
  });
});

describe("plain files and redirects", () => {
  it("humans.txt carries the contact, PGP fingerprint and its flag", async () => {
    const body = await text("/humans.txt");
    expect(body).toContain("Email: admin@cybai.re");
    expect(body).toContain(`PGP: ${PGP.fingerprint}`);
    expect(body).toContain(FLAGS.humans);
    expect(body).toContain(`Last update: ${new Date().getFullYear()}`);
    expect(body).not.toMatch(/Antoine|cletqui/);
  });
  it("serves the two text-file flags", async () => {
    expect(await text("/fl@g.txt")).toBe(FLAGS.manifest);
    expect(await text("/ctf.txt")).toBe(FLAGS["ctf-txt"]);
  });
  it("redirects the legacy locations", async () => {
    for (const [from, to] of [["/robots.txt", "/.well-known/robots.txt"], ["/keybase.txt", "/.well-known/keybase.txt"]] as const) {
      const res = await get(from);
      expect(res.status).toBe(301);
      expect(res.headers.get("location")).toBe(to);
    }
    expect((await get("/.well-known")).headers.get("location")).toContain("rfc8615");
    expect((await get("/rickroll")).headers.get("location")).toContain("youtube.com");
  });
  it("leaks a fake .env containing the flag", async () => {
    const body = await text("/.env");
    expect(body).toContain(`CTF_FLAG=${FLAGS.env}`);
    expect(body).toContain("hunter2");
  });
});

describe("static routing configuration", () => {
  const exclude = (JSON.parse(readFileSync("public/_routes.json", "utf8")) as { exclude: string[] }).exclude;
  const covered = (path: string) => exclude.some((rule) => (rule.endsWith("/*") ? path.startsWith(rule.slice(0, -1)) : path === rule));
  const walk = (dir: string, base = ""): string[] =>
    readdirSync(dir).flatMap((name) => {
      const full = join(dir, name);
      const path = `${base}/${name}`;
      return statSync(full).isDirectory() ? walk(full, path) : [path];
    });
  const files = walk("public").filter((f) => f !== "/_routes.json");

  it("excludes every static file from the worker, except the ones the worker must serve", () => {
    const uncovered = files.filter((f) => !covered(f));
    expect(uncovered).toEqual([]);
  });
  it("keeps /.well-known/security.txt on the worker", () => {
    expect(covered("/.well-known/security.txt")).toBe(false);
    expect(files).not.toContain("/.well-known/security.txt");
  });
  it("lists only paths that exist", () => {
    for (const rule of exclude.filter((r) => !r.endsWith("/*"))) expect(files, rule).toContain(rule);
  });
  it("ships the headers file rules for the key and WKD", () => {
    const headers = readFileSync("public/_headers", "utf8");
    expect(headers).toContain("/pgp.asc");
    expect(headers).toContain("/.well-known/openpgpkey/*");
    expect(headers).toContain("Access-Control-Allow-Origin: *");
  });
});
