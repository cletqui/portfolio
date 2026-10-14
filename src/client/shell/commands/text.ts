import { decodeBytes } from "../../shared/bytes";
import type { Shell } from "../shell";
import type { CommandMap } from "../types";
import { gather, lines, numFlag, splitFlags, stdinText, textOf, usage } from "./util";

const expandSet = (set: string): string[] => {
  const s = set
    .replace(/\[:upper:\]/g, "A-Z")
    .replace(/\[:lower:\]/g, "a-z")
    .replace(/\[:digit:\]/g, "0-9")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");
  const out: string[] = [];
  for (let i = 0; i < s.length; i++) {
    if (s.charAt(i + 1) === "-" && i + 2 < s.length) {
      for (let c = s.charCodeAt(i); c <= s.charCodeAt(i + 2); c++) out.push(String.fromCharCode(c));
      i += 2;
    } else out.push(s.charAt(i));
  }
  return out;
};

const escapes = (text: string): string =>
  text.replace(/\\(n|t|\\|x[0-9a-fA-F]{2})/g, (_m, c: string) =>
    c === "n" ? "\n" : c === "t" ? "\t" : c === "\\" ? "\\" : String.fromCharCode(parseInt(c.slice(1), 16)),
  );

const parseCut = (spec: string): [number, number][] =>
  spec.split(",").map((p) => {
    const m = /^(\d*)-(\d*)$/.exec(p);
    return m ? [Number(m[1] || 1), Number(m[2] || 9999)] : [Number(p), Number(p)];
  });

export const textCommands = (sh: Shell): CommandMap => {
  const joined = async (rest: string[], io: Parameters<CommandMap[string]>[1]) => textOf(await gather(sh, rest, io), io);
  const headTail = (tail: boolean): CommandMap[string] => async (args, io) => {
    const s = splitFlags(args, ["n"]);
    let n = numFlag(s.flags, "n", 10);
    const rest = s.rest.filter((a) => {
      if (/^-\d+$/.test(a)) {
        n = Number(a.slice(1));
        return false;
      }
      return true;
    });
    const l = lines(await joined(rest, io));
    io.write((tail ? l.slice(Math.max(0, l.length - n)) : l.slice(0, n)).join("\n") + "\n");
  };

  return {
    echo: (args, io) => {
      let rest = args;
      let noNewline = false;
      let interpret = false;
      while (rest.length && /^-[neE]+$/.test(rest[0]!)) {
        if (rest[0]!.includes("n")) noNewline = true;
        if (rest[0]!.includes("e")) interpret = true;
        rest = rest.slice(1);
      }
      const text = rest.join(" ");
      io.write((interpret ? escapes(text) : text) + (noNewline ? "" : "\n"));
    },
    printf: (args, io) => {
      if (!args.length) return usage("printf", io);
      const rest = args.slice(1);
      io.write(
        escapes(args[0]!).replace(/%([sdxc%])/g, (_m, c: string) => {
          if (c === "%") return "%";
          const v = rest.shift() ?? "";
          return c === "d" ? String(parseInt(v, 10) || 0) : c === "x" ? (parseInt(v, 10) || 0).toString(16) : c === "c" ? v.charAt(0) : v;
        }),
      );
      return 0;
    },
    seq: (args, io) => {
      const n = args.map(Number);
      const a = n.length > 1 ? n[0]! : 1;
      const b = n.length > 1 ? n[1]! : n[0]!;
      if (n.length === 0 || Number.isNaN(a) || Number.isNaN(b)) return usage("seq", io);
      for (let i = a; i <= b && i - a < 10000; i++) io.writeln(String(i));
      return 0;
    },
    yes: (args, io) => {
      const text = args.join(" ") || "y";
      for (let i = 0; i < 200; i++) io.writeln(text);
    },
    head: headTail(false),
    tail: headTail(true),
    tac: async (args, io) => void io.write(lines(await joined(args, io)).reverse().join("\n") + "\n"),
    rev: async (args, io) => void io.write(lines(await joined(args, io)).map((l) => [...l].reverse().join("")).join("\n") + "\n"),
    wc: async (args, io) => {
      const s = splitFlags(args);
      for (const it of await gather(sh, s.rest, io)) {
        const text = decodeBytes(it.bytes).text;
        const l = (text.match(/\n/g) ?? []).length;
        const w = (text.match(/\S+/g) ?? []).length;
        const c = it.bytes.length;
        const cols = s.flags.l ? [l] : s.flags.w ? [w] : s.flags.c ? [c] : [l, w, c];
        io.writeln(cols.map((x) => String(x).padStart(cols.length > 1 ? 7 : 0)).join("") + (it.name === "-" ? "" : ` ${it.name}`));
      }
    },
    sort: async (args, io) => {
      const s = splitFlags(args);
      let l = lines(await joined(s.rest, io));
      l.sort(s.flags.n ? (a, b) => parseFloat(a) - parseFloat(b) : (a, b) => (a < b ? -1 : a > b ? 1 : 0));
      if (s.flags.r) l.reverse();
      if (s.flags.u) l = l.filter((x, i) => i === 0 || x !== l[i - 1]);
      io.write(l.join("\n") + "\n");
    },
    uniq: async (args, io) => {
      const s = splitFlags(args);
      const out: { l: string; n: number }[] = [];
      for (const l of lines(await joined(s.rest, io))) {
        const prev = out[out.length - 1];
        if (prev && prev.l === l) prev.n++;
        else out.push({ l, n: 1 });
      }
      io.write(out.map((o) => (s.flags.c ? String(o.n).padStart(7) + " " : "") + o.l).join("\n") + "\n");
    },
    grep: async (args, io) => {
      const s = splitFlags(args);
      if (!s.rest.length) return usage("grep", io);
      let re: RegExp;
      try {
        re = new RegExp(s.rest[0]!, s.flags.i ? "i" : "");
      } catch {
        return io.err("grep: invalid regular expression"), 2;
      }
      let files = s.rest.slice(1);
      const recursive = !!(s.flags.r || s.flags.R);
      if (recursive) {
        files = [];
        for (const f of s.rest.length > 1 ? s.rest.slice(1) : ["."])
          sh.vfs.walk(sh.vfs.norm(f), (abs, node) => {
            if (node.type === "file") files.push(abs);
          });
      }
      const items = await gather(sh, files, io);
      let matched = 0;
      for (const it of items) {
        let count = 0;
        lines(decodeBytes(it.bytes).text).forEach((l, i) => {
          if (re.test(l) === !s.flags.v) {
            count++;
            matched++;
            if (!s.flags.c) io.writeln((items.length > 1 || recursive ? `${it.name}:` : "") + (s.flags.n ? `${i + 1}:` : "") + l);
          }
        });
        if (s.flags.c) io.writeln((items.length > 1 ? `${it.name}:` : "") + count);
      }
      return matched ? 0 : 1;
    },
    tr: (args, io) => {
      const s = splitFlags(args);
      const text = stdinText(io);
      if (!s.rest.length) return usage("tr", io);
      if (text === null) return 1;
      const from = expandSet(s.rest[0]!);
      const to = s.rest[1] ? expandSet(s.rest[1]) : [];
      let out = "";
      for (const ch of text) {
        const idx = from.indexOf(ch);
        if (idx < 0) out += ch;
        else if (s.flags.d) continue;
        else out += to.length ? to[Math.min(idx, to.length - 1)] : ch;
      }
      io.write(out);
      return 0;
    },
    cut: async (args, io) => {
      const s = splitFlags(args, ["d", "f"]);
      const delim = typeof s.flags.d === "string" ? s.flags.d : "\t";
      const spec = parseCut(typeof s.flags.f === "string" ? s.flags.f : "1");
      io.write(
        lines(await joined(s.rest, io))
          .map((l) => l.split(delim).filter((_c, i) => spec.some(([a, b]) => i + 1 >= a && i + 1 <= b)).join(delim))
          .join("\n") + "\n",
      );
    },
  };
};

