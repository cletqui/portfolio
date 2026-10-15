import { CLIENT_FLAGS, ROOT_PASSWORD } from "../../shared/flags";
import type { Shell } from "../shell";
import type { CommandMap } from "../types";
import { scorchedEarth } from "./eggs";
import { splitFlags, usage } from "./util";

const SCORCH = /^rm( -[a-z]+)* --no-preserve-root( -[a-z]+)* \/\*?$/;

const pad2 = (n: number): string => String(n).padStart(2, "0");

export const formatDate = (d: Date, utc: boolean, format?: string): string => {
  const Y = utc ? d.getUTCFullYear() : d.getFullYear();
  const M = (utc ? d.getUTCMonth() : d.getMonth()) + 1;
  const D = utc ? d.getUTCDate() : d.getDate();
  const h = utc ? d.getUTCHours() : d.getHours();
  const m = utc ? d.getUTCMinutes() : d.getMinutes();
  const s = utc ? d.getUTCSeconds() : d.getSeconds();
  if (!format) return utc ? d.toUTCString().replace("GMT", "UTC") : d.toString();
  return format.replace(/%([sFTYmdHMSZ%])/g, (_x, c: string) => {
    switch (c) {
      case "s": return String(Math.floor(d.getTime() / 1000));
      case "F": return `${Y}-${pad2(M)}-${pad2(D)}`;
      case "T": return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
      case "Y": return String(Y);
      case "m": return pad2(M);
      case "d": return pad2(D);
      case "H": return pad2(h);
      case "M": return pad2(m);
      case "S": return pad2(s);
      case "Z": return utc ? "UTC" : "";
      default: return "%";
    }
  });
};

export const systemCommands = (sh: Shell): CommandMap => {
  const { t } = sh;

  const login = (): void => {
    sh.user = "root";
    sh.env.USER = "root";
    sh.env.HOME = "/root";
    sh.oldpwd = sh.cwd;
    sh.cwd = "/root";
    sh.refreshPrompt();
  };
  const logout = (): void => {
    sh.user = "guest";
    sh.env.USER = "guest";
    sh.env.HOME = "/home/guest";
    sh.cwd = sh.env.HOME;
    sh.refreshPrompt();
  };

  const leave: CommandMap[string] = (_a, io) => {
    if (sh.user === "root") {
      logout();
      io.writeln("logout");
    } else io.writeln(t("logout\nThere is nowhere to go. This is the web.", "logout\nIl n'y a nulle part où aller. C'est le web."));
  };

  return {
    clear: () => void sh.term.clear(),
    whoami: (_a, io) => {
      io.writeln(sh.user);
      if (sh.user === "guest") io.writeln(t("(guest session — your token: curl https://www.cybai.re/ctf/whoami)", "(session invité — ton jeton : curl https://www.cybai.re/ctf/whoami)"));
    },
    id: (_a, io) =>
      void io.writeln(sh.user === "root" ? "uid=0(root) gid=0(root) groups=0(root)" : "uid=1000(guest) gid=1000(guest) groups=1000(guest),1337(curious)"),
    hostname: (_a, io) => void io.writeln("cybai.re"),
    uname: (args, io) => {
      const f = splitFlags(args).flags;
      io.writeln(f.r ? "6.18-cybai" : f.s ? "CybaiOS" : `CybaiOS cybai.re 6.18-cybai #1 SMP ${new Date(sh.deps.now()).getFullYear()} x86_64 Hono/Workers`);
    },
    uptime: (_a, io) => {
      const mins = Math.max(1, Math.round((sh.deps.now() - sh.bootTime) / 60000));
      io.writeln(` ${new Date(sh.deps.now()).toLocaleTimeString()} up ${mins} min, 1 user, load average: 0.00, 0.01, 0.00`);
    },
    env: (_a, io) => void Object.entries(sh.env).forEach(([k, v]) => io.writeln(`${k}=${v}`)),
    export: (args) => {
      for (const a of args) {
        const eq = a.indexOf("=");
        if (eq > 0) sh.env[a.slice(0, eq)] = a.slice(eq + 1);
      }
    },
    history: (args, io) => {
      if (args[0] === "-c") {
        sh.history = [];
        sh.historyIndex = 0;
      } else sh.history.forEach((h, i) => io.writeln(`${String(i + 1).padStart(4)}  ${h}`));
    },
    date: (args, io) => {
      const s = splitFlags(args, ["d"]);
      let d = new Date(sh.deps.now());
      if (typeof s.flags.d === "string") {
        const v = s.flags.d;
        const ms = v.startsWith("@") ? Number(v.slice(1)) * 1000 : Date.parse(v);
        if (Number.isNaN(ms)) return io.err(`date: invalid date '${v}'`), 1;
        d = new Date(ms);
      }
      const format = s.rest.find((x) => x.startsWith("+"));
      io.writeln(formatDate(d, !!s.flags.u, format?.slice(1)));
      const epoch = Math.floor(d.getTime() / 1000);
      if (epoch > 2147483647) {
        const wrapped = formatDate(new Date((epoch - 4294967296) * 1000), true);
        io.writeln(t(`(in a 32-bit time_t this would wrap to ${wrapped})`, `(avec un time_t 32 bits, ça reviendrait à ${wrapped})`));
      }
      return 0;
    },
    cal: (_a, io) => {
      const d = new Date(sh.deps.now());
      const first = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
      const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const title = d.toLocaleString(sh.term.lang === "fr" ? "fr-FR" : "en-US", { month: "long", year: "numeric" });
      io.writeln(title.padStart(Math.floor((20 + title.length) / 2)));
      io.writeln(t("Su Mo Tu We Th Fr Sa", "Di Lu Ma Me Je Ve Sa"));
      let row = "   ".repeat(first);
      for (let day = 1; day <= days; day++) {
        row += String(day).padStart(2) + " ";
        if ((first + day) % 7 === 0) {
          io.writeln(row.trimEnd());
          row = "";
        }
      }
      if (row) io.writeln(row.trimEnd());
    },
    exit: leave,
    logout: leave,
    su: (args, io) => {
      const target = splitFlags(args).rest[0] ?? "root";
      if (target !== "root") return io.err(`su: user ${target} does not exist`), 1;
      if (sh.user === "root") return 0;
      sh.setMode({
        prompt: "Password:",
        masked: true,
        onLine: async (password) => {
          sh.endMode();
          await sh.deps.sleep(900);
          if (password === ROOT_PASSWORD) {
            login();
            sh.print(t("You are now root. With great power…", "Tu es maintenant root. Un grand pouvoir…"), "text-green-500");
          } else sh.errLine("su: Authentication failure");
        },
        onCtrlC: () => {
          sh.endMode();
          sh.print("^C");
        },
      });
      return 0;
    },
    sudo: (args, io) => {
      const phrase = args.join(" ").replace(/\s+/g, " ").toLowerCase();
      if (phrase === "make me a sandwich") {
        io.writeln("Okay.");
        sh.award(CLIENT_FLAGS.sudo);
        return 0;
      }
      if (sh.user === "root") return args.length ? sh.runStages([{ argv: args, redir: null }]) : usage("sudo", io);
      if (SCORCH.test(phrase)) return scorchedEarth(sh);
      if (args[0] === "-l") return io.writeln("Sorry, user guest may not run sudo on cybai."), 1;
      return io.err("guest is not in the sudoers file. This incident will be reported."), 1;
    },
  };
};
