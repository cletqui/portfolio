import { inflateSync } from "node:zlib";
import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { CHALLENGES } from "../../src/data/challenges";
import { FAKE_GIT } from "../../src/utils/fake-git";
import { FLAGS } from "../../src/utils/flags";
import { get, nextIp, submit, text } from "../helpers/app";

describe("POST /ctf/submit", () => {
  it("accepts every flag and reports its challenge", async () => {
    for (const [id, flag] of Object.entries(FLAGS)) {
      const body = (await (await submit(flag)).json()) as { valid: boolean; id: string; name: string; points: number };
      const challenge = CHALLENGES.find((c) => c.id === id)!;
      expect(body, id).toEqual({ valid: true, id, name: challenge.name, points: challenge.points });
    }
  });
  it("trims whitespace around the flag", async () => {
    expect(((await (await submit(`  ${FLAGS.teapot}\n`)).json()) as { valid: boolean }).valid).toBe(true);
  });
  it("rejects malformed bodies and non-flag input", async () => {
    for (const body of ["garbage", "{}", JSON.stringify({ flag: "nope" }), JSON.stringify({ flag: "cybai{" + "x".repeat(200) + "}" }), JSON.stringify({ flag: 42 })]) {
      const res = await get("/ctf/submit", { method: "POST", headers: { "content-type": "application/json", "cf-connecting-ip": nextIp() }, body });
      expect(await res.json(), body).toEqual({ valid: false });
    }
  });
  it("rejects well-formed flags that do not exist", async () => {
    expect(await (await submit("cybai{definitely-not-a-flag}")).json()).toEqual({ valid: false });
  });
  it("is case sensitive", async () => {
    expect(await (await submit(FLAGS.teapot.toUpperCase())).json()).toEqual({ valid: false });
  });
  it("rate-limits a burst from one IP, not from others", async () => {
    const ip = "203.0.113.200";
    const codes: number[] = [];
    for (let i = 0; i < 25; i++) codes.push((await submit("cybai{nope}", ip)).status);
    expect(codes.filter((c) => c === 200)).toHaveLength(20);
    const blocked = await submit("cybai{nope}", ip);
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBeTruthy();
    expect((await submit("cybai{nope}", "203.0.113.201")).status).toBe(200);
  });
});

describe("the gate", () => {
  const gate = (headers: Record<string, string>) => get("/ctf/gate", { headers });
  const inside = { "x-forwarded-for": "127.0.0.1" };
  const lynx = { ...inside, "user-agent": "Lynx/2.9.0" };

  it("walks through its three steps", async () => {
    expect((await gate({})).status).toBe(403);
    expect((await gate(inside)).headers.get("x-gate-step")).toBe("2");
    expect((await gate(lynx)).headers.get("x-gate-step")).toBe("3");
    expect(await (await gate({ ...lynx, "accept-language": "tlh" })).json()).toEqual({ step: "done", flag: FLAGS.gate });
  });
  it("only trusts the first forwarded address, in any loopback spelling", async () => {
    for (const ip of ["127.0.0.1", "::1", "localhost", "127.0.0.1, 8.8.8.8"]) expect((await gate({ "x-forwarded-for": ip })).headers.get("x-gate-step"), ip).toBe("2");
    expect((await gate({ "x-forwarded-for": "8.8.8.8, 127.0.0.1" })).headers.get("x-gate-step")).toBe("1");
  });
  it("matches Lynx case-insensitively and Klingon by prefix", async () => {
    const ok = await gate({ ...inside, "user-agent": "xLYNXx", "accept-language": "tlh-Latn, en;q=0.5" });
    expect(((await ok.json()) as { flag?: string }).flag).toBe(FLAGS.gate);
    expect((await gate({ ...lynx, "accept-language": "xtlh" })).headers.get("x-gate-step")).toBe("3");
  });
});

describe("the JWT challenge", () => {
  const token = async () => ((await (await get("/ctf/whoami")).json()) as { token: string }).token;
  const forge = (claims: object, secret = "letmein", header: object = { alg: "HS256", typ: "JWT" }) => {
    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const body = `${b64(header)}.${b64(claims)}`;
    return `${body}.${createHmac("sha256", secret).update(body).digest("base64url")}`;
  };
  const admin = (t: string) => get("/ctf/admin", { headers: { authorization: `Bearer ${t}` } });

  it("hands out a guest token that is refused by /admin", async () => {
    const res = await admin(await token());
    expect(res.status).toBe(403);
    expect(((await res.json()) as { role: string }).role).toBe("guest");
  });
  it("accepts a forged admin token signed with the weak secret", async () => {
    const res = await admin(forge({ role: "admin" }));
    expect(((await res.json()) as { flag: string }).flag).toBe(FLAGS.jwt);
  });
  it("rejects wrong secrets, alg none, tampered payloads and junk", async () => {
    expect((await admin(forge({ role: "admin" }, "hunter2"))).status).toBe(401);
    expect((await admin(`${Buffer.from('{"alg":"none"}').toString("base64url")}.${Buffer.from('{"role":"admin"}').toString("base64url")}.`)).status).toBe(401);
    const good = await token();
    const [h, , s] = good.split(".");
    expect((await admin(`${h}.${Buffer.from('{"role":"admin"}').toString("base64url")}.${s}`)).status).toBe(401);
    expect((await admin("not-a-token")).status).toBe(401);
    expect((await get("/ctf/admin")).status).toBe(401);
    expect((await admin(forge({ role: "admin" }, "letmein", { alg: "HS512" }))).status).toBe(401);
  });
  it("hints where to go next", async () => {
    expect(((await (await get("/ctf/whoami")).json()) as { hint: string }).hint).toContain("/ctf/admin");
  });
});

describe("the CTF page", () => {
  it("drops a decodable cookie and lists every challenge", async () => {
    const res = await get("/ctf");
    const raw = /ctf_token=([^;]+)/.exec(res.headers.get("set-cookie") ?? "")?.[1] ?? "";
    expect(atob(decodeURIComponent(raw))).toBe(FLAGS.cookie);
    const html = await res.text();
    expect((html.match(/data-challenge="/g) ?? []).length).toBe(CHALLENGES.length);
    expect(html).toContain(`data-total="${CHALLENGES.length}"`);
    expect(html).toContain('id="ctf-filter-count"');
    expect(html).toMatch(/src="\/static\/ctf\.js/);
  });
  it("keeps the console flag inline for the console challenge", async () => {
    expect(await text("/ctf")).toContain(FLAGS.console);
  });
  it("renders French labels", async () => {
    const html = await text("/ctf", { headers: { cookie: "lang=fr" } });
    expect(html).toContain("Défis CTF");
    expect(html).toContain("Cocorico");
  });
});

describe("the fake git repository", () => {
  it("serves loose objects and refs but nothing else", async () => {
    expect(await text("/.git/HEAD")).toBe("ref: refs/heads/main\n");
    expect((await get("/.git/refs/heads/main")).status).toBe(200);
    expect((await get("/.git/hooks/pre-commit")).status).toBe(404);
    expect((await get("/.git/")).status).toBe(404);
    const object = Object.keys(FAKE_GIT).find((k) => k.startsWith("objects/"))!;
    const res = await get(`/.git/${object}`);
    expect(res.headers.get("content-type")).toBe("application/octet-stream");
  });
  it("hides the flag in an old commit only", () => {
    const objects = Object.entries(FAKE_GIT).filter(([k]) => k.startsWith("objects/"));
    const hits = objects.filter(([, b64]) => inflateSync(Buffer.from(b64, "base64")).toString("latin1").includes(FLAGS.git));
    expect(hits).toHaveLength(1);
    const head = Buffer.from(FAKE_GIT["refs/heads/main"]!, "base64").toString().trim();
    const commit = inflateSync(Buffer.from(FAKE_GIT[`objects/${head.slice(0, 2)}/${head.slice(2)}`]!, "base64")).toString("latin1");
    expect(commit).toContain("remove hardcoded secrets");
    expect(commit).toContain("parent ");
  });
  it("keeps the real repository out of reach", async () => {
    for (const path of ["/.git/config", "/.git/logs/HEAD"]) expect([200, 404]).toContain((await get(path)).status);
    expect(await text("/.git/config")).not.toContain("cletqui");
  });
});
