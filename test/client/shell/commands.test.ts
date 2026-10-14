import { beforeEach, describe, expect, it } from "vitest";
import { FLAGS } from "../../../src/utils/flags";
import { makeShell, type Harness } from "../../helpers/shell";

let h: Harness;
beforeEach(() => {
  h = makeShell();
});

describe("navigation and files", () => {
  it("pwd, cd, and the prompt follow the working directory", async () => {
    expect(await h.out("pwd")).toBe("/home/visitor");
    await h.run("cd /etc");
    expect(h.term.prompt).toBe("visitor@cybai.re:/etc$");
    await h.run("cd ~/projects");
    expect(h.term.prompt).toBe("visitor@cybai.re:~/projects$");
    await h.run("cd -");
    expect(await h.out("pwd")).toBe("/etc");
    await h.run("cd");
    expect(h.term.prompt).toBe("visitor@cybai.re:~$");
  });
  it("cd reports errors", async () => {
    expect(await h.out("cd /nope")).toContain("No such file or directory");
    expect(await h.out("cd about.md")).toContain("Not a directory");
    expect(await h.out("cd /root")).toContain("Permission denied");
  });
  it("ls hides dotfiles, -a shows them, -l adds details", async () => {
    expect(await h.out("ls")).not.toContain(".secret");
    expect(await h.out("ls -a")).toContain(".secret");
    expect(await h.out("ls -l")).toMatch(/-rw-r--r-- 1 visitor visitor +\d+ Oct 14 12:00 about\.md/);
    expect(await h.out("ls projects")).toBe("api.md  petithub.md");
    expect(await h.out("ls /nope")).toContain("cannot access");
    expect(await h.out("ls /root")).toContain("Permission denied");
  });
  it("cat reads files, multiple files and stdin", async () => {
    expect(await h.out("cat /etc/hostname")).toBe("cybai.re");
    expect(await h.out("cat nope")).toContain("No such file or directory");
    expect(await h.out("echo hi | cat")).toBe("hi");
    expect(await h.out("cat -n /etc/hostname")).toMatch(/^\s+1\tcybai\.re$/);
  });
  it("touch, mkdir, cp, mv and rm work in writable places", async () => {
    await h.run("mkdir /tmp/work");
    await h.run("echo data > /tmp/work/a.txt");
    await h.run("cp /tmp/work/a.txt /tmp/work/b.txt");
    await h.run("mv /tmp/work/b.txt /tmp/work/c.txt");
    expect(await h.out("ls /tmp/work")).toBe("a.txt  c.txt");
    expect(await h.out("cat /tmp/work/c.txt")).toBe("data");
    await h.run("rm /tmp/work/a.txt");
    expect(await h.out("ls /tmp/work")).toBe("c.txt");
    expect(await h.out("rm /etc/passwd")).toContain("Read-only file system");
    expect(await h.out("rm /tmp/work")).toContain("Is a directory");
    await h.run("rm -r /tmp/work");
    expect(await h.out("ls /tmp")).toBe("");
  });
  it("refuses rm -rf /", async () => {
    expect(await h.out("rm -rf /")).toContain("--no-preserve-root");
  });
  it("find, tree and file", async () => {
    expect(await h.out("find /var/www -name '*.html'")).toBe("/var/www/html/index.html");
    expect(await h.out("find ~/projects -type f")).toContain("petithub.md");
    expect(await h.out("tree /var/backups")).toMatch(/site\.tgz/);
    expect(await h.out("file avatar.png")).toBe("avatar.png: PNG image data, 512 x 512");
    expect(await h.out("file /var/backups/site.tgz")).toContain("gzip");
    expect(await h.out("file about.md")).toContain("ASCII text");
    expect(await h.out("file /etc")).toContain("directory");
  });
  it("globs expand against the filesystem", async () => {
    expect(await h.out("echo *.md")).toBe("about.md");
    expect(await h.out("cat projects/*.md | grep -c '^#'")).toBe("2");
  });
});

describe("pipes, redirects and variables", () => {
  it("chains with && and ||", async () => {
    expect(await h.out("true_cmd_missing || echo fallback")).toContain("fallback");
    expect(await h.out("echo ok && echo next")).toBe("ok\nnext");
    expect(await h.out("cat /nope && echo SKIPPED")).not.toContain("SKIPPED");
    expect(await h.out("echo a ; echo b")).toBe("a\nb");
  });
  it("$? holds the last status", async () => {
    await h.run("cat /nope");
    expect(await h.out("echo $?")).toBe("1");
    await h.run("echo fine");
    expect(await h.out("echo $?")).toBe("0");
  });
  it("redirects with > and >>", async () => {
    await h.run("echo one > ~/n.txt");
    await h.run("echo two >> ~/n.txt");
    expect(await h.out("cat ~/n.txt")).toBe("one\ntwo");
    expect(await h.out("echo x > /etc/nope")).toContain("Permission denied");
  });
  it("export and $VAR", async () => {
    await h.run("export GREETING=hello");
    expect(await h.out("echo $GREETING world")).toBe("hello world");
    expect(await h.out("env")).toContain("GREETING=hello");
  });
  it("reports unknown commands with status 127", async () => {
    expect(await h.out("definitely-not-a-command")).toContain("command not found");
    expect(h.sh.lastStatus).toBe(127);
  });
});

describe("text tools", () => {
  it("head, tail, wc, sort, uniq, rev, tac", async () => {
    await h.run("seq 1 5 > /tmp/n");
    expect(await h.out("head -n 2 /tmp/n")).toBe("1\n2");
    expect(await h.out("head -2 /tmp/n")).toBe("1\n2");
    expect(await h.out("tail -n 2 /tmp/n")).toBe("4\n5");
    expect(await h.out("wc -l /tmp/n")).toContain("5");
    expect(await h.out("tac /tmp/n | head -1")).toBe("5");
    expect(await h.out("printf 'b\\na\\nb\\n' | sort | uniq -c")).toMatch(/1 a\n\s+2 b/);
    expect(await h.out("printf '3\\n10\\n2\\n' | sort -n")).toBe("2\n3\n10");
    expect(await h.out("printf '3\\n10\\n2\\n' | sort -rn | head -1")).toBe("10");
    expect(await h.out("echo abc | rev")).toBe("cba");
  });
  it("grep with flags", async () => {
    expect(await h.out("grep -i CYBAI /etc/hostname")).toBe("cybai.re");
    expect(await h.out("grep -c root /etc/passwd")).toBe("1");
    expect(await h.out("grep -n visitor /etc/passwd")).toMatch(/^4:visitor/);
    expect(await h.out("grep -v x /etc/hostname")).toBe("cybai.re");
    expect(await h.out("grep -r cybai-root /var")).toBe("");
    expect(await h.out("grep '(' /etc/passwd")).toContain("invalid regular expression");
  });
  it("tr and cut", async () => {
    expect(await h.out("echo hello | tr a-z A-Z")).toBe("HELLO");
    expect(await h.out("echo hello | tr -d l")).toBe("heo");
    expect(await h.out("echo 'a:b:c' | cut -d : -f 2")).toBe("b");
    expect(await h.out("echo 'a:b:c' | cut -d : -f 2-")).toBe("b:c");
  });
  it("echo, printf and seq", async () => {
    expect(await h.out("echo -n hi")).toBe("hi");
    expect(await h.out("echo -e 'a\\tb'")).toBe("a\tb");
    expect(await h.out("printf '%s-%d\\n' x 7")).toBe("x-7");
    expect(await h.out("seq 3")).toBe("1\n2\n3");
    expect(await h.out("seq 2 4")).toBe("2\n3\n4");
  });
});

describe("encoding tools", () => {
  it("base64 round-trips", async () => {
    expect(await h.out("echo hello | base64")).toBe("aGVsbG8K");
    expect(await h.out("echo aGVsbG8K | base64 -d")).toBe("hello");
    expect(await h.out("echo '!!' | base64 -d")).toContain("invalid input");
  });
  it("rot13 is its own inverse", async () => {
    expect(await h.out("echo Hello | rot13")).toBe("Uryyb");
    expect(await h.out("echo Hello | rot13 | rot13")).toBe("Hello");
  });
  it("xxd dumps and reverses", async () => {
    expect(await h.out("echo hi | xxd -p")).toBe("68690a");
    expect(await h.out("echo 6869 | xxd -r -p")).toBe("hi");
    expect(await h.out("echo hi | xxd")).toMatch(/^00000000: 6869 0a\s+hi\.$/);
    expect(await h.out("echo hi | xxd | xxd -r")).toBe("hi");
    expect(await h.out("echo zz | xxd -r -p")).toContain("invalid hex");
  });
  it("strings finds text inside binary files", async () => {
    expect(await h.out("strings avatar.png | tail -1")).toBe(btoa("cybai{Pl41nP1x3l5}"));
  });
  it("sha256sum, jwt and url helpers", async () => {
    expect(await h.out("echo -n abc | sha256sum")).toContain("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    const token = `${btoa('{"alg":"HS256"}')}.${btoa('{"role":"admin"}')}.sig`.replace(/=/g, "");
    const out = await h.out(`jwt ${token}`);
    expect(out).toContain('"role":"admin"');
    expect(out).toContain("signature: sig");
    expect(await h.out("jwt nope")).toContain("usage");
    expect(await h.out("urlencode 'a b&c'")).toBe("a%20b%26c");
    expect(await h.out("urldecode a%20b")).toBe("a b");
  });
  it("solves the crypto challenge by piping, as the hint suggests", async () => {
    expect(await h.out("cat cipher.txt | base64 -d | rot13 | xxd -r -p")).toBe(FLAGS.crypto);
  });
  it("solves the stego challenge in the terminal", async () => {
    expect(await h.out("strings avatar.png | tail -1 | base64 -d")).toBe(FLAGS.stego);
  });
  it("marks binary output instead of dumping it", async () => {
    expect(await h.out("cat avatar.png")).toContain("binary output suppressed");
  });
});

describe("system and site commands", () => {
  it("whoami, id, hostname, uname", async () => {
    expect(await h.out("whoami")).toContain("visitor");
    expect(await h.out("id")).toContain("uid=1000");
    expect(await h.out("hostname")).toBe("cybai.re");
    expect(await h.out("uname -s")).toBe("CybaiOS");
  });
  it("date supports epoch formats and the 32-bit wrap hint", async () => {
    expect(await h.out("date -u -d @2147483647 +%F")).toBe("2038-01-19");
    expect(await h.out("date -u -d @2147483647 +%T")).toBe("03:14:07");
    expect(await h.out("date -u -d @2147483648")).toContain("1901");
    expect(await h.out("date -d nonsense")).toContain("invalid date");
    expect(await h.out("date +%s")).toBe(String(Date.UTC(2026, 9, 14, 12) / 1000));
  });
  it("history lists and clears", async () => {
    await h.run("echo a");
    expect(await h.out("history")).toContain("echo a");
    await h.run("history -c");
    expect(await h.out("history")).toMatch(/history$/);
  });
  it("about, contact and projects", async () => {
    expect(await h.out("about")).toContain("# cybai.re");
    expect(await h.out("contact")).toContain("PGP:");
    expect(await h.out("projects")).toContain("PetitHub");
    expect(await h.out("gpg")).toContain("ACFAD5ECEEC88002");
  });
  it("open and lang navigate", async () => {
    await h.run("open projects");
    await h.run("lang");
    expect(h.navigations).toEqual(["/projects", "/fr"]);
    expect(await h.out("open nowhere")).toContain("usage: open");
  });
  it("curl serves the card for the site only", async () => {
    expect(await h.out("curl cybai.re")).toBe("CARD");
    expect(await h.out("curl example.com")).toContain("Could not resolve host");
  });
  it("neofetch renders rich output", async () => {
    await h.run("neofetch");
    expect(h.term.rich.length).toBeGreaterThan(5);
  });
  it("theme returns the applied value", async () => {
    expect(await h.out("theme light")).toBe("theme: light");
  });
  it("help lists groups and per-command usage", async () => {
    expect(await h.out("help")).toContain("Text tools");
    expect(await h.out("help grep")).toContain("grep [-i]");
    expect(await h.out("grep --help")).toContain("usage: grep");
    expect(await h.out("man base64")).toContain("BASE64(1)");
    expect(await h.out("man nothing")).toContain("No manual entry");
  });
  it("cal and uptime produce output", async () => {
    expect(await h.out("cal")).toContain("Su Mo Tu");
    expect(await h.out("uptime")).toContain("load average");
  });
  it("git only works inside /var/www", async () => {
    expect(await h.out("git log")).toContain("not a git repository");
    await h.run("cd /var/www/html");
    expect(await h.out("git log")).toContain("remove hardcoded secrets");
    expect(await h.out("git status")).toContain("nothing to commit");
  });
  it("telnet has a blinkenlights egg", async () => {
    expect(await h.out("telnet towel.blinkenlights.nl")).toContain("galaxy far, far away");
  });
});

describe("toys", () => {
  it("cowsay, figlet and lolcat", async () => {
    expect(await h.out("cowsay hi")).toContain("< hi >");
    expect(await h.out("figlet hi")).toContain("█");
    await h.run("echo rainbow | lolcat");
    expect(h.term.rich.some((l) => l.some((s) => s.c?.startsWith("hsl")))).toBe(true);
    expect(await h.out("echo moo | cowsay")).toContain("moo");
  });
});

describe("tab completion and keys", () => {
  it("completes commands and paths", () => {
    expect(h.sh.complete("cowsa")).toEqual({ value: "cowsay " });
    expect(h.sh.complete("cat abo")).toEqual({ value: "cat about.md " });
    expect(h.sh.complete("cd proj")).toEqual({ value: "cd projects/" });
    expect(h.sh.complete("cat /etc/pass")).toEqual({ value: "cat /etc/passwd " });
  });
  it("lists ambiguous options and hides hidden commands and dotfiles", () => {
    expect(h.sh.complete("sha").options).toEqual(["sha1sum", "sha256sum", "sha512sum"]);
    expect(h.sh.complete("xyz").value).toBeUndefined();
    expect(h.sh.complete("cat ").options ?? []).not.toContain(".secret");
    expect(h.sh.complete("cat .sec")).toEqual({ value: "cat .secret " });
  });
  it("walks the history with the arrow keys", async () => {
    await h.run("echo one");
    await h.run("echo two");
    const key = (k: string) => h.sh.keydown({ key: k, ctrlKey: false, metaKey: false, altKey: false }, "");
    expect(key("ArrowUp").value).toBe("echo two");
    expect(key("ArrowUp").value).toBe("echo one");
    expect(key("ArrowDown").value).toBe("echo two");
    expect(key("ArrowDown").value).toBe("");
  });
  it("Ctrl+L clears and Ctrl+C interrupts", () => {
    const k = { key: "l", ctrlKey: true, metaKey: false, altKey: false };
    h.sh.keydown(k, "");
    expect(h.term.clears).toBe(1);
    const c = h.sh.keydown({ ...k, key: "c" }, "partial");
    expect(c).toEqual({ prevent: true, value: "" });
    expect(h.term.lines.join("\n")).toContain("partial^C");
  });
});
