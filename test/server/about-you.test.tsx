import { describe, expect, it } from "vitest";
import { FLAGS } from "../../src/utils/flags";
import { guessConnection } from "../../src/utils/signals";
import { parseUserAgent } from "../../src/utils/ua";
import { FRANCE, get, withCf } from "../helpers/app";

const CHROME = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36";
const FIREFOX = "Mozilla/5.0 (X11; Linux x86_64; rv:150.0) Gecko/20100101 Firefox/150.0";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

const page = async (cf: Record<string, unknown> = FRANCE, headers: Record<string, string> = {}) => {
  const res = await withCf("/about/you", cf, { "user-agent": CHROME, ...headers });
  return { res, html: await res.text() };
};
const signals = (html: string) => JSON.parse(/<script type="application\/json" id="server-signals">(.*?)<\/script>/s.exec(html)![1]!.replace(/\\u003c/g, "<"));

describe("/about/you", () => {
  it("renders the snapshot tiles from Cloudflare's request data", async () => {
    const { res, html } = await page();
    expect(res.status).toBe(200);
    for (const text of ["Rennes, France", "Orange S.A.", "Chrome 150", "Linux", "Direct connection"]) expect(html).toContain(text);
    expect(html).toContain("48.11, -1.68");
  });
  it("parses the browser locally instead of calling an external API", async () => {
    const { html } = await page(FRANCE, { "user-agent": FIREFOX });
    expect(html).toContain("Firefox 150");
    expect(html).toContain("Gecko");
  });
  it("does not set any cookie, and clears the legacy one", async () => {
    const { res } = await page(FRANCE, { cookie: "you=stale" });
    const cookies = res.headers.get("set-cookie") ?? "";
    expect(cookies).not.toMatch(/you=[^;]*[^;]+;(?!.*Max-Age=0)/);
    expect(cookies).toMatch(/you=;/);
  });
  it("embeds server signals as safe JSON for the client scan", async () => {
    const { html } = await page(FRANCE, { "accept-language": "fr-FR,fr;q=0.8,en;q=0.5", cookie: "secret=1" });
    expect(html).toContain('id="scan"');
    expect(html).toMatch(/src="\/static\/scan\.js/);
    const s = signals(html);
    expect(s.ip).toBe("203.0.113.7");
    expect(s.ipTimezone).toBe("Europe/Paris");
    expect(s.net).toMatchObject({ colo: "CDG", asn: "3215", httpProtocol: "HTTP/2", tlsVersion: "TLSv1.3" });
    expect(s.languages).toEqual([{ tag: "fr-FR", q: 1 }, { tag: "fr", q: 0.8 }, { tag: "en", q: 0.5 }]);
  });
  it("lists the request headers but never the cookies", async () => {
    const { html } = await page(FRANCE, { cookie: "session=topsecret", authorization: "Bearer abc" });
    const s = signals(html);
    const names = s.headers.map(([n]: [string, string]) => n.toLowerCase());
    expect(names).toContain("user-agent");
    expect(names).not.toContain("cookie");
    expect(names).not.toContain("authorization");
    expect(html).not.toContain("topsecret");
  });
  it("flags VPN and hosting networks heuristically", async () => {
    const vpn = await page({ ...FRANCE, asOrganization: "M247 Europe SRL" });
    expect(vpn.html).toContain("VPN / proxy likely");
    const cloud = await page({ ...FRANCE, asOrganization: "Amazon.com, Inc." });
    expect(cloud.html).toContain("Hosting / cloud");
  });
  it("shows the French flag only to French-speaking visitors from France", async () => {
    expect((await page(FRANCE, { cookie: "lang=fr" })).html).toContain(FLAGS.french);
    expect((await page(FRANCE)).html).not.toContain(FLAGS.french);
    expect((await page({ ...FRANCE, country: "DE" }, { cookie: "lang=fr" })).html).not.toContain(FLAGS.french);
  });
  it("detects mobile devices from the user agent", async () => {
    const { html } = await page(FRANCE, { "user-agent": IPHONE });
    expect(html).toContain("mobile");
  });
  it("starts the narrative with who, where and what", async () => {
    const { html } = await page();
    for (const label of ["// who", "// where", "// how"]) expect(html).toContain(label);
    expect((await page(FRANCE, { cookie: "lang=fr" })).html).toContain("// comment");
  });
  it("shows the privacy notice, the AmIUnique link and an open headers list", async () => {
    const { html } = await page();
    expect(html).toContain("nothing stored or shared");
    expect(html).toMatch(/href="https:\/\/amiunique\.org\/fingerprint"[^>]*rel="noopener noreferrer"/);
    expect(html).toMatch(/<details[^>]*\bopen\b/);
  });
  it("loads the map only on request", async () => {
    const { html } = await page();
    expect(html).toContain("data-load-frame");
    expect(html).not.toContain("<iframe");
  });
  it("explains itself when no connection data is available", async () => {
    const res = await get("/about/you", { headers: { "user-agent": CHROME } });
    expect(res.status).toBe(200);
  });
});

describe("guessConnection", () => {
  it.each([
    ["Mullvad VPN AB", true, true],
    ["M247 Europe SRL", true, true],
    ["Amazon.com, Inc.", true, false],
    ["DigitalOcean, LLC", true, false],
    ["Hetzner Online GmbH", true, false],
    ["Orange S.A.", false, false],
    ["Bouygues Telecom SA", false, false],
    ["", false, false],
  ])("%s → hosting=%s proxy=%s", (org, hosting, proxy) => {
    expect(guessConnection(org)).toEqual({ hosting, proxy });
  });
});

describe("parseUserAgent", () => {
  it("extracts browser, engine, OS and architecture", () => {
    const ua = parseUserAgent(CHROME);
    expect(ua.browser).toMatchObject({ name: "Chrome", major: "150" });
    expect(ua.engine.name).toBe("Blink");
    expect(ua.os.name).toBe("Linux");
    expect(ua.cpu.architecture).toBe("amd64");
    expect(ua.device.type).toBeUndefined();
  });
  it("recognises mobile devices", () => {
    const ua = parseUserAgent(IPHONE);
    expect(ua.device.type).toBe("mobile");
    expect(ua.os.name).toBe("iOS");
  });
  it.each([
    ["Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/150.0 Mobile Safari/537.36 arm64", "arm64"],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/150.0", "amd64"],
    ["Mozilla/5.0 (Windows NT 6.1; WOW64) Chrome/50.0", "amd64"],
    ["Mozilla/5.0 (X11; Linux i686) Gecko/20100101 Firefox/50.0", "x86"],
    ["curl/8.7.1", undefined],
  ])("detects the architecture in %s", (ua, arch) => {
    expect(parseUserAgent(ua).cpu.architecture).toBe(arch);
  });
  it("survives an empty or odd string", () => {
    expect(() => parseUserAgent("")).not.toThrow();
    expect(parseUserAgent("curl/8.7.1").ua).toBe("curl/8.7.1");
  });
});
