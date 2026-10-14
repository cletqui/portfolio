import { beforeEach, describe, expect, it } from "vitest";
import { CLIENT_FLAGS, ROOT_PASSWORD } from "../../../src/client/shared/flags";
import { makeShell, type Harness } from "../../helpers/shell";

let h: Harness;
beforeEach(() => {
  h = makeShell();
});

const becomeRoot = async () => {
  await h.run("su root");
  await h.sh.submit(ROOT_PASSWORD);
};

describe("the root puzzle", () => {
  it("is discoverable from a hidden history file, step by step", async () => {
    expect(await h.out("ls -a")).toContain(".bash_history");
    expect(await h.out("cat .bash_history")).toContain("cat /var/backups/.pw.bak");
    expect(await h.out("ls -a /var/backups")).toContain(".pw.bak");
    expect(await h.out("cat /var/backups/.pw.bak | base64 -d")).toBe(ROOT_PASSWORD);
    expect(await h.out("cat /var/log/auth.log | grep backup")).toContain(".pw.bak");
  });
  it("keeps /root and /etc/shadow away from a visitor", async () => {
    expect(await h.out("cat /root/flag.txt")).toContain("Permission denied");
    expect(await h.out("cat /etc/shadow")).toContain("Permission denied");
    expect(await h.out("ls /root")).toContain("Permission denied");
  });
  it("asks for a masked password", async () => {
    await h.run("su root");
    expect(h.term.prompt).toBe("Password:");
    expect(h.term.masked).toBe(true);
    expect(h.mode()).not.toBeNull();
  });
  it("rejects a wrong password and returns to the normal prompt", async () => {
    await h.run("su root");
    await h.sh.submit("hunter2");
    expect(h.term.lines.join("\n")).toContain("Authentication failure");
    expect(h.mode()).toBeNull();
    expect(h.term.masked).toBe(false);
    expect(h.sh.user).toBe("visitor");
  });
  it("never echoes the typed password", async () => {
    await h.run("su root");
    await h.sh.submit("secret-guess");
    expect(h.term.lines.join("\n")).not.toContain("secret-guess");
  });
  it("Ctrl+C cancels the password prompt", async () => {
    await h.run("su root");
    h.sh.keydown({ key: "c", ctrlKey: true, metaKey: false, altKey: false }, "");
    expect(h.mode()).toBeNull();
    expect(h.sh.user).toBe("visitor");
  });
  it("grants root with the right password and reads the flag", async () => {
    await becomeRoot();
    expect(h.sh.user).toBe("root");
    expect(h.sh.cwd).toBe("/root");
    expect(h.term.prompt).toBe("root@cybai.re:~#");
    expect(h.term.promptColor).toBe("#ef4444");
    expect(await h.out("whoami")).toBe("root");
    expect(await h.out("cat flag.txt")).toBe(CLIENT_FLAGS.root);
    expect(await h.out("cat /etc/shadow")).toContain("root:$6$");
  });
  it("lets root write outside the home directory, and exit drops back", async () => {
    await becomeRoot();
    await h.run("echo pwned > /etc/motd2");
    expect(await h.out("cat /etc/motd2")).toBe("pwned");
    await h.run("exit");
    expect(h.sh.user).toBe("visitor");
    expect(h.sh.cwd).toBe("/home/visitor");
    expect(h.term.promptColor).toBeUndefined();
    expect(await h.out("cat /etc/motd2")).toContain("");
  });
  it("su to an unknown user fails and su as root does nothing", async () => {
    expect(await h.out("su nobody")).toContain("does not exist");
    await becomeRoot();
    expect(await h.out("su")).toBe("");
  });
  it("hints at the git challenge from the root history", async () => {
    await becomeRoot();
    expect(await h.out("cat /root/.bash_history")).toContain("git log");
  });
});

describe("sudo", () => {
  it("only serves a sandwich", async () => {
    const out = await h.out("sudo make me a sandwich");
    expect(out).toContain("Okay.");
    expect(out).toContain(CLIENT_FLAGS.sudo);
    expect(await h.out("sudo -l")).toContain("may not run sudo");
    expect(await h.out("sudo ls")).toContain("not in the sudoers file");
    expect(await h.out("sudo rm -rf /")).toContain("not in the sudoers file");
  });
  it("runs commands for root", async () => {
    await becomeRoot();
    expect(await h.out("sudo whoami")).toBe("root");
    expect(await h.out("sudo")).toContain("usage");
  });
});

describe("easter eggs", () => {
  it("xyzzy then plugh awards the flag, plugh alone does not", async () => {
    expect(await h.out("plugh")).toBe("Nothing happens.");
    expect(await h.out("xyzzy")).toContain('A hollow voice says "Plugh."');
    expect(await h.out("plugh")).toContain(CLIENT_FLAGS.xyzzy);
  });
  it("the fork bomb is recognised however it is spaced, and recovers", async () => {
    for (const bomb of [":(){ :|:& };:", ":(){:|:&};:", ":() { : | : & } ; :"]) {
      const fresh = makeShell();
      const out = await fresh.out(bomb);
      expect(out).toContain("Resource temporarily unavailable");
      expect(out).toContain(CLIENT_FLAGS.forkbomb);
      expect(fresh.sh.busy).toBe(false);
    }
  });
  it("scorched earth wipes the screen, then reveals nothing was deleted", async () => {
    const out = await h.out("sudo rm -rf --no-preserve-root /");
    expect(out).toContain("Just kidding");
    expect(out).toContain(CLIENT_FLAGS.wipe);
    expect(h.term.clears).toBe(2);
    expect(await h.out("ls /etc")).toContain("passwd");
    expect(h.sh.busy).toBe(false);
  });
  it("does not trigger without --no-preserve-root", async () => {
    expect(await h.out("sudo rm -rf /")).not.toContain(CLIENT_FLAGS.wipe);
  });
  it("the hidden file flag is only a dotfile away", async () => {
    expect(await h.out("cat .secret")).toBe(CLIENT_FLAGS["hidden-file"]);
  });
});

describe("busy handling", () => {
  it("ignores input while a long command runs", async () => {
    h.sh.busy = true;
    const before = h.term.lines.length;
    await h.sh.submit("echo ignored");
    expect(h.term.lines.length).toBe(before);
    h.sh.busy = false;
  });
  it("turns thrown errors into a message instead of crashing", async () => {
    h.sh.cmds.boom = () => {
      throw new Error("kaboom");
    };
    expect(await h.out("boom")).toContain("sh: kaboom");
    expect(h.sh.busy).toBe(false);
  });
});
