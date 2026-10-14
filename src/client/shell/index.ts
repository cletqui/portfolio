import { byId, prefersReducedMotion, readJson } from "../shared/dom";
import { asLang } from "../shared/i18n";
import { Shell } from "./shell";
import { DomTerm } from "./terminal";
import { TerminalWindow } from "./window";
import { emptyShellData, type Deps, type GamesModule, type ShellData } from "./types";

declare global {
  interface Window {
    __shellGames?: GamesModule;
  }
}

const loadScript = (url: string): Promise<GamesModule> =>
  new Promise((resolve, reject) => {
    if (window.__shellGames) return resolve(window.__shellGames);
    const s = document.createElement("script");
    s.src = url || "/static/shell-games.js";
    s.onload = () => (window.__shellGames ? resolve(window.__shellGames) : reject(new Error("empty game pack")));
    s.onerror = () => reject(new Error("load failed"));
    document.head.appendChild(s);
  });

const setTheme = (next?: "dark" | "light"): "dark" | "light" => {
  const h = document.documentElement;
  const dark = h.classList.contains("dark") || (!h.classList.contains("light") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const value = next ?? (dark ? "light" : "dark");
  h.className = value;
  try {
    localStorage.setItem("theme", value);
  } catch {
    /* storage may be blocked */
  }
  return value;
};

const storage = (): Deps["storage"] => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const boot = (): void => {
  const root = byId("shell");
  const screen = byId("shell-screen");
  const form = byId<HTMLFormElement>("shell-form");
  const input = byId<HTMLInputElement>("shell-input");
  const prompt = byId("shell-prompt");
  if (!root || !screen || !form || !input || !prompt) return;

  const data: ShellData = readJson("shell-data", emptyShellData);
  const lang = asLang(data.lang);
  const term = new DomTerm({ root, screen, form, input, prompt }, lang, prefersReducedMotion());
  const deps: Deps = {
    fetch: (...args) => fetch(...args),
    storage: storage(),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, term.reducedMotion ? 0 : ms)),
    random: Math.random,
    now: Date.now,
    navigate: (url) => void setTimeout(() => (location.href = url), 350),
    setTheme,
    loadGames: loadScript,
    userAgent: navigator.userAgent,
    screenSize: `${window.screen.width}x${window.screen.height}`,
  };
  const shell = new Shell(term, data, deps);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const line = input.value;
    input.value = "";
    void shell.submit(line);
  });
  input.addEventListener("keydown", (e) => {
    const result = shell.keydown(e, input.value);
    if (result.prevent) e.preventDefault();
    if (result.value !== undefined) input.value = result.value;
  });
  root.addEventListener("click", () => {
    if (!window.getSelection()?.toString()) term.focus();
  });

  const slot = byId("shell-slot");
  const titlebar = byId("shell-titlebar");
  const close = byId("shell-close");
  const minimize = byId("shell-minimize");
  const maximize = byId("shell-maximize");
  if (slot && titlebar && close && minimize && maximize) {
    new TerminalWindow(
      { slot, root, screen, form, titlebar, close, minimize, maximize },
      () => !shell.mode,
      () => {
        term.scroll();
        term.focus();
      },
    );
  }

  shell.refreshPrompt();
  term.print(shell.t("Type 'help' to list the available commands.", "Tape 'help' pour lister les commandes disponibles."), "text-muted-foreground");
  term.print("");
};

boot();
