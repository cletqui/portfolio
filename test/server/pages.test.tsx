import { describe, expect, it } from "vitest";
import { get, text } from "../helpers/app";

describe("pages", () => {
  it.each([
    ["/", "<title>cybai.re</title>"],
    ["/about/me", "<title>About me · cybai.re</title>"],
    ["/projects", "<title>Projects · cybai.re</title>"],
    ["/projects/petithub", "<title>PetitHub · cybai.re</title>"],
    ["/projects/ticdot", "<title>Ticdot · cybai.re</title>"],
    ["/projects/epochalypse", "<title>Epochalypse · cybai.re</title>"],
    ["/contact", "<title>Contact · cybai.re</title>"],
    ["/ctf", "<title>CTF Challenges · cybai.re</title>"],
    ["/now", "<title>Now · cybai.re</title>"],
  ])("%s renders 200 with its own title", async (path, title) => {
    const res = await get(path, { headers: { "user-agent": "Mozilla/5.0" } });
    expect(res.status).toBe(200);
    expect(await res.text()).toContain(title);
  });

  it("answers unknown routes with a rendered 404", async () => {
    for (const path of ["/nope", "/projects/nope", "/ctf/nope", "/about/nothing"]) {
      const res = await get(path);
      expect(res.status, path).toBe(404);
      expect(await res.text()).toContain("<title>404 · cybai.re</title>");
    }
  });

  it("redirects /about to /about/me", async () => {
    const res = await get("/about");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/about/me");
  });

  it("renders French when asked by cookie or path suffix", async () => {
    expect(await text("/about/me", { headers: { cookie: "lang=fr" } })).toContain("À propos");
    const res = await get("/contact/fr");
    expect(res.status).toBe(302);
    expect(res.headers.get("set-cookie")).toContain("lang=fr");
  });

  it("falls back to Accept-Language", async () => {
    const html = await text("/now", { headers: { "accept-language": "fr-FR,fr;q=0.9" } });
    expect(html).toContain("En ce moment");
  });

  it("every page loads the shared site bundle and the stylesheet", async () => {
    const html = await text("/now");
    expect(html).toMatch(/src="\/static\/site\.js(\?v=[0-9a-f]{8})?"/);
    expect(html).toMatch(/href="\/styles\.css(\?v=[0-9a-f]{8})?"/);
  });

  it("emits per-page OG images and a large twitter card", async () => {
    const html = await text("/about/you");
    expect(html).toContain('property="og:image" content="http://localhost/static/og/about-you.png"');
    expect(html).toContain('content="summary_large_image"');
    expect(await text("/projects/api")).toContain("/static/og/home.png");
  });
});

describe("home page", () => {
  const browser = { headers: { "user-agent": "Mozilla/5.0", accept: "text/html" } };

  it("has the terminal, its window controls and the data payload", async () => {
    const html = await text("/", browser);
    for (const id of ["shell", "shell-screen", "shell-input", "shell-close", "shell-minimize", "shell-maximize", "shell-data"]) expect(html).toContain(`id="${id}"`);
    expect(html).toMatch(/src="\/static\/shell\.js/);
  });

  it("embeds challenge data without ever embedding flag values", async () => {
    const html = await text("/", browser);
    const data = JSON.parse(/<script type="application\/json" id="shell-data">(.*?)<\/script>/s.exec(html)![1]!.replace(/\\u003c/g, "<"));
    expect(data.ctf.length).toBeGreaterThan(30);
    expect(JSON.stringify(data)).not.toContain("cybai{");
  });

  it("escapes < in the embedded JSON", async () => {
    const payload = /id="shell-data">(.*?)<\/script>/s.exec(await text("/", browser))![1]!;
    expect(payload).not.toContain("<");
  });

  it("does not show the site name as a heading", async () => {
    const html = await text("/", browser);
    expect(html).toMatch(/<h1[^>]*>Cybersecurity engineer and full-stack developer<\/h1>/);
  });
});

describe("routing hygiene (Hono middlewares)", () => {
  it("redirects trailing slashes to the canonical path", async () => {
    const res = await get("/projects/", { redirect: "manual" });
    expect(res.status).toBe(301);
    expect(new URL(res.headers.get("location") ?? "", "http://localhost").pathname).toBe("/projects");
  });
  it("answers 405 with an Allow header for a known path and the wrong method", async () => {
    const res = await get("/ctf/submit", { method: "GET" });
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toContain("POST");
    expect((await get("/about/me", { method: "DELETE" })).status).toBe(405);
  });
  it("still 404s on unknown paths", async () => {
    expect((await get("/definitely/not/here", { method: "POST" })).status).toBe(404);
  });
  it("pretty-prints JSON on request", async () => {
    const body = await text("/?pretty", { headers: { accept: "application/json" } });
    expect(body).toContain('\n  "name"');
  });
  it("rejects oversized flag submissions", async () => {
    const res = await get("/ctf/submit", {
      method: "POST",
      headers: { "content-type": "application/json", "content-length": "5000", "cf-connecting-ip": "203.0.113.200" },
      body: JSON.stringify({ flag: "x".repeat(5000) }),
    });
    expect(res.status).toBe(413);
  });
});
