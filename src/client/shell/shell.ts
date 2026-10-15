import { makeT, type Translate } from "../shared/i18n";
import { createCommands } from "./commands";
import { forkBomb } from "./commands/eggs";
import { HIDDEN } from "./commands/manual";
import { buildTree, VFS, type SessionView } from "./fs";
import { parse, type Stage } from "./parser";
import type { CommandMap, Deps, GameApi, IO, KeyLike, Mode, ShellData, StdStream, Term } from "./types";

export interface KeyResult {
  prevent: boolean;
  value?: string;
}

export interface Completion {
  value?: string;
  options?: string[];
}

export class Shell implements SessionView {
  readonly t: Translate;
  readonly vfs: VFS;
  readonly cmds: CommandMap;
  readonly bootTime: number;
  readonly env: Record<string, string>;
  user = "guest";
  cwd = "/home/guest";
  oldpwd = "/home/guest";
  history: string[] = [];
  historyIndex = 0;
  lastStatus = 0;
  busy = false;
  cancelled = false;
  mode: Mode | null = null;
  heardPlugh = false;

  constructor(
    readonly term: Term,
    readonly data: ShellData,
    readonly deps: Deps,
  ) {
    this.t = makeT(term.lang);
    this.bootTime = deps.now();
    this.env = {
      USER: "guest",
      HOME: "/home/guest",
      SHELL: "/bin/cybai-sh",
      HOSTNAME: "cybai.re",
      CDPATH: ".:/home/guest",
      TERM: "xterm-256color",
      LANG: term.lang === "fr" ? "fr_FR.UTF-8" : "en_US.UTF-8",
    };
    this.vfs = new VFS(buildTree(data, this.t), this, deps.fetch);
    this.cmds = createCommands(this);
  }

  get home(): string {
    return this.env.HOME ?? "/";
  }

  /* PROMPT & MODES */
  pwdShort(): string {
    if (this.cwd === this.home) return "~";
    if (this.cwd.startsWith(this.home + "/")) return "~" + this.cwd.slice(this.home.length);
    return this.cwd;
  }
  promptText(): string {
    return `${this.user}@cybai.re:${this.pwdShort()}${this.user === "root" ? "#" : "$"}`;
  }
  refreshPrompt(): void {
    const custom = this.mode?.prompt;
    this.term.setPrompt(custom ?? this.promptText(), this.user === "root" && !custom ? "#ef4444" : undefined);
    this.term.setMasked(!!this.mode?.masked);
  }
  setMode(mode: Mode): void {
    this.mode = mode;
    this.refreshPrompt();
    this.term.focus();
  }
  endMode(): void {
    this.mode = null;
    this.refreshPrompt();
  }

  /* OUTPUT */
  print(text: string, cls?: string): void {
    this.term.print(text, cls);
  }
  errLine(text: string): void {
    this.term.print(text, "text-destructive");
  }
  award(flag: string): void {
    this.print("");
    this.print(`🏁 ${flag}`, "text-green-500 font-semibold");
    this.print(
      this.t(`   submit it with: ctf submit ${flag}`, `   soumets-le avec : ctf submit ${flag}`),
      "text-muted-foreground",
    );
  }
  go(url: string): void {
    this.deps.navigate(url);
  }

  gameApi(): GameApi {
    return {
      t: this.t,
      lang: this.term.lang,
      reducedMotion: this.term.reducedMotion,
      width: () => this.term.width(),
      print: (text, cls) => this.print(text, cls),
      printRich: (lines) => this.term.printRich(lines),
      scroll: () => this.term.scroll(),
      canvas: (cls) => this.term.canvas(cls),
      setMode: (mode) => this.setMode(mode),
      endMode: () => this.endMode(),
      award: (flag) => this.award(flag),
      sleep: (ms) => this.deps.sleep(ms),
      isCancelled: () => this.cancelled,
      random: () => this.deps.random(),
    };
  }

  /* EXECUTION */
  private expansion() {
    return {
      env: this.env,
      lastStatus: this.lastStatus,
      home: this.home,
      glob: (word: string) => this.vfs.glob(word),
    };
  }

  async runStages(stages: Stage[]): Promise<number> {
    let input: StdStream | null = null;
    let status = 0;
    for (let idx = 0; idx < stages.length; idx++) {
      const stage = stages[idx]!;
      const last = idx === stages.length - 1;
      const out: StdStream = { text: "", bin: false };
      const io: IO = {
        stdin: input,
        last,
        write: (s) => void (out.text += s),
        writeln: (s) => void (out.text += s + "\n"),
        err: (s) => this.errLine(s),
        bin: () => void (out.bin = true),
        rich: (lines) => {
          if (last && !stage.redir) this.term.printRich(lines);
          else out.text += lines.map((segs) => segs.map((s) => s.t).join("")).join("\n") + "\n";
        },
      };
      const name = stage.argv[0];
      const fn = name && Object.hasOwn(this.cmds, name) ? this.cmds[name] : undefined;
      if (fn) {
        const code = await fn(stage.argv.slice(1), io);
        status = typeof code === "number" ? code : 0;
      } else {
        if (name) this.errLine(name + this.t(": command not found. Try `help`.", " : commande introuvable. Essaie `help`."));
        status = 127;
      }
      input = out;
      if (last) this.flush(out, stage);
    }
    return status;
  }

  private flush(out: StdStream, stage: Stage): void {
    if (stage.redir) {
      const err = this.vfs.write(stage.redir.file, out.text, stage.redir.op === ">>");
      if (err) this.errLine(`sh: ${stage.redir.file}: ${err}`);
      return;
    }
    if (out.bin) {
      if (out.text) this.print(this.t("(binary output suppressed, try xxd or strings)", "(sortie binaire masquée, essaie xxd ou strings)"), "text-muted-foreground");
      return;
    }
    if (out.text === "") return;
    this.print(out.text.endsWith("\n") ? out.text.slice(0, -1) : out.text);
  }

  async exec(line: string): Promise<void> {
    if (line.replace(/\s+/g, "").includes(":(){:|:&};:")) {
      await forkBomb(this);
      return;
    }
    for (const part of parse(line, this.expansion())) {
      if (part.conn === "&&" && this.lastStatus !== 0) continue;
      if (part.conn === "||" && this.lastStatus === 0) continue;
      this.lastStatus = await this.runStages(part.stages);
    }
  }

  /* TOP-LEVEL INPUT */
  async submit(line: string): Promise<void> {
    if (this.mode?.onLine) {
      this.print(`${this.mode.prompt ?? this.promptText()} ${this.mode.masked ? "" : line}`, "text-muted-foreground");
      await this.mode.onLine(line);
      return;
    }
    if (this.busy) return;
    this.print(`${this.promptText()} ${line}`, "text-muted-foreground");
    if (!line.trim()) return;
    this.history.push(line);
    this.historyIndex = this.history.length;
    this.busy = true;
    this.cancelled = false;
    try {
      await this.exec(line);
    } catch (err) {
      this.errLine("sh: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      this.busy = false;
      this.refreshPrompt();
      this.term.scroll();
    }
  }

  keydown(e: KeyLike, value: string): KeyResult {
    if (this.mode?.onKey?.(e)) return { prevent: true };
    if (e.key === "Tab") {
      if (this.mode) return { prevent: true };
      const c = this.complete(value);
      if (c.options) {
        this.print(`${this.promptText()} ${value}`, "text-muted-foreground");
        this.print(c.options.join("  "));
      }
      return { prevent: true, value: c.value };
    }
    if (e.key === "ArrowUp" && !this.mode) {
      if (this.historyIndex > 0) this.historyIndex--;
      return { prevent: true, value: this.history[this.historyIndex] ?? value };
    }
    if (e.key === "ArrowDown" && !this.mode) {
      this.historyIndex = Math.min(this.historyIndex + 1, this.history.length);
      return { prevent: true, value: this.history[this.historyIndex] ?? "" };
    }
    if (e.ctrlKey && e.key === "l") {
      this.term.clear();
      return { prevent: true };
    }
    if (e.ctrlKey && e.key === "c") {
      this.cancelled = true;
      if (this.mode?.onCtrlC) this.mode.onCtrlC();
      else this.print(`${this.promptText()} ${value}^C`, "text-muted-foreground");
      return { prevent: true, value: this.mode ? undefined : "" };
    }
    return { prevent: false };
  }

  complete(value: string): Completion {
    const parts = value.split(/\s+/);
    const last = parts[parts.length - 1] ?? "";
    let pool: string[];
    if (parts.length === 1) pool = Object.keys(this.cmds).filter((n) => !HIDDEN.test(n));
    else {
      const slash = last.lastIndexOf("/");
      const dirPart = slash >= 0 ? last.slice(0, slash + 1) : "";
      pool = (this.vfs.list(this.vfs.norm(dirPart || ".")) ?? []).map((n) => {
        const node = this.vfs.find(this.vfs.norm(dirPart + n)).node;
        return dirPart + n + (node?.type === "dir" ? "/" : "");
      });
    }
    const leaf = last.slice(last.lastIndexOf("/") + 1);
    const hits = pool
      .filter((p) => p.startsWith(last) && (leaf !== "" || !p.slice(p.lastIndexOf("/", p.length - 2) + 1).startsWith(".")))
      .sort();
    if (hits.length === 1) {
      parts[parts.length - 1] = hits[0]!;
      return { value: parts.join(" ") + (hits[0]!.endsWith("/") ? "" : " ") };
    }
    return hits.length > 1 ? { options: hits } : {};
  }
}
