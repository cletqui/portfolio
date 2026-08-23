import { describe, it, expect } from "vitest";
import app from "../src/index";

const kvMock = () => {
  const store = new Map<string, string>([
    [
      "cybai{t3stFl4g}",
      JSON.stringify({ id: "test", name: "Test", points: 10 }),
    ],
  ]);
  return {
    CTF_FLAGS: {
      get: async (k: string) => store.get(k) ?? null,
    },
  } as unknown as Parameters<typeof app.request>[2];
};

describe("pages", () => {
  it("home renders with title, security + CTF headers", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-security-policy")).toContain("'nonce-");
    expect(res.headers.get("x-powered-by")).toBeNull();
    expect(res.headers.get("x-flag")).toBe("cybai{X-S3cr3t-H3ad3r}");
    expect(await res.text()).toContain("<title>cybai.re</title>");
  });

  it("home exposes the curl flag only to curl", async () => {
    const withCurl = await app.request("/", {
      headers: { "user-agent": "curl/8.7.1" },
    });
    expect(withCurl.headers.get("x-curl-flag")).toBe("cybai{T3rm1n4lPuR1st}");
    const withBrowser = await app.request("/", {
      headers: { "user-agent": "Mozilla/5.0" },
    });
    expect(withBrowser.headers.get("x-curl-flag")).toBeNull();
  });

  it.each([
    ["/about/me", "About me · cybai.re"],
    ["/projects", "Projects · cybai.re"],
    ["/projects/petithub", "PetitHub · cybai.re"],
    ["/contact", "Contact · cybai.re"],
    ["/ctf", "CTF Challenges · cybai.re"],
  ])("%s renders 200 with its own title", async (path, title) => {
    const res = await app.request(path);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain(`<title>${title}</title>`);
  });

  it("unknown routes 404", async () => {
    expect((await app.request("/nope")).status).toBe(404);
    expect((await app.request("/projects/nope")).status).toBe(404);
  });

  it("/about bare redirects to /about/me", async () => {
    const res = await app.request("/about");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/about/me");
  });

  it("apex host 301-redirects to www", async () => {
    const res = await app.request("http://cybai.re/projects");
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://www.cybai.re/projects");
  });
});

describe("i18n", () => {
  it("language suffix sets the lang cookie and redirects", async () => {
    const res = await app.request("/about/me/fr");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/about/me");
    expect(res.headers.get("set-cookie")).toContain("lang=fr");
  });

  it("Accept-Language is honoured", async () => {
    const res = await app.request("/about/me", {
      headers: { "accept-language": "fr-FR,fr;q=0.9" },
    });
    expect(await res.text()).toContain("<title>À propos · cybai.re</title>");
  });
});

describe("CTF easter eggs", () => {
  it("OPTIONS / advertises methods + flag", async () => {
    const res = await app.request("/", { method: "OPTIONS" });
    expect(res.status).toBe(204);
    expect(res.headers.get("allow")).toBe("GET, HEAD, OPTIONS");
    expect(res.headers.get("x-flag")).toBe("cybai{0pT10nSm4tt3r}");
  });

  it("/teapot is 418", async () => {
    const res = await app.request("/teapot");
    expect(res.status).toBe(418);
    expect(res.headers.get("x-flag")).toBe("cybai{1mAT34p0t}");
  });

  it("humans.txt carries its flag", async () => {
    const res = await app.request("/humans.txt");
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("cybai{H3ll0Hum4ns}");
  });
});

describe("/ctf/submit", () => {
  it("503s without the KV binding", async () => {
    const res = await app.request("/ctf/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flag: "cybai{whatever}" }),
    });
    expect(res.status).toBe(503);
  });

  it("rejects malformed bodies and non-flag input", async () => {
    for (const body of ["garbage", JSON.stringify({ flag: "not-a-flag" })]) {
      const res = await app.request(
        "/ctf/submit",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
        },
        kvMock(),
      );
      expect(await res.json()).toEqual({ valid: false });
    }
  });

  it("accepts a known flag", async () => {
    const res = await app.request(
      "/ctf/submit",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ flag: "cybai{t3stFl4g}" }),
      },
      kvMock(),
    );
    expect(await res.json()).toEqual({
      valid: true,
      id: "test",
      name: "Test",
      points: 10,
    });
  });

  it("rate-limits a burst from one IP", async () => {
    const hit = () =>
      app.request(
        "/ctf/submit",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "cf-connecting-ip": "203.0.113.99",
          },
          body: JSON.stringify({ flag: "cybai{nope}" }),
        },
        kvMock(),
      );
    const codes: number[] = [];
    for (let i = 0; i < 25; i++) codes.push((await hit()).status);
    expect(codes.filter((c) => c === 200)).toHaveLength(20);
    expect(codes.filter((c) => c === 429)).toHaveLength(5);
  });
});
