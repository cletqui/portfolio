import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { ADMIN_PASSWORD, ADMIN_USER, HTPASSWD } from "../../src/data/admin";
import { FLAGS } from "../../src/utils/flags";
import { get, text } from "../helpers/app";

const basic = (user: string, pass: string) => ({
  headers: { authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}` },
});

describe("/admin", () => {
  it("challenges unauthenticated visitors with a basic-auth realm", async () => {
    const res = await get("/admin");
    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toMatch(/^Basic realm="/);
    expect(await res.text()).not.toContain("cybai{");
  });
  it("rejects wrong and common credentials", async () => {
    for (const [u, p] of [["admin", "admin"], ["admin", "password"], ["root", ADMIN_PASSWORD], [ADMIN_USER, "hunter2"]]) {
      const res = await get("/admin", basic(u!, p!));
      expect(res.status, `${u}:${p}`).toBe(401);
    }
  });
  it("shows the flag to the right credentials, uncached", async () => {
    const res = await get("/admin", basic(ADMIN_USER, ADMIN_PASSWORD));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.text()).toContain(FLAGS.admin);
  });
  it("protects everything below /admin", async () => {
    expect((await get("/admin/users")).status).toBe(401);
  });
});

describe("the credentials trail", () => {
  it("leaks a crackable .htpasswd that matches the admin password", async () => {
    const body = await text("/.htpasswd");
    expect(body).toBe(HTPASSWD);
    const [user, hash] = body.trim().split(":");
    expect(user).toBe(ADMIN_USER);
    expect(hash).toBe(`{SHA}${createHash("sha1").update(ADMIN_PASSWORD).digest("base64")}`);
  });
  it("never serves the plain password", async () => {
    expect(await text("/.htpasswd")).not.toContain(ADMIN_PASSWORD);
    expect(await text("/.env")).not.toContain(ADMIN_PASSWORD);
  });
});

describe("/login", () => {
  it("renders a decorative form", async () => {
    const res = await get("/login");
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('action="/login"');
    expect(html).toContain('type="password"');
  });
  it("always refuses, and has a joke for injections", async () => {
    const post = (u: string, p: string) =>
      get("/login", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ username: u, password: p }) });
    const wrong = await post(ADMIN_USER, ADMIN_PASSWORD);
    expect(wrong.status).toBe(401);
    expect(await wrong.text()).not.toContain(FLAGS.admin);
    const sqli = await post("admin' OR '1'='1", "x");
    expect(sqli.status).toBe(401);
    expect(await sqli.text()).toContain("injection");
  });
  it("sends WordPress probes to the form", async () => {
    for (const path of ["/wp-login.php", "/wp-admin"]) {
      const res = await get(path, { redirect: "manual" });
      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toBe("/login");
    }
  });
});
