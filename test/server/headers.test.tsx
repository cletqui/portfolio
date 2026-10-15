import { describe, expect, it } from "vitest";
import { FLAGS } from "../../src/utils/flags";
import { get, text } from "../helpers/app";

describe("security headers", () => {
  it("sends a nonce-based CSP that matches the inline scripts", async () => {
    const res = await get("/");
    const csp = res.headers.get("content-security-policy") ?? "";
    const nonce = /script-src 'nonce-([^']+)'/.exec(csp)?.[1];
    expect(nonce).toBeTruthy();
    const html = await res.text();
    for (const tag of html.match(/<script[^>]*nonce="[^"]*"/g) ?? []) expect(tag).toContain(`nonce="${nonce}"`);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });
  it("uses a different nonce for every response", async () => {
    const nonce = async () => /'nonce-([^']+)'/.exec((await get("/")).headers.get("content-security-policy") ?? "")?.[1];
    expect(await nonce()).not.toBe(await nonce());
  });
  it("sets the hardening headers and hides the framework", async () => {
    const res = await get("/");
    expect(res.headers.get("strict-transport-security")).toContain("max-age=63072000");
    expect(res.headers.get("x-frame-options")).toBe("DENY");
    expect(res.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(res.headers.get("permissions-policy")).toContain("camera=()");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("x-powered-by")).toBeNull();
  });
  it("redirects the apex domain to www over https", async () => {
    const res = await get("https://cybai.re/about/me");
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://www.cybai.re/about/me");
  });
});

describe("home content negotiation and header flags", () => {
  it("leaks the header flag on every HTML response", async () => {
    expect((await get("/", { headers: { "user-agent": "Mozilla/5.0" } })).headers.get("x-flag")).toBe(FLAGS.header);
  });
  it("gives curl its own flag, in the card body, and an ANSI card", async () => {
    const res = await get("/", { headers: { "user-agent": "curl/8.7.1" } });
    expect(res.headers.get("x-curl-flag")).toBeNull();
    const body = await res.text();
    expect(body).toContain(FLAGS.curl);
    expect(body).toContain("cybai.re");
    expect(body).toContain("\u001b[");
    expect(res.headers.get("content-type")).toContain("text/plain");
  });
  it("only gives the curl flag to curl", async () => {
    expect(await text("/", { headers: { "user-agent": "Mozilla/5.0" } })).not.toContain(FLAGS.curl);
    expect(await text("/", { headers: { "user-agent": "wget/1.21" } })).not.toContain(FLAGS.curl);
  });
  it.each(["wget/1.21", "HTTPie/3.2", "xh/0.22"])("serves the card to %s too", async (ua) => {
    expect(await text("/", { headers: { "user-agent": ua } })).toContain("\u001b[");
  });
  it("serves JSON to API clients, with the negotiation flag", async () => {
    const res = await get("/", { headers: { accept: "application/json" } });
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(((await res.json()) as { flag: string }).flag).toBe(FLAGS.negotiation);
  });
  it("serves the card for an explicit text/plain request but not for browsers", async () => {
    expect(await text("/", { headers: { accept: "text/plain" } })).toContain("\u001b[");
    expect(await text("/", { headers: { accept: "text/html,text/plain", "user-agent": "Mozilla/5.0" } })).toContain("<!DOCTYPE html>");
  });
  it("puts a flag on OPTIONS / and in the /teapot body", async () => {
    const options = await get("/", { method: "OPTIONS" });
    expect(options.status).toBe(204);
    expect(options.headers.get("allow")).toContain("OPTIONS");
    expect(options.headers.get("x-flag")).toBe(FLAGS.options);
    const teapot = await get("/teapot");
    expect(teapot.status).toBe(418);
    expect(teapot.headers.get("x-flag")).toBeNull();
    expect(await teapot.text()).toContain(FLAGS.teapot);
    expect((await get("/teapot", { method: "POST", redirect: "manual" })).status).toBe(302);
  });
});
