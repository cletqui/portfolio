import { chromium } from "playwright-core";

const BASE = (process.argv[2] ?? "http://localhost:8799").replace(/\/$/, "");
const executablePath = process.env.CHROME_PATH;

const browser = await chromium.launch(executablePath ? { executablePath, args: ["--no-sandbox"] } : {});
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(BASE + "/");
await page.waitForSelector("#shell-input");

const screenText = () => page.locator("#shell-screen").innerText();
const run = async (line, wait = 250) => {
  await page.fill("#shell-input", line);
  await page.press("#shell-input", "Enter");
  await page.waitForTimeout(wait);
};
const lastLines = async (n = 3) => (await screenText()).split("\n").filter((l) => l.trim()).slice(-n).join(" | ");

let failed = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failed++;
  console.log(`${ok ? "✓" : "✗"} ${name}${ok || !detail ? "" : "  ← " + detail}`);
};

await run("echo hello | base64");
check("pipe: echo | base64", (await lastLines(1)).includes("aGVsbG8K"), await lastLines(1));
await run("cat cipher.txt | base64 -d | rot13 | xxd -r -p");
check("pipe chain decodes the crypto flag", (await lastLines(1)).includes("cybai{0n10n5H4v3L4y3r5}"), await lastLines(1));
await run("strings avatar.png | tail -1 | base64 -d", 900);
check("strings avatar.png | base64 -d finds the stego flag", (await lastLines(1)).includes("cybai{Pl41nP1x3l5}"), await lastLines(1));
await run("ls -a | grep secret");
check("ls -a shows the hidden file", (await lastLines(1)).includes(".secret"));
await run("cat .secret");
check("cat .secret", (await lastLines(1)).includes("cybai{ls_-a_FTW}"));
await run("echo 'a b c' > /tmp/t.txt && wc -w /tmp/t.txt");
check("redirect + &&", (await lastLines(1)).includes("3"), await lastLines(1));
await run("cd /root");
check("/root is denied", (await lastLines(1)).includes("Permission denied"));
await run("cat .bash_history | grep backups");
await run("cat /var/backups/.pw.bak | base64 -d");
check("backup password decodes", (await lastLines(1)).includes("cybai-root-2038"), await lastLines(1));
await run("su root");
await page.fill("#shell-input", "wrong");
await page.press("#shell-input", "Enter");
await page.waitForTimeout(1300);
check("wrong su password fails", (await lastLines(1)).includes("Authentication failure"), await lastLines(1));
await run("su root");
await page.fill("#shell-input", "cybai-root-2038");
await page.press("#shell-input", "Enter");
await page.waitForTimeout(1300);
check("right su password gives root", (await lastLines(1)).includes("You are now root"), await lastLines(1));
await run("cat /root/flag.txt");
check("root flag readable as root", (await lastLines(1)).includes("cybai{R00t_V14_B4sh_H1st0ry}"), await lastLines(1));
await run("exit");
check("exit leaves root", (await page.locator("#shell-prompt").innerText()).startsWith("guest@"));

await run("xyzzy");
await run("plugh");
check("xyzzy then plugh awards the flag", (await screenText()).includes("cybai{A_H0ll0w_V01c3_S4ys_Plugh}"));
await run("sudo make me a sandwich");
check("sudo sandwich", (await screenText()).includes("cybai{Sud0M4k3M3AS4ndw1ch}"));
await run(":(){ :|:& };:", 2500);
check("fork bomb is survived", (await screenText()).includes("ulimit -u"));
await run("sudo rm -rf --no-preserve-root /", 6000);
check("scorched earth awards its flag", (await screenText()).includes("cybai{Ju5t_K1dd1ng_N0th1ng_W45_D3l3t3d}"));

await run("ctf");
check("ctf status", /\d+\/\d+ flags found/.test(await lastLines(2)), await lastLines(2));
await run("ctf hint snake");
check("ctf hint", (await lastLines(1)).includes("Eat enough"), await lastLines(1));
await run("ctf submit cybai{1mAT34p0t}", 600);
check("ctf submit accepts a real flag", (await lastLines(1)).includes("✓"), await lastLines(1));
await run("ctf submit cybai{nope}", 600);
check("ctf submit rejects a bad flag", (await lastLines(1)).includes("✗"), await lastLines(1));
await run("ctf list solved");
check("ctf list solved shows it", (await lastLines(1)).includes("teapot"), await lastLines(1));

await run("figlet hi");
check("figlet renders blocks", (await screenText()).includes("█"));
await run("cowsay moo");
check("cowsay", (await screenText()).includes("^__^"));
await run("echo rainbow | lolcat");
check("lolcat colours output", await page.locator("#shell-screen span[style*='color']").count() > 0);
await run("date -u -d @2147483648");
check("date shows the 2038 wrap", (await screenText()).includes("1901"), await lastLines(2));
await run("git log");
check("git log is only in /var/www", (await lastLines(1)).includes("not a git repository"));
await run("cd /var/www/html && git log | head -3");
check("git log inside /var/www/html", (await screenText()).includes("remove hardcoded secrets") || (await lastLines(3)).includes("commit"), await lastLines(3));

await run("adventure", 700);
for (const step of ["open drawer", "take badge", "take flashlight", "use badge", "n", "w", "move boxes", "take fuse", "e", "use fuse", "e", "read note", "w", "n", "use terminal"]) await run(step, 120);
await page.fill("#shell-input", "tcp-ack-42");
await page.press("#shell-input", "Enter");
await page.waitForTimeout(400);
check("adventure can be won", (await screenText()).includes("cybai{3sc4p3_Th3_D4t4c3nt3r}"), await lastLines(3));

await run("wordle", 700);
await run("abc", 150);
check("wordle rejects a short guess", (await lastLines(1)).includes("five letters"), await lastLines(1));
await run("q", 200);
check("wordle quits and reveals the word", (await screenText()).toLowerCase().includes("the word was"));

await run("snake", 500);
await page.keyboard.press("q");
await page.waitForTimeout(300);
check("snake starts and quits", (await screenText()).includes("Game over"), await lastLines(2));
await run("cmatrix", 600);
await page.keyboard.press("x");
await page.waitForTimeout(300);
check("cmatrix starts and quits", (await screenText()).includes("Neo"));
await run("sl", 4500);
check("sl runs and clears", !(await screenText()).includes("(O)==(O)"));

const box = () => page.locator("#shell").boundingBox();
const before = await box();
await page.click("#shell-maximize");
await page.waitForTimeout(200);
const full = await box();
check("green button opens the fullscreen popup", !!full && !!before && full.width > before.width && full.height > before.height + 100, JSON.stringify({ before, full }));
const topmost = await page.evaluate(() => {
  const r = document.querySelector("#shell-screen").getBoundingClientRect();
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return !!hit && !!hit.closest("#shell");
});
check("the fullscreen terminal is on top of the backdrop (visible and clickable)", topmost);
await page.locator("#shell-input").click({ timeout: 2000 });
await run("echo still works fullscreen");
check("terminal works in fullscreen", (await lastLines(1)).includes("still works fullscreen"));
await page.keyboard.press("Escape");
await page.waitForTimeout(200);
const back = await box();
check("Escape leaves fullscreen", !!back && !!before && Math.abs(back.height - before.height) < 4, JSON.stringify({ before, back }));
await page.click("#shell-minimize");
await page.waitForTimeout(150);
check("yellow button minimises", !(await page.locator("#shell-screen").isVisible()));
await page.click("#shell-minimize");
await page.waitForTimeout(150);
check("yellow button restores", await page.locator("#shell-screen").isVisible());
await page.dblclick("#shell-titlebar");
await page.waitForTimeout(200);
check("double-clicking the title bar toggles fullscreen", ((await box())?.height ?? 0) > (before?.height ?? 0) + 100);
await page.click("#shell-close");
await page.waitForTimeout(200);
check("red button exits fullscreen", Math.abs(((await box())?.height ?? 0) - (before?.height ?? 0)) < 4);

const second = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await second.goto(BASE + "/");
await second.waitForSelector("#shell-input");
check("the terminal is focused on arrival", await second.evaluate(() => document.activeElement?.id === "shell-input"));
check("the terminal scrollbar is hidden", await second.evaluate(() => getComputedStyle(document.querySelector("#shell-screen")).scrollbarWidth === "none"));
await second.keyboard.type("help");
await second.keyboard.press("Enter");
await second.waitForTimeout(250);
const helpText = await second.locator("#shell-screen").innerText();
check("help is a plain command listing", helpText.includes("Text processing") && !helpText.includes("a | b"));
await second.keyboard.type("cd /etc");
await second.keyboard.press("Enter");
await second.keyboard.type("cd projects/ticdot");
await second.keyboard.press("Enter");
await second.waitForURL("**/projects/ticdot", { timeout: 4000 }).catch(() => undefined);
check("cd into a project directory opens its page, from anywhere", second.url().endsWith("/projects/ticdot"), second.url());
await second.goto(BASE + "/contact");
await second.waitForSelector("[data-email]");
const mailHref = await second.locator("a[data-email]").first().getAttribute("href");
check("the email link is upgraded to mailto only in the browser", !!mailHref && mailHref.startsWith("mailto:") && mailHref.includes("@"), String(mailHref));
const rawHtml = await (await fetch(BASE + "/contact")).text();
check("the served HTML never contains the address", !/admin@cybai\.re|mailto:/i.test(rawHtml));
await second.screenshot({ path: process.env.SHOT_DIR ? `${process.env.SHOT_DIR}/contact.png` : "/tmp/claude-1000/contact.png", fullPage: true });

check("no browser console errors", errors.length === 0, errors.join("; "));
await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nall shell checks passed");
process.exit(failed ? 1 : 0);
