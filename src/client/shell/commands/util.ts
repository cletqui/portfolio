import { decodeBytes, encoder, latin1ToBytes } from "../../shared/bytes";
import type { Shell } from "../shell";
import type { IO } from "../types";

export interface Flags {
  flags: Record<string, string | true>;
  rest: string[];
}

export const splitFlags = (args: string[], valueFlags: string[] = []): Flags => {
  const flags: Flags["flags"] = {};
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a === "--") {
      rest.push(...args.slice(i + 1));
      break;
    }
    if (a.length > 1 && a.startsWith("-") && !/^-\d+$/.test(a)) {
      if (a.startsWith("--")) {
        flags[a.slice(2)] = true;
        continue;
      }
      for (let j = 1; j < a.length; j++) {
        const f = a.charAt(j);
        if (valueFlags.includes(f)) {
          flags[f] = j + 1 < a.length ? a.slice(j + 1) : (args[++i] ?? "");
          break;
        }
        flags[f] = true;
      }
    } else rest.push(a);
  }
  return { flags, rest };
};

export const numFlag = (flags: Flags["flags"], name: string, fallback: number): number => {
  const v = flags[name];
  return typeof v === "string" && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : fallback;
};

export const lines = (text: string): string[] => {
  const l = text.split("\n");
  if (l.length && l[l.length - 1] === "") l.pop();
  return l;
};

export const stdinBytes = (io: IO): Uint8Array | null =>
  io.stdin ? (io.stdin.bin ? latin1ToBytes(io.stdin.text) : encoder.encode(io.stdin.text)) : null;

export const stdinText = (io: IO): string | null => (io.stdin ? io.stdin.text : null);

export interface Source {
  name: string;
  bytes: Uint8Array;
}

export const gather = async (sh: Shell, files: string[], io: IO): Promise<Source[]> => {
  if (!files.length) {
    const b = stdinBytes(io);
    return b ? [{ name: "-", bytes: b }] : [];
  }
  const out: Source[] = [];
  for (const f of files) {
    const r = await sh.vfs.read(f);
    if (r.ok) out.push({ name: f, bytes: r.bytes });
    else io.err(`${f}: ${r.err}`);
  }
  return out;
};

export const emit = (bytes: Uint8Array, io: IO): void => {
  const d = decodeBytes(bytes);
  if (d.binary) io.bin();
  io.write(d.text);
};

export const textOf = (items: Source[], io: IO): string =>
  items
    .map((it) => {
      const d = decodeBytes(it.bytes);
      if (d.binary) io.bin();
      return d.text;
    })
    .join("");

export const usage = (name: string, io: IO): number => {
  io.err(`usage: ${USAGE[name] ?? name}`);
  return 2;
};

export const USAGE: Record<string, string> = {
  ls: "ls [-a] [-l] [-1] [path...]",
  cat: "cat [-n] [file...]  (reads stdin without args)",
  cd: "cd [dir|-]",
  grep: "grep [-i] [-v] [-n] [-c] [-r] pattern [file...]",
  head: "head [-n N] [file...]",
  tail: "tail [-n N] [file...]",
  wc: "wc [-l|-w|-c] [file...]",
  sort: "sort [-r] [-n] [-u] [file...]",
  uniq: "uniq [-c] [file...]",
  tr: "tr [-d] SET1 [SET2]   (stdin)",
  cut: "cut -d DELIM -f LIST [file...]",
  base64: "base64 [-d] [file]",
  rot13: "rot13 [file]",
  xxd: "xxd [-p] [-r] [-l LEN] [-s OFFSET] [file]",
  strings: "strings [-n MIN] [file...]",
  sha256sum: "sha256sum [file...]",
  jwt: "jwt <token>",
  find: "find [path] [-name PATTERN] [-type f|d]",
  tree: "tree [-a] [path]",
  file: "file <file...>",
  ctf: "ctf [status|list [category|solved|unsolved]|hint <id>|submit <flag>]",
  cowsay: "cowsay [text]",
  figlet: "figlet [text]",
  lolcat: "lolcat [text]  (or pipe into it)",
  date: "date [-u] [-d @EPOCH] [+FORMAT]",
  su: "su [root]",
  echo: "echo [-n] [-e] text",
  seq: "seq [first] last",
  printf: "printf FORMAT [args...]",
  urlencode: "urlencode <text>",
  rm: "rm [-r] [-f] file...",
  cp: "cp src dst",
  mv: "mv src dst",
  mkdir: "mkdir dir...",
  touch: "touch file...",
};
