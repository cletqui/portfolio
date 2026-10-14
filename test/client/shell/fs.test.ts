import { describe, expect, it } from "vitest";
import { makeTranslator } from "../../helpers/translator";
import { basename, buildTree, dirname, globToRegex, join, nodeSize, VFS } from "../../../src/client/shell/fs";
import { testData, testFetch } from "../../helpers/shell";

const session = { cwd: "/home/visitor", home: "/home/visitor", user: "visitor" };
const make = (over: Partial<typeof session> = {}) => {
  const s = { ...session, ...over };
  return { vfs: new VFS(buildTree(testData(), makeTranslator("en")), s, testFetch), s };
};

describe("path helpers", () => {
  it("dirname, basename and join", () => {
    expect(dirname("/a/b/c")).toBe("/a/b");
    expect(dirname("/a")).toBe("/");
    expect(basename("/a/b/c")).toBe("c");
    expect(join("/", "x")).toBe("/x");
    expect(join("/a", "x")).toBe("/a/x");
  });
  it("globToRegex escapes regex characters and maps * and ?", () => {
    expect(globToRegex("*.md").test("about.md")).toBe(true);
    expect(globToRegex("*.md").test("aboutXmd")).toBe(false);
    expect(globToRegex("a?c").test("abc")).toBe(true);
    expect(globToRegex("a+b").test("a+b")).toBe(true);
  });
});

describe("VFS.norm", () => {
  const { vfs } = make();
  it("resolves relative, home, dot and dot-dot paths", () => {
    expect(vfs.norm()).toBe("/home/visitor");
    expect(vfs.norm("~")).toBe("/home/visitor");
    expect(vfs.norm("~/projects")).toBe("/home/visitor/projects");
    expect(vfs.norm("../../etc/./passwd")).toBe("/etc/passwd");
    expect(vfs.norm("/../..")).toBe("/");
  });
});

describe("VFS.find and permissions", () => {
  it("finds files and directories", () => {
    const { vfs } = make();
    expect(vfs.find("/etc/passwd").node?.type).toBe("file");
    expect(vfs.find("/etc").node?.type).toBe("dir");
    expect(vfs.find("/nope").node).toBeNull();
  });
  it("denies /root and below to visitors but not to root", () => {
    expect(make().vfs.find("/root/flag.txt").denied).toBe(true);
    expect(make().vfs.find("/etc/shadow").denied).toBe(true);
    expect(make({ user: "root" }).vfs.find("/root/flag.txt").denied).toBe(false);
  });
  it("lists sorted names and refuses denied directories", () => {
    const { vfs } = make();
    expect(vfs.list("/home/visitor/projects")).toEqual(["api.md", "petithub.md"]);
    expect(vfs.list("/root")).toBeNull();
    expect(vfs.list("/etc/passwd")).toBeNull();
  });
});

describe("VFS.read", () => {
  it("reads text, base64 and remote files and reports errors", async () => {
    const { vfs } = make();
    const text = await vfs.read("/etc/hostname");
    expect(text.ok && new TextDecoder().decode(text.bytes)).toBe("cybai.re\n");
    const gz = await vfs.read("/var/backups/site.tgz");
    expect(gz.ok && gz.bytes[0]).toBe(0x1f);
    const png = await vfs.read("avatar.png");
    expect(png.ok && Array.from(png.bytes.subarray(1, 4))).toEqual([0x50, 0x4e, 0x47]);
    expect(await vfs.read("/nope")).toMatchObject({ ok: false, err: "No such file or directory" });
    expect(await vfs.read("/etc")).toMatchObject({ ok: false, err: "Is a directory" });
    expect(await vfs.read("/root/flag.txt")).toMatchObject({ ok: false, err: "Permission denied" });
  });
  it("maps fetch failures to an I/O error", async () => {
    const session2 = { ...session };
    const vfs = new VFS(buildTree(testData(), makeTranslator("en")), session2, (async () => {
      throw new Error("offline");
    }) as typeof fetch);
    expect(await vfs.read("avatar.png")).toMatchObject({ ok: false, err: "Input/output error" });
  });
});

describe("VFS writes", () => {
  it("writes, appends, and creates directories only where allowed", () => {
    const { vfs } = make();
    expect(vfs.write("/tmp/a.txt", "one\n")).toBeNull();
    expect(vfs.write("/tmp/a.txt", "two\n", true)).toBeNull();
    expect(vfs.write("~/note", "x")).toBeNull();
    expect(vfs.write("/etc/passwd", "x")).toBe("Permission denied");
    expect(vfs.write("/tmp/missing/a", "x")).toBe("No such file or directory");
    expect(vfs.write("/tmp", "x")).toBe("Is a directory");
    expect(vfs.mkdir("/tmp/d")).toBeNull();
    expect(vfs.mkdir("/tmp/d")).toBe("File exists");
    expect(vfs.mkdir("/etc/d")).toBe("Permission denied");
  });
  it("lets root write anywhere", () => {
    expect(make({ user: "root", home: "/root", cwd: "/root" }).vfs.write("/etc/new", "x")).toBeNull();
  });
  it("removes entries", () => {
    const { vfs } = make();
    vfs.write("/tmp/gone", "x");
    vfs.remove("/tmp/gone");
    expect(vfs.find("/tmp/gone").node).toBeNull();
  });
});

describe("VFS.glob and walk", () => {
  it("globs within a directory, hiding dotfiles unless asked", () => {
    const { vfs } = make();
    expect(vfs.glob("*.md")).toEqual(["about.md"]);
    expect(vfs.glob("projects/*.md")).toEqual(["projects/api.md", "projects/petithub.md"]);
    expect(vfs.glob(".s*")).toEqual([".secret"]);
    expect(vfs.glob("*.nothing")).toEqual(["*.nothing"]);
    expect(vfs.glob("*")).not.toContain(".secret");
  });
  it("walks depth first in sorted order and skips denied subtrees", () => {
    const { vfs } = make();
    const seen: string[] = [];
    vfs.walk("/", (p) => seen.push(p));
    expect(seen[0]).toBe("/");
    expect(seen).toContain("/etc/passwd");
    expect(seen.some((p) => p.startsWith("/root"))).toBe(false);
  });
});

describe("nodeSize", () => {
  it("measures content, base64 and directories", () => {
    const { vfs } = make();
    expect(nodeSize(vfs.find("/etc/hostname").node!)).toBe(9);
    expect(nodeSize(vfs.find("/etc").node!)).toBe(4096);
    expect(nodeSize(vfs.find("/var/backups/site.tgz").node!)).toBeGreaterThan(20);
    expect(nodeSize(vfs.find("/home/visitor/avatar.png").node!)).toBe(92915);
  });
});
