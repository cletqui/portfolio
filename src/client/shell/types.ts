import type { Lang, Translate } from "../shared/i18n";

export interface Segment {
  t: string;
  c?: string;
  bg?: string;
  cls?: string;
}

export interface KeyLike {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

export interface Mode {
  prompt?: string;
  masked?: boolean;
  onLine?: (line: string) => void | Promise<void>;
  onKey?: (e: KeyLike) => boolean;
  onCtrlC?: () => void;
}

export interface Canvas {
  setText(text: string): void;
  remove(): void;
}

export interface Term {
  readonly lang: Lang;
  readonly reducedMotion: boolean;
  width(): number;
  print(text: string, cls?: string): void;
  printRich(lines: Segment[][]): void;
  clear(): void;
  scroll(): void;
  canvas(cls?: string): Canvas;
  setPrompt(label: string, color?: string): void;
  setMasked(masked: boolean): void;
  focus(): void;
}

export interface ChallengeInfo {
  id: string;
  name: string;
  category: string;
  points: number;
  difficulty: string;
  hint: string;
}

export interface ShellData {
  lang: Lang;
  projects: { id: string; name: string; desc: string; url: string; page: string; github?: string }[];
  contacts: { name: string; href?: string; email?: boolean }[];
  challenges: number;
  points: number;
  card: string;
  pgp: string;
  pgpId: string;
  email: string;
  ctf: ChallengeInfo[];
  games: string;
}

export const emptyShellData: ShellData = {
  lang: "en",
  projects: [],
  contacts: [],
  challenges: 0,
  points: 0,
  card: "",
  pgp: "",
  pgpId: "",
  email: "",
  ctf: [],
  games: "",
};

export interface StdStream {
  text: string;
  bin: boolean;
}

export interface IO {
  stdin: StdStream | null;
  last: boolean;
  write(s: string): void;
  writeln(s: string): void;
  err(s: string): void;
  bin(): void;
  rich(lines: Segment[][]): void;
}

export type Command = (args: string[], io: IO) => number | void | Promise<number | void>;
export type CommandMap = Record<string, Command>;

export interface GameApi {
  t: Translate;
  lang: Lang;
  reducedMotion: boolean;
  width(): number;
  print(text: string, cls?: string): void;
  printRich(lines: Segment[][]): void;
  scroll(): void;
  canvas(cls?: string): Canvas;
  setMode(mode: Mode): void;
  endMode(): void;
  award(flag: string): void;
  sleep(ms: number): Promise<void>;
  isCancelled(): boolean;
  random(): number;
}

export type GameRunner = (api: GameApi) => number | Promise<number>;

export interface GamesModule {
  snake: GameRunner;
  wordle: GameRunner;
  adventure: GameRunner;
  sl: GameRunner;
  cmatrix: GameRunner;
}

export interface Deps {
  fetch: typeof fetch;
  storage: Pick<Storage, "getItem" | "setItem"> | null;
  sleep(ms: number): Promise<void>;
  random(): number;
  now(): number;
  navigate(url: string): void;
  setTheme(next?: "dark" | "light"): "dark" | "light";
  loadGames(url: string): Promise<GamesModule>;
  userAgent: string;
  screenSize: string;
}
