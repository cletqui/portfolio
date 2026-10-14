import { chromium } from "playwright-core";

const BASE = (process.argv[2] ?? "http://localhost:8799").replace(/\/$/, "");
const executablePath = process.env.CHROME_PATH;
const browser = await chromium.launch(executablePath ? { executablePath, args: ["--no-sandbox"] } : {});
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` ${detail}`}`);
  if (!ok) failed++;
};

await page.goto(`${BASE}/about/you`);
await page.waitForSelector("#scan-results:not(.hidden)", { timeout: 30000 });
const results = await page.locator("#scan-results").innerText();
check("scan renders results", results.length > 500);
await page.waitForFunction(() => document.querySelector("#scan-log")?.textContent?.includes("[done]"), null, { timeout: 30000 });
check("deductions live in the narrative card", /\/\/ what/.test((await page.locator("#scan-infer").textContent()) ?? ""));
check("scan prints a fingerprint id", /fingerprint [0-9A-F]{16}/.test(await page.locator("#scan-log").innerText()));
check("behaviour panel visible", await page.locator("#scan-behavior").isVisible());
await page.mouse.move(10, 10);
for (let i = 0; i < 40; i++) await page.mouse.move(100 + i * 9, 200 + Math.sin(i) * 60);
await page.fill("#scan-type", "hello world");
await page.waitForTimeout(200);
check("behaviour stats update", (await page.locator("#scan-bstats").innerText()).match(/\d/) !== null);

await page.goto(`${BASE}/ctf`);
await page.waitForSelector("#ctf-form");
check("ctf shows total", /\/\s*35|0\/35/.test(await page.locator("#ctf-count").innerText()));
await page.fill("#ctf-input", "cybai{I'm_a_t34p0t}".replace(/.*/, "cybai{1mAT34p0t}"));
await page.press("#ctf-input", "Enter");
await page.waitForFunction(() => document.querySelector("#ctf-count")?.textContent?.startsWith("1/"), null, { timeout: 5000 }).catch(() => {});
check("ctf accepts a flag", (await page.locator("#ctf-count").innerText()).startsWith("1/"));
await page.reload();
await page.waitForSelector("#ctf-form");
check("ctf progress persists", (await page.locator("#ctf-count").innerText()).startsWith("1/"));

await page.goto(`${BASE}/projects/epochalypse`);
await page.waitForTimeout(1200);
check("epoch countdown ticks", /\d/.test(await page.locator("#epoch-days").innerText()));

await page.goto(`${BASE}/now`);
const before = await page.evaluate(() => document.documentElement.classList.contains("dark"));
await page.click("#theme-toggle");
check("theme toggles", (await page.evaluate(() => document.documentElement.classList.contains("dark"))) !== before);
await page.keyboard.press("Control+k");
check("palette opens with ctrl+k", await page.locator("input[data-bwignore]").first().isVisible().catch(() => false));
await page.keyboard.press("Escape");

check("no console errors", errors.length === 0, errors.join(" | "));
await page.goto(`${BASE}/definitely-missing`);
check("error page shows the path", (await page.locator("body").innerText()).includes("definitely-missing"));

await browser.close();
if (failed) process.exit(1);
console.log("\nall site checks passed");
