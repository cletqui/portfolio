import { decodeEmail } from "../../../data/email-codec";
import { FAKE_GIT_LOG } from "../content";
import { classify, connectFailure, parseTarget } from "./net";
import { splitFlags } from "./util";
import type { Shell } from "../shell";
import type { CommandMap, Segment } from "../types";

const QUOTES = [
  "There is no patch for human stupidity. — everyone, eventually",
  "Security is a process, not a product. — Bruce Schneier",
  "The S in IoT stands for security.",
  "It's not DNS. There's no way it's DNS. It was DNS.",
  "Trust, but verify. Then verify the verifier.",
  "Weeks of coding can save you hours of planning.",
  "Passwords are like underwear: don't share them, change them often.",
  "There are 10 kinds of people: those who understand binary and those who don't.",
  "To err is human. To really mess up, you need root.",
];

const LOGO = ["   ▄▄▄▄▄▄   ", "  █      █  ", " █  ▄▄▄▄  █ ", " █ █    █ █ ", " █  ▀▀▀▀  █ ", "  █      █  ", "   ▀▀▀▀▀▀   "];

export const siteCommands = (sh: Shell): CommandMap => {
  const { t, data } = sh;
  const goTo = (io: Parameters<CommandMap[string]>[1], url: string, message: string) => {
    io.writeln(message);
    sh.go(url);
  };
  const joke = (text: string): CommandMap[string] => (_a, io) => void io.writeln(text);

  return {
    curl: async (args, io) => {
      const s = splitFlags(args, ["A", "H", "X", "o", "m"]);
      const url = s.rest[0] ?? "";
      if (!url) return io.err("curl: try 'curl --help' or 'curl --manual' for more information"), 2;
      const target = parseTarget(url);
      if (!target.host) return io.err(`curl: (3) URL rejected: No host part in the URL`), 3;
      if (target.scheme && !/^https?$/.test(target.scheme)) return io.err(`curl: (1) Protocol "${target.scheme}" not supported`), 1;
      const port = target.port ?? (target.scheme === "http" ? "80" : "443");
      const kind = classify(target.host);
      if (kind === "name") return io.err(`curl: (6) Could not resolve host: ${target.host}`), 6;
      const open = kind === "self" && (port === "443" || port === "80");
      if (!open) {
        const why = connectFailure(kind, false);
        return io.err(`curl: (7) Failed to connect to ${target.host} port ${port} after ${why === "Connection refused" ? 1 : 2049} ms: ${why === "Connection refused" ? "Couldn't connect to server" : why === "No route to host" ? "No route to host" : "Connection timed out"}`), 7;
      }
      if (!target.path || target.path === "/") return io.writeln(data.card), 0;
      try {
        const res = await sh.deps.fetch(target.path, { headers: { accept: "text/plain, */*" } });
        const body = await res.text();
        if (/[\u0000-\u0008]/.test(body.slice(0, 512))) io.bin();
        io.write(body);
        return s.flags.f && !res.ok ? 22 : 0;
      } catch {
        return io.err(`curl: (7) Failed to connect to ${target.host} port ${port}: Couldn't connect to server`), 7;
      }
    },
    gpg: (_a, io) => {
      io.writeln(`pub   ed25519 0x${data.pgpId} [SC]`);
      io.writeln("      " + data.pgp.replace(/(.{4})/g, "$1 ").trim());
      const mail = decodeEmail(data.email);
      io.writeln(`uid   <${mail}>`);
      io.writeln(t(`key: https://www.cybai.re/pgp.asc  ·  gpg --locate-keys ${mail}`, `clé : https://www.cybai.re/pgp.asc  ·  gpg --locate-keys ${mail}`));
    },
    neofetch: (_a, io) => {
      const browser = /(Firefox|Edg|Chrome|Safari)\/[\d.]+/.exec(sh.deps.userAgent)?.[0] ?? (sh.deps.userAgent || "unknown");
      const info = [
        `${sh.user}@cybai.re`,
        "----------------",
        "OS: CybaiOS 1.2",
        "Host: Cloudflare Pages",
        "Shell: cybai-sh",
        "Stack: Hono · Tailwind · TypeScript",
        `Client: ${browser}`,
        `Resolution: ${sh.deps.screenSize}`,
      ];
      const rows: Segment[][] = [];
      for (let i = 0; i < Math.max(LOGO.length, info.length); i++)
        rows.push([{ t: LOGO[i] ?? " ".repeat(12), c: "#22c55e" }, { t: "  " + (info[i] ?? "") }]);
      io.rich(rows);
    },
    theme: (args, io) => {
      const next = args[0] === "dark" || args[0] === "light" ? args[0] : undefined;
      io.writeln(`theme: ${sh.deps.setTheme(next)}`);
    },
    lang: (args, io) => {
      const next = args[0] === "en" || args[0] === "fr" ? args[0] : sh.term.lang === "fr" ? "en" : "fr";
      goTo(io, "/" + next, `lang: ${next}`);
    },
    fortune: (_a, io) => void io.writeln(QUOTES[Math.floor(sh.deps.random() * QUOTES.length)]!),
    ping: (args, io) => {
      const host = args[0] ?? "cybai.re";
      io.writeln(`PING ${host} 56(84) bytes of data.`);
      io.writeln(`64 bytes from ${host}: icmp_seq=1 ttl=118 time=1.337 ms`);
      io.writeln(`64 bytes from ${host}: icmp_seq=2 ttl=118 time=1.337 ms`);
    },
    nmap: joke("Starting Nmap 7.99 ( https://nmap.org )\nPORT     STATE SERVICE  VERSION\n80/tcp   open  http     Cloudflare http proxy\n443/tcp  open  ssl/http Cloudflare http proxy\nNo, I will not tell you what is behind it."),
    ssh: (args, io) => {
      let port = "22";
      let dest = "";
      for (let i = 0; i < args.length; i++) {
        const a = args[i]!;
        if (a === "-p") port = args[++i] ?? "";
        else if (a.startsWith("-p")) port = a.slice(2);
        else if (a === "-l") i++;
        else if (a === "-i" || a === "-o" || a === "-F" || a === "-J") i++;
        else if (a.startsWith("-")) continue;
        else if (!dest) dest = a;
      }
      if (!dest) return io.err("usage: ssh [-l login_name] [-p port] [user@]hostname"), 255;
      if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) return io.err(`Bad port '${port}'`), 255;
      const target = parseTarget(dest);
      if (target.user === "") return io.err("ssh: Could not resolve hostname : Name or service not known"), 255;
      if (!target.host) return io.err("ssh: Could not resolve hostname : Name or service not known"), 255;
      const kind = classify(target.host);
      if (kind === "name") return io.err(`ssh: Could not resolve hostname ${target.host}: Name or service not known`), 255;
      const open = kind === "self" && port === "22";
      if (!open) return io.err(`ssh: connect to host ${target.host} port ${port}: ${connectFailure(kind, false)}`), 255;
      io.writeln(t("You are already logged in there. Inception is not implemented.", "Tu y es déjà connecté. Inception n'est pas implémenté."));
      return 0;
    },
    vim: joke("You are now trapped. Good luck. (:q! does nothing here.)"),
    nvim: joke("You are now trapped. Good luck. (:q! does nothing here.)"),
    vi: joke("You are now trapped. Good luck. (:q! does nothing here.)"),
    nano: joke("nano: this editor is too sensible for this place. Try vim."),
    hack: joke("[#####               ] 25% bypassing firewall\n[##########          ] 50% reticulating splines\n[###############     ] 75% sweet-talking the kernel\n[####################] 100% just kidding. Try `help`."),
    telnet: (args, io) => {
      if ((args[0] ?? "").includes("blinkenlights")) {
        io.writeln("Trying 213.136.8.188...\nConnected to towel.blinkenlights.nl.\n");
        io.writeln("      A long time ago in a galaxy far, far away....\n\n    It is a period of civil war. Rebel spaceships,\n    striking from a hidden base, have won their first\n    victory against the evil Galactic Empire.\n\n    (the rest of the film is rate-limited by your patience)");
        return 0;
      }
      const [host, port = "23"] = args.filter((x) => !x.startsWith("-"));
      if (!host) return io.writeln("telnet> "), 0;
      if (!/^\d+$/.test(port)) return io.err(`${port}: bad port`), 1;
      const kind = classify(host);
      if (kind === "name") return io.err(`telnet: could not resolve ${host}: Name or service not known`), 1;
      io.writeln(`Trying ${host}...`);
      return io.err(`telnet: Unable to connect to remote host: ${connectFailure(kind, false)}`), 1;
    },
    git: (args, io) => {
      if (!sh.cwd.startsWith("/var/www")) return io.err("fatal: not a git repository (or any of the parent directories): .git"), 128;
      switch (args[0]) {
        case "log": return io.writeln(FAKE_GIT_LOG), 0;
        case "status": return io.writeln("On branch main\nnothing to commit, working tree clean"), 0;
        case "show": return io.writeln(`fatal: bad object ${args[1] ?? "HEAD"}\n(the real history is not stored here, and you know it)`), 128;
        default: return io.err(`git: '${args[0] ?? ""}' is not a git command here.`), 1;
      }
    },
  };
};
