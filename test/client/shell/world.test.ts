import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { HTPASSWD } from "../../../src/data/admin";
import { FLAGS } from "../../../src/utils/flags";
import { makeShell, type Harness } from "../../helpers/shell";
import { text } from "../../helpers/app";

let h: Harness;
beforeEach(() => {
  h = makeShell();
});

describe("the wider filesystem", () => {
  it("has a believable root directory", async () => {
    const root = await h.out("ls /");
    for (const d of ["bin/", "boot/", "dev/", "etc/", "home/", "proc/", "root/", "srv/", "tmp/", "usr/", "var/"]) expect(root).toContain(d);
  });
  it("shows other users, but keeps their homes closed", async () => {
    expect(await h.out("ls /home")).toBe("admin/  deploy/  guest/");
    expect(await h.out("ls /home/admin")).toContain("Permission denied");
    expect(await h.out("cat /home/admin/notes")).toContain("Permission denied");
    expect(await h.out("cd /home/deploy")).toContain("Permission denied");
  });
  it("lists the system accounts the files talk about", async () => {
    const passwd = await h.out("cat /etc/passwd");
    for (const user of ["root", "deploy", "admin", "guest"]) expect(passwd).toContain(`${user}:x:`);
  });
  it("keeps secrets root-only: shadow, sudoers, host keys, lost+found", async () => {
    for (const p of ["/etc/shadow", "/etc/sudoers", "/etc/ssh/ssh_host_ed25519_key", "/lost+found", "/root"]) {
      expect(await h.out(`cat ${p}`), p).toContain("Permission denied");
    }
  });
  it("swallows writes to /dev/null and reads it as empty", async () => {
    expect(await h.out("echo gone > /dev/null && cat /dev/null")).toBe("");
    expect(await h.out("ls /dev")).toContain("null");
  });
  it("lets root see everything a guest cannot", async () => {
    await h.run("su root");
    await h.sh.submit("cybai-root-2038");
    expect(await h.out("cat /etc/sudoers")).toContain("NOPASSWD");
    expect(await h.out("cat /home/admin/notes")).toContain("TODO");
  });
  it("exposes proc and docs", async () => {
    expect(await h.out("cat /proc/version")).toContain("Linux version");
    expect(await h.out("cat /usr/share/doc/cybai/README")).toContain("cybai{");
    expect(await h.out("ls ~/.ssh")).toBe("config  known_hosts");
  });
  it("hides a mail with a hint to /admin", async () => {
    expect(await h.out("cat /var/mail/guest")).toContain("/admin");
  });
});

describe("crackable hashes", () => {
  it("keeps users.csv md5 hashes reproducible, one of them pointing at a flag", async () => {
    const csv = await h.out("cat /var/lib/cybai/users.csv");
    const rows = csv.split("\n").slice(1).map((l) => l.split(","));
    expect(rows.length).toBeGreaterThanOrEqual(4);
    const md5 = (s: string) => createHash("md5").update(s).digest("hex");
    expect(rows.find((r) => r[1] === "bob")![3]).toBe(md5("password"));
    expect(rows.find((r) => r[1] === "admin")![3]).toBe(md5("admin"));
    const dave = rows.find((r) => r[1] === "dave")![3]!;
    expect(FLAGS.lookup).toBe(`cybai{football}`);
    expect(dave).toBe(md5("football"));
  });
  it("leaves a world-readable shadow backup whose weakest account guards a flag", async () => {
    const shadow = await h.out("cat /var/backups/shadow.bak");
    expect(shadow).toMatch(/^root:\$6\$/m);
    expect(shadow).toMatch(/^deploy:\$6\$cybaisalt\$/m);
    expect(FLAGS.crack).toBe("cybai{princess1}");
  });
  it("mirrors the HTTP .htpasswd on disk", async () => {
    expect(await h.out("cat /var/www/html/.htpasswd")).toBe(HTPASSWD.trim());
    expect(await text("/.htpasswd")).toBe(HTPASSWD);
  });
  it("accepts the cracked flags", async () => {
    for (const id of ["lookup", "crack", "admin"]) expect(await h.out(`ctf submit ${FLAGS[id]}`), id).toContain("✓");
  });
});

describe("pages as directories", () => {
  it("has a README and an index.html in every page, and one per project", async () => {
    for (const dir of ["about", "you", "projects", "contact", "ctf", "now", "projects/petithub", "projects/api"]) {
      const ls = await h.out(`ls ${dir}`);
      expect(ls, dir).toContain("README.md");
      expect(ls, dir).toContain("index.html");
    }
  });
  it("opens a project page without leaving the shell for plain reads", async () => {
    expect(await h.out("cat projects/petithub/README.md")).toContain("PetitHub");
    expect(await h.out("cat contact/pgp.asc")).toBeDefined();
    expect(h.navigations).toEqual([]);
  });
  it("keeps the old top-level shortcuts gone", async () => {
    expect(await h.out("ls")).not.toMatch(/about\.md|contact\.txt/);
  });
});
