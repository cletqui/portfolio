import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { decodeEmail, EMAIL_ENC, emailAddress, encodeEmail } from "../../src/data/email";
import { get, text } from "../helpers/app";

const ADDRESS = emailAddress();
const ROUTES = [
  "/", "/about/me", "/about/you", "/contact", "/projects", "/projects/petithub", "/ctf", "/now", "/login", "/nope",
  "/humans.txt", "/.well-known/security.txt", "/.well-known/robots.txt", "/ctf.txt", "/.env", "/teapot", "/contact/fr", "/fr",
];
const AGENTS = ["Mozilla/5.0 Chrome/150", "curl/8.7.1", "python-requests/2.32", "Scrapy/2.11"];

const LEAK = new RegExp(`${ADDRESS.replace(/[.]/g, "\\.")}|mailto:|admin\\s*@\\s*cybai`, "i");
const ADDRESS_ONLY = new RegExp(`${ADDRESS.replace(/[.]/g, "\\.")}|admin\\s*@\\s*cybai|"admin"\\s*,\\s*"cybai\\.re"`, "i");

describe("email harvesting", () => {
  it("round-trips the obfuscation and never stores the address in clear", () => {
    expect(decodeEmail(EMAIL_ENC)).toBe(ADDRESS);
    expect(encodeEmail("a@b.c")).not.toContain("a@b.c");
    expect(EMAIL_ENC).not.toContain("@");
  });
  it.each(AGENTS)("keeps the address out of every page for %s", async (ua) => {
    for (const route of ROUTES) {
      const res = await get(route, { headers: { "user-agent": ua } });
      expect(await res.text(), `${route} as ${ua}`).not.toMatch(LEAK);
    }
  });
  it("keeps the address out of the JSON card and the curl card", async () => {
    expect(await text("/", { headers: { accept: "application/json" } })).not.toMatch(LEAK);
    expect(await text("/", { headers: { "user-agent": "curl/8.7.1" } })).not.toMatch(LEAK);
  });
  it("ships it only as an encoded attribute on the contact page", async () => {
    const html = await text("/contact");
    expect(html).toContain(`data-email="${EMAIL_ENC}"`);
    expect(html).toContain(`data-copy-email="${EMAIL_ENC}"`);
    expect(html).toContain("admin [at] cybai [dot] re");
  });
  it("keeps the address out of the embedded shell and palette data", async () => {
    const html = await text("/");
    expect(html).not.toMatch(LEAK);
    expect(html).toContain(EMAIL_ENC);
  });
  it("keeps it out of the built client bundles", () => {
    const dir = "public/static";
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".js"))) {
      expect(readFileSync(join(dir, file), "utf8"), file).not.toMatch(ADDRESS_ONLY);
    }
  });
});
