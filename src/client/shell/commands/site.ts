import { aboutText, contactText, FAKE_GIT_LOG, projectsText } from "../content";
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

const PAGES: Record<string, string> = {
  about: "/about/me",
  me: "/about/me",
  you: "/about/you",
  projects: "/projects",
  contact: "/contact",
  ctf: "/ctf",
  home: "/",
  now: "/now",
  epochalypse: "/projects/epochalypse",
};

const LOGO = ["   ▄▄▄▄▄▄   ", "  █      █  ", " █  ▄▄▄▄  █ ", " █ █    █ █ ", " █  ▀▀▀▀  █ ", "  █      █  ", "   ▀▀▀▀▀▀   "];

export const siteCommands = (sh: Shell): CommandMap => {
  const { t, data } = sh;
  const goTo = (io: Parameters<CommandMap[string]>[1], url: string, message: string) => {
    io.writeln(message);
    sh.go(url);
  };
  const joke = (text: string): CommandMap[string] => (_a, io) => void io.writeln(text);

  return {
    about: (_a, io) => void io.writeln(aboutText(t)),
    contact: (_a, io) => void io.writeln(contactText(data)),
    projects: (_a, io) => void io.writeln(projectsText(data, t)),
    now: (_a, io) => void io.writeln(t("See /now — `open now`.", "Voir /now — `open now`.")),
    open: (args, io) => {
      const dest = PAGES[args[0] ?? ""];
      if (!dest) return io.err("usage: open about|you|projects|contact|ctf|now|epochalypse"), 1;
      goTo(io, dest, `opening ${dest} …`);
      return 0;
    },
    curl: (args, io) => {
      const url = args.find((a) => !a.startsWith("-")) ?? "";
      if (/^(https?:\/\/)?(www\.)?cybai\.re\/?$/.test(url)) return io.writeln(data.card), 0;
      if (!url) return io.err("curl: try 'curl --help' or 'curl --manual' for more information"), 2;
      return io.err(`curl: (6) Could not resolve host: ${url.replace(/^https?:\/\//, "").split("/")[0]}`), 6;
    },
    gpg: (_a, io) => {
      io.writeln(`pub   ed25519 0x${data.pgpId} [SC]`);
      io.writeln("      " + data.pgp.replace(/(.{4})/g, "$1 ").trim());
      io.writeln("uid   <admin@cybai.re>");
      io.writeln(t("key: https://www.cybai.re/pgp.asc  ·  gpg --locate-keys admin@cybai.re", "clé : https://www.cybai.re/pgp.asc  ·  gpg --locate-keys admin@cybai.re"));
    },
    neofetch: (_a, io) => {
      const browser = /(Firefox|Edg|Chrome|Safari)\/[\d.]+/.exec(sh.deps.userAgent)?.[0] ?? "unknown";
      const info = [
        `${sh.user}@cybai.re`,
        "----------------",
        "OS: CybaiOS 1.2",
        "Host: Cloudflare Pages",
        "Shell: cybai-sh",
        "Stack: Hono · Tailwind · TypeScript",
        `Browser: ${browser}`,
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
    ssh: (_a, io) => void goTo(io, "/contact", "Connecting to cybai.re … opening /contact"),
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
      return io.err(`telnet: could not resolve ${args[0] ?? ""}: Name or service not known`), 1;
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
