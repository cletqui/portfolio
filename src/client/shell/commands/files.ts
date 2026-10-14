import { basename, dirname, globToRegex, join, nodeSize, type FsNode } from "../fs";
import type { Shell } from "../shell";
import type { CommandMap } from "../types";
import { gather, lines, splitFlags, textOf, usage } from "./util";
import { decodeBytes } from "../../shared/bytes";

const fmtMode = (node: FsNode): string =>
  (node.type === "dir" ? "d" : "-") + (node.rootOnly ? "rwx------" : node.type === "dir" ? "rwxr-xr-x" : "rw-r--r--");

export const fileCommands = (sh: Shell): CommandMap => {
  const { vfs } = sh;

  const ls: CommandMap["ls"] = (args, io) => {
    const s = splitFlags(args);
    const targets = s.rest.length ? s.rest : ["."];
    let status = 0;
    targets.forEach((target, idx) => {
      const abs = vfs.norm(target);
      const r = vfs.find(abs);
      if (!r.node) {
        io.err(`ls: cannot access '${target}': No such file or directory`);
        status = 2;
        return;
      }
      if (r.denied) {
        io.err(`ls: cannot open directory '${target}': Permission denied`);
        status = 2;
        return;
      }
      if (targets.length > 1) io.writeln((idx ? "\n" : "") + target + ":");
      const node = r.node;
      let entries: string[];
      if (node.type === "dir") {
        entries = Object.keys(node.children).sort();
        entries = s.flags.a ? [".", "..", ...entries] : entries.filter((n) => !n.startsWith("."));
      } else entries = [basename(abs)];
      const nodeOf = (n: string): FsNode | null => {
        if (node.type !== "dir" || n === ".") return node;
        if (n === "..") return vfs.find(dirname(abs)).node;
        return node.children[n] ?? null;
      };
      const label = (n: string) => n + (nodeOf(n)?.type === "dir" && n !== "." && n !== ".." ? "/" : "");
      if (s.flags.l) {
        io.writeln(`total ${entries.length * 4}`);
        for (const n of entries) {
          const nd = nodeOf(n);
          if (!nd) continue;
          io.writeln(`${fmtMode(nd)} ${nd.type === "dir" ? 2 : 1} ${nd.rootOnly ? "root root" : "visitor visitor"} ${String(nodeSize(nd)).padStart(6)} ${nd.mtime} ${label(n)}`);
        }
      } else if (s.flags["1"]) entries.forEach((n) => io.writeln(label(n)));
      else io.writeln(entries.map(label).join("  "));
    });
    return status;
  };

  return {
    ls,
    ll: (args, io) => ls(["-la", ...args], io),
    dir: ls,
    pwd: (_a, io) => void io.writeln(sh.cwd),
    cd: (args, io) => {
      const target = args[0] === "-" ? sh.oldpwd : (args[0] ?? sh.home);
      const abs = vfs.norm(target);
      const r = vfs.find(abs);
      const shown = args[0] ?? target;
      if (!r.node) return io.err(`cd: ${shown}: No such file or directory`), 1;
      if (r.denied) return io.err(`cd: ${shown}: Permission denied`), 1;
      if (r.node.type !== "dir") return io.err(`cd: ${shown}: Not a directory`), 1;
      sh.oldpwd = sh.cwd;
      sh.cwd = abs;
      sh.refreshPrompt();
      return 0;
    },
    cat: async (args, io) => {
      const s = splitFlags(args);
      const items = await gather(sh, s.rest, io);
      let text = textOf(items, io);
      if (s.flags.n) text = lines(text).map((l, i) => `${String(i + 1).padStart(6)}\t${l}`).join("\n") + "\n";
      io.write(text);
      return items.length || !s.rest.length ? 0 : 1;
    },
    file: async (args, io) => {
      for (const it of await gather(sh, args, io)) {
        const b = it.bytes;
        let desc: string;
        if (!b.length) desc = "empty";
        else if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
          const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
          desc = `PNG image data, ${view.getUint32(16)} x ${view.getUint32(20)}`;
        } else if (b[0] === 0x1f && b[1] === 0x8b) desc = "gzip compressed data";
        else if (b[0] === 0x7f && b[1] === 0x45) desc = "ELF executable";
        else {
          const sample = b.subarray(0, 512);
          const control = sample.some((x) => x === 0 || x < 9 || (x > 13 && x < 32));
          desc = !control && !decodeBytes(sample).binary ? "ASCII text" : "data";
        }
        io.writeln(`${it.name}: ${desc}`);
      }
      for (const a of args) {
        const r = vfs.find(vfs.norm(a));
        if (r.node?.type === "dir" && !r.denied) io.writeln(`${a}: directory`);
      }
    },
    find: (args, io) => {
      let start: string | null = null;
      let nameRe: RegExp | null = null;
      let type: string | undefined;
      for (let i = 0; i < args.length; i++) {
        const a = args[i]!;
        if (a === "-name") nameRe = globToRegex(args[++i] ?? "*");
        else if (a === "-type") type = args[++i];
        else if (!a.startsWith("-") && start === null) start = a;
      }
      const startPath = start ?? ".";
      const base = vfs.norm(startPath);
      const shown = (abs: string) => (startPath.startsWith("/") ? abs : abs === base ? startPath : "." + abs.slice(base.length));
      vfs.walk(base, (abs, node) => {
        if (type === "f" && node.type !== "file") return;
        if (type === "d" && node.type !== "dir") return;
        if (nameRe && !nameRe.test(basename(abs))) return;
        io.writeln(shown(abs));
      });
      return 0;
    },
    tree: (args, io) => {
      const s = splitFlags(args);
      const target = s.rest[0] ?? ".";
      const r = vfs.find(vfs.norm(target));
      if (!r.node || r.node.type !== "dir") return io.err(`tree: ${target}: not a directory`), 1;
      if (r.denied) return io.err(`tree: ${target}: Permission denied`), 1;
      let dirs = 0;
      let files = 0;
      io.writeln(target);
      const walk = (children: Record<string, FsNode>, prefix: string, depth: number) => {
        const names = Object.keys(children).sort().filter((n) => s.flags.a || !n.startsWith("."));
        names.forEach((n, i) => {
          const child = children[n]!;
          const end = i === names.length - 1;
          io.writeln(prefix + (end ? "└── " : "├── ") + n);
          if (child.type === "dir") {
            dirs++;
            if (depth < 4 && !(child.rootOnly && sh.user !== "root")) walk(child.children, prefix + (end ? "    " : "│   "), depth + 1);
          } else files++;
        });
      };
      walk(r.node.children, "", 1);
      io.writeln(`\n${dirs} directories, ${files} files`);
      return 0;
    },
    touch: (args, io) => {
      let status = 0;
      for (const a of args) {
        if (vfs.find(vfs.norm(a)).node) continue;
        const err = vfs.write(a, "");
        if (err) {
          io.err(`touch: cannot touch '${a}': ${err}`);
          status = 1;
        }
      }
      return status;
    },
    mkdir: (args, io) => {
      let status = 0;
      for (const a of splitFlags(args).rest) {
        const err = vfs.mkdir(a);
        if (err) {
          io.err(`mkdir: cannot create directory '${a}': ${err}`);
          status = 1;
        }
      }
      return status;
    },
    rm: (args, io) => {
      const s = splitFlags(args);
      let status = 0;
      for (const a of s.rest) {
        const abs = vfs.norm(a);
        if (abs === "/" || abs === "/*") {
          io.err("rm: it is dangerous to operate recursively on '/'\nrm: use --no-preserve-root to override this failsafe. Nice try.");
          status = 1;
          continue;
        }
        const r = vfs.find(abs);
        if (!r.node) {
          if (!s.flags.f) {
            io.err(`rm: cannot remove '${a}': No such file or directory`);
            status = 1;
          }
        } else if (!vfs.writable(abs) || r.denied) {
          io.err(`rm: cannot remove '${a}': ${r.denied ? "Permission denied" : "Read-only file system"}`);
          status = 1;
        } else if (r.node.type === "dir" && !(s.flags.r || s.flags.R)) {
          io.err(`rm: cannot remove '${a}': Is a directory`);
          status = 1;
        } else vfs.remove(abs);
      }
      return status;
    },
    cp: (args, io) => copyOrMove(sh, args, io, false),
    mv: (args, io) => copyOrMove(sh, args, io, true),
  };
};

const copyOrMove = async (sh: Shell, args: string[], io: Parameters<CommandMap[string]>[1], move: boolean): Promise<number> => {
  const name = move ? "mv" : "cp";
  const rest = splitFlags(args).rest;
  if (rest.length < 2) return usage(name, io);
  const src = await sh.vfs.read(rest[0]!);
  if (!src.ok) return io.err(`${name}: cannot stat '${rest[0]}': ${src.err}`), 1;
  let dest = rest[1]!;
  const d = sh.vfs.find(sh.vfs.norm(dest));
  if (d.node?.type === "dir") dest = join(sh.vfs.norm(dest), basename(src.abs));
  const err = sh.vfs.write(dest, decodeBytes(src.bytes).text);
  if (err) return io.err(`${name}: cannot create '${rest[1]}': ${err}`), 1;
  if (move && sh.vfs.writable(src.abs)) sh.vfs.remove(src.abs);
  return 0;
};

