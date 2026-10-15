import { readFileSync } from "node:fs";
import app from "../../src/index";
import { games } from "../../src/client/shell/games";
import { Shell } from "../../src/client/shell/shell";
import {
  emptyShellData,
  type Canvas,
  type Deps,
  type Mode,
  type Segment,
  type ShellData,
  type Term,
} from "../../src/client/shell/types";
import type { Lang } from "../../src/client/shared/i18n";
import { EMAIL_ENC } from "../../src/data/email";
import { CHALLENGES } from "../../src/data/challenges";

export class TestTerm implements Term {
  lines: string[] = [];
  rich: Segment[][] = [];
  canvases: { text: string; removed: boolean }[] = [];
  prompt = "";
  promptColor: string | undefined;
  masked = false;
  clears = 0;
  focuses = 0;
  constructor(
    readonly lang: Lang = "en",
    readonly reducedMotion = true,
  ) {}
  width = () => 800;
  scroll = () => undefined;
  focus = () => void this.focuses++;
  print(text: string): void {
    this.lines.push(...text.split("\n"));
  }
  printRich(lines: Segment[][]): void {
    this.rich.push(...lines);
    this.lines.push(...lines.map((segs) => segs.map((s) => s.t).join("")));
  }
  clear(): void {
    this.clears++;
    this.lines = [];
  }
  canvas(): Canvas {
    const c = { text: "", removed: false };
    this.canvases.push(c);
    return { setText: (t) => void (c.text = t), remove: () => void (c.removed = true) };
  }
  setPrompt(label: string, color?: string): void {
    this.prompt = label;
    this.promptColor = color;
  }
  setMasked(masked: boolean): void {
    this.masked = masked;
  }
}

export const memoryStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    store,
  };
};

const avatar = readFileSync("public/static/avatar.png");
let ipCounter = 0;

export const testFetch: typeof fetch = async (input, init) => {
  const url = String(input);
  if (url.endsWith("/static/avatar.png")) return new Response(avatar);
  const headers = new Headers(init?.headers);
  headers.set("cf-connecting-ip", `203.0.113.${(ipCounter++ % 250) + 1}`);
  return app.request(url, { ...init, headers });
};

export const testData = (over: Partial<ShellData> = {}): ShellData => {
  const fr = over.lang === "fr";
  return {
  ...emptyShellData,
  projects: [
    { id: "petithub", name: "PetitHub", desc: "A GitHub explorer.", url: "https://petithub.cybai.re/", page: "/projects/petithub", github: "https://github.com/x/petithub" },
    { id: "api", name: "API", desc: "A worker.", url: "https://api.cybai.re/", page: "/projects/api" },
  ],
  contacts: [
    { name: "GitHub", href: "https://github.com/x" },
    { name: "Mail", email: true },
  ],
  card: "CARD",
  pgp: "9753A1844F422246185CC0ABACFAD5ECEEC88002",
  pgpId: "ACFAD5ECEEC88002",
  email: EMAIL_ENC,
  ctf: CHALLENGES.map((c) => ({ id: c.id, name: fr ? c.nameFr : c.name, category: c.category, points: c.points, difficulty: c.difficulty, hint: fr ? c.hintFr : c.hint })),
  challenges: CHALLENGES.length,
  points: CHALLENGES.reduce((s, c) => s + c.points, 0),
  games: "/static/shell-games.js",
  ...over,
  };
};

export interface Harness {
  sh: Shell;
  term: TestTerm;
  deps: Deps;
  navigations: string[];
  storage: ReturnType<typeof memoryStorage>;
  run(line: string): Promise<string[]>;
  out(line: string): Promise<string>;
  mode(): Mode | null;
}

export const makeShell = (lang: Lang = "en", random: () => number = () => 0.5): Harness => {
  const term = new TestTerm(lang);
  const navigations: string[] = [];
  const storage = memoryStorage();
  const deps: Deps = {
    fetch: testFetch,
    storage,
    sleep: async () => undefined,
    random,
    now: () => Date.UTC(2026, 9, 14, 12, 0, 0),
    navigate: (url) => void navigations.push(url),
    setTheme: (next) => next ?? "dark",
    loadGames: async () => games,
    userAgent: "Mozilla/5.0 Chrome/150.0",
    screenSize: "1920x1080",
  };
  const sh = new Shell(term, testData({ lang }), deps);
  sh.refreshPrompt();
  const run = async (line: string) => {
    const before = term.lines.length;
    await sh.submit(line);
    return term.lines.slice(before + 1);
  };
  return { sh, term, deps, navigations, storage, run, out: async (l) => (await run(l)).join("\n"), mode: () => sh.mode };
};

export const seededRandom = (seed = 1): (() => number) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
};
