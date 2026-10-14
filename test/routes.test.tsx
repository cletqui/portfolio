import { describe, it, expect } from "vitest";
import app from "../src/index";

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
  it("rejects malformed bodies and non-flag input", async () => {
    for (const body of ["garbage", JSON.stringify({ flag: "not-a-flag" })]) {
      const res = await app.request(
        "/ctf/submit",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
        },
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
        body: JSON.stringify({ flag: "cybai{1mAT34p0t}" }),
      },
    );
    expect(await res.json()).toEqual({
      valid: true,
      id: "teapot",
      name: "RFC 2324",
      points: 100,
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
      );
    const codes: number[] = [];
    for (let i = 0; i < 25; i++) codes.push((await hit()).status);
    expect(codes.filter((c) => c === 200)).toHaveLength(20);
    expect(codes.filter((c) => c === 429)).toHaveLength(5);
  });
});

describe("ctf challenges", () => {
  let n = 0;
  const post = (flag: string) =>
    app.request("/ctf/submit", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "cf-connecting-ip": `198.51.100.${++n}`,
      },
      body: JSON.stringify({ flag }),
    });

  it("validates every new flag", async () => {
    const { FLAGS } = await import("../src/utils/flags");
    for (const [id, flag] of Object.entries(FLAGS)) {
      const body = (await (await post(flag)).json()) as { id?: string };
      expect(body.id).toBe(id);
    }
  });

  it("gate walks through its three steps", async () => {
    const gate = (headers: Record<string, string>) =>
      app.request("/ctf/gate", { headers });
    expect((await gate({})).status).toBe(403);
    const lan = { "x-forwarded-for": "127.0.0.1" };
    expect((await gate(lan)).headers.get("x-gate-step")).toBe("2");
    const lynx = { ...lan, "user-agent": "Lynx/2.9" };
    expect((await gate(lynx)).headers.get("x-gate-step")).toBe("3");
    const res = await gate({ ...lynx, "accept-language": "tlh" });
    expect(await res.json()).toEqual({
      step: "done",
      flag: "cybai{7h3G4t3K33p3r}",
    });
  });

  it("jwt: guest token is refused, admin forged with the weak secret works", async () => {
    const who = (await (await app.request("/ctf/whoami")).json()) as {
      token: string;
    };
    const asGuest = await app.request("/ctf/admin", {
      headers: { authorization: `Bearer ${who.token}` },
    });
    expect(asGuest.status).toBe(403);
    const enc = new TextEncoder();
    const b64 = (data: string | ArrayBuffer) => {
      const bytes =
        typeof data === "string" ? enc.encode(data) : new Uint8Array(data);
      return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    };
    const body = `${b64(JSON.stringify({ alg: "HS256", typ: "JWT" }))}.${b64(JSON.stringify({ role: "admin" }))}`;
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode("letmein"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = b64(await crypto.subtle.sign("HMAC", key, enc.encode(body)));
    const forged = await app.request("/ctf/admin", {
      headers: { authorization: `Bearer ${body}.${sig}` },
    });
    expect((await forged.json()) as object).toMatchObject({
      flag: "cybai{F0rg3dTh3Cl41m5}",
    });
    const none = await app.request("/ctf/admin", {
      headers: {
        authorization: `Bearer ${b64(JSON.stringify({ alg: "none" }))}.${b64(JSON.stringify({ role: "admin" }))}.`,
      },
    });
    expect(none.status).toBe(401);
  });

  it("serves the .env leak, the JSON card and the terminal card", async () => {
    expect(await (await app.request("/.env")).text()).toContain(
      "cybai{N3v3rC0mm17Th3D0t3nv}",
    );
    const json = await app.request("/", {
      headers: { accept: "application/json" },
    });
    expect(((await json.json()) as { flag: string }).flag).toBe(
      "cybai{4cc3pt_M3_1f_Y0u_C4n}",
    );
    const card = await app.request("/", {
      headers: { "user-agent": "curl/8.7.1" },
    });
    expect(await card.text()).toContain("cybai.re");
  });

  it("exposes a fake git repository", async () => {
    const head = await app.request("/.git/HEAD");
    expect(await head.text()).toBe("ref: refs/heads/main\n");
    expect((await app.request("/.git/refs/heads/main")).status).toBe(200);
    expect((await app.request("/.git/hooks/pre-commit")).status).toBe(404);
  });

  it("/ctf drops a decodable cookie", async () => {
    const res = await app.request("/ctf");
    const cookie = res.headers.get("set-cookie") ?? "";
    const token = /ctf_token=([^;]+)/.exec(cookie)?.[1] ?? "";
    expect(atob(decodeURIComponent(token))).toBe("cybai{C00k13M0n5t3r}");
  });
});

describe("/about/you", () => {
  it("renders the deep-scan shell with server signals", async () => {
    const res = await app.request("/about/you", {
      headers: { "cf-connecting-ip": "81.2.69.142" },
    });
    const html = await res.text();
    if (html.includes('id="scan"')) {
      expect(html).toContain("server-signals");
      expect(html).toContain("/static/scan.js");
    }
  });
});

describe("security.txt", () => {
  it("is generated with a fresh Expires and the flag", async () => {
    const res = await app.request("/.well-known/security.txt");
    const body = await res.text();
    const expires = /^Expires: (.+)$/m.exec(body)?.[1] ?? "";
    expect(new Date(expires).getTime()).toBeGreaterThan(Date.now());
    expect(body).toContain("cybai{RFC9116W4sH3r3}");
    expect((await app.request("/security.txt")).status).toBe(301);
  });
});

describe("now", () => {
  it("/now renders", async () => {
    expect((await app.request("/now")).status).toBe(200);
  });
});
