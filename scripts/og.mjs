import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";

const avatar = `data:image/png;base64,${readFileSync("public/static/avatar.png").toString("base64")}`;
const font = `data:font/woff2;base64,${readFileSync("public/static/fonts/inter-latin-wght-normal.woff2").toString("base64")}`;

const pages = {
  home: ["cybai.re", "cybersecurity engineer · full-stack developer"],
  "about-me": ["About me", "threat intelligence, SIEM, and a homelab that rarely sleeps"],
  "about-you": ["About you", "what your browser tells every site it visits"],
  projects: ["Projects", "things you can see, and things you can't"],
  ctf: ["CTF", "36 challenges hidden across this site"],
  contact: ["Contact", "cd ~/contact"],
  now: ["Now", "what I'm up to right now"],
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const html = ([title, subtitle]) => `<!doctype html><html><head><style>
@font-face{font-family:Inter;src:url(${font}) format("woff2");font-weight:100 900}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#0b0b0c;color:#fafafa;font-family:Inter,sans-serif;position:relative;overflow:hidden}
.grid{position:absolute;inset:0;background-image:linear-gradient(#ffffff0a 1px,transparent 1px),linear-gradient(90deg,#ffffff0a 1px,transparent 1px);background-size:48px 48px}
.glow{position:absolute;right:-120px;top:-140px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,#16a34a55,transparent 65%)}
.wrap{position:absolute;inset:0;padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between}
.bar{display:flex;gap:10px}.bar i{width:16px;height:16px;border-radius:50%;display:block}
.prompt{font-family:ui-monospace,monospace;color:#16a34a;font-size:34px;margin-bottom:20px}
h1{font-size:${title.length > 28 ? 68 : 96}px;line-height:1.05;font-weight:800;letter-spacing:-0.03em;max-width:860px}
p{font-family:ui-monospace,monospace;font-size:30px;color:#a1a1aa;margin-top:24px;max-width:860px}
.foot{display:flex;align-items:center;justify-content:space-between;font-family:ui-monospace,monospace;font-size:28px;color:#71717a}
img{width:150px;height:150px;border-radius:50%;border:3px solid #ffffff33;position:absolute;right:90px;bottom:80px}
</style></head><body><div class="grid"></div><div class="glow"></div><div class="wrap">
<div class="bar"><i style="background:#ef4444"></i><i style="background:#facc15"></i><i style="background:#22c55e"></i></div>
<div><div class="prompt">❯ cat page</div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div>
<div class="foot"><span>www.cybai.re</span></div></div><img src="${avatar}"></body></html>`;

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] } : {},
);
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [key, value] of Object.entries(pages)) {
  await page.setContent(html(value));
  await page.evaluate(() => document.fonts.ready);
  writeFileSync(`public/static/og/${key}.png`, await page.screenshot({ type: "png" }));
  console.log("og", key);
}
await browser.close();
