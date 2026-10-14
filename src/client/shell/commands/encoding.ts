import { b64ToBytes, b64UrlDecode, bytesToB64, bytesToLatin1, decodeBytes, fromHex, hex2, toHex } from "../../shared/bytes";
import { digest } from "../../shared/hash";
import type { Shell } from "../shell";
import type { CommandMap, IO } from "../types";
import { emit, gather, numFlag, splitFlags, stdinText, textOf, usage } from "./util";

export const rot13 = (text: string): string =>
  text.replace(/[a-z]/gi, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });

export const xxdDump = (view: Uint8Array, start: number, cols: number): string[] => {
  const out: string[] = [];
  for (let off = 0; off < view.length; off += cols) {
    const chunk = view.subarray(off, off + cols);
    let groups = "";
    let ascii = "";
    for (let k = 0; k < cols; k++) {
      if (k < chunk.length) {
        groups += hex2(chunk[k]!);
        ascii += chunk[k]! >= 32 && chunk[k]! < 127 ? String.fromCharCode(chunk[k]!) : ".";
      } else groups += "  ";
      if (k % 2 === 1) groups += " ";
    }
    out.push(`${(start + off).toString(16).padStart(8, "0")}: ${groups} ${ascii}`);
  }
  return out;
};

export const xxdReverse = (text: string, plain: boolean): Uint8Array | null => {
  const hex = plain
    ? text.replace(/\s+/g, "")
    : text
        .split("\n")
        .map((l) => /^[0-9a-fA-F]+:\s*((?:[0-9a-fA-F]{2,4} ?)+)/.exec(l)?.[1]?.replace(/\s+/g, "") ?? "")
        .join("");
  return fromHex(hex);
};

export const stringsOf = (bytes: Uint8Array, min: number): string[] => {
  const out: string[] = [];
  let run = "";
  const flush = () => {
    if (run.length >= min) out.push(run);
    run = "";
  };
  for (const b of bytes) {
    if ((b >= 32 && b < 127) || b === 9) run += String.fromCharCode(b);
    else flush();
  }
  flush();
  return out;
};

const hashCommand =
  (sh: Shell, algorithm: "SHA-1" | "SHA-256" | "SHA-512") =>
  async (args: string[], io: IO) => {
    for (const it of await gather(sh, args, io)) io.writeln(`${await digest(algorithm, it.bytes)}  ${it.name}`);
  };

export const encodingCommands = (sh: Shell): CommandMap => ({
  base64: async (args, io) => {
    const s = splitFlags(args, ["w"]);
    const items = await gather(sh, s.rest, io);
    if (!items.length) return 1;
    const bytes = items[0]!.bytes;
    if (s.flags.d || s.flags.decode) {
      try {
        emit(b64ToBytes(bytesToLatin1(bytes).replace(/\s+/g, "")), io);
      } catch {
        return io.err("base64: invalid input"), 1;
      }
      return 0;
    }
    const wrap = numFlag(s.flags, "w", 76);
    const b64 = bytesToB64(bytes);
    io.writeln(wrap > 0 ? b64.replace(new RegExp(`(.{${wrap}})`, "g"), "$1\n").replace(/\n$/, "") : b64);
    return 0;
  },
  rot13: async (args, io) => void io.write(rot13(textOf(await gather(sh, args, io), io))),
  urlencode: (args, io) => void io.writeln(encodeURIComponent((args.length ? args.join(" ") : (stdinText(io) ?? "")).replace(/\n$/, ""))),
  urldecode: (args, io) => {
    try {
      io.writeln(decodeURIComponent((args.length ? args.join(" ") : (stdinText(io) ?? "")).trim()));
      return 0;
    } catch {
      return io.err("urldecode: malformed input"), 1;
    }
  },
  xxd: async (args, io) => {
    const s = splitFlags(args, ["l", "s", "c"]);
    const items = await gather(sh, s.rest, io);
    if (!items.length) return 1;
    const bytes = items[0]!.bytes;
    if (s.flags.r) {
      const out = xxdReverse(decodeBytes(bytes).text, !!s.flags.p);
      if (!out) return io.err("xxd: invalid hex input"), 1;
      emit(out, io);
      return 0;
    }
    const start = numFlag(s.flags, "s", 0);
    const end = s.flags.l ? start + numFlag(s.flags, "l", bytes.length) : bytes.length;
    const view = bytes.subarray(start, Math.min(end, bytes.length));
    if (s.flags.p) io.writeln(toHex(view).replace(/(.{60})/g, "$1\n").replace(/\n$/, ""));
    else xxdDump(view, start, numFlag(s.flags, "c", 16)).forEach((l) => io.writeln(l));
    return 0;
  },
  strings: async (args, io) => {
    const s = splitFlags(args, ["n"]);
    for (const it of await gather(sh, s.rest, io)) stringsOf(it.bytes, numFlag(s.flags, "n", 4)).forEach((l) => io.writeln(l));
  },
  sha256sum: hashCommand(sh, "SHA-256"),
  sha1sum: hashCommand(sh, "SHA-1"),
  sha512sum: hashCommand(sh, "SHA-512"),
  jwt: (args, io) => {
    const token = (args[0] ?? stdinText(io) ?? "").trim();
    const parts = token.split(".");
    if (parts.length < 2) return usage("jwt", io);
    try {
      io.writeln("header:    " + JSON.stringify(JSON.parse(b64UrlDecode(parts[0]!))));
      io.writeln("payload:   " + JSON.stringify(JSON.parse(b64UrlDecode(parts[1]!))));
      io.writeln("signature: " + (parts[2] || "(none)"));
      return 0;
    } catch {
      return io.err("jwt: not a valid token"), 1;
    }
  },
});

export const aliasHexdump = (cmds: CommandMap): void => {
  cmds.hexdump = cmds.xxd!;
};
