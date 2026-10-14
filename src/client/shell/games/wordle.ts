import { CLIENT_FLAGS } from "../../shared/flags";
import type { GameApi, Mode } from "../types";

export const WORDS = [
  "phish", "token", "virus", "patch", "crack", "shell", "proxy", "audit", "login", "trace",
  "admin", "spoof", "nonce", "vault", "salts", "bytes", "ports", "worms", "debug", "crypt",
  "cyber", "hacks", "leaks", "cache", "sniff", "ghost", "forge", "exfil",
];

export type Mark = "g" | "y" | "x";
export const MAX_TRIES = 6;
const COLORS: Record<Mark, string> = { g: "#538d4e", y: "#b59f3b", x: "#3a3a3c" };

export const scoreGuess = (guess: string, secret: string): Mark[] => {
  const result: Mark[] = ["x", "x", "x", "x", "x"];
  const left: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    if (guess[i] === secret[i]) result[i] = "g";
    else left[secret[i]!] = (left[secret[i]!] ?? 0) + 1;
  }
  for (let i = 0; i < 5; i++) {
    if (result[i] === "g") continue;
    const ch = guess[i]!;
    if (left[ch]) {
      result[i] = "y";
      left[ch]!--;
    }
  }
  return result;
};

export const isValidGuess = (guess: string): boolean => /^[a-z]{5}$/.test(guess);

export const runWordle = (api: GameApi): number => {
  const { t } = api;
  const secret = WORDS[Math.floor(api.random() * WORDS.length)]!;
  let tries = 0;
  const label = () => `${t("guess ", "essai ")}${tries + 1}/${MAX_TRIES}>`;

  api.print(t("PHISHLE: guess the 5-letter security word in 6 tries.", "PHISHLE : devine le mot de sécurité de 5 lettres en 6 essais."));
  api.print(t("green = right spot, yellow = wrong spot, grey = absent. Type q to quit.", "vert = bonne place, jaune = mauvaise place, gris = absente. Tape q pour quitter."), "text-muted-foreground");

  const mode: Mode = {
    prompt: label(),
    onLine: (line) => {
      const guess = line.trim().toLowerCase();
      if (guess === "q" || guess === "quit") {
        api.endMode();
        api.print(t("The word was ", "Le mot était ") + secret.toUpperCase() + ".");
        return;
      }
      if (!isValidGuess(guess)) {
        api.print(t("five letters, a-z only", "cinq lettres, a-z uniquement"), "text-destructive");
        return;
      }
      tries++;
      const marks = scoreGuess(guess, secret);
      api.printRich([[...guess.toUpperCase()].map((ch, i) => ({ t: ` ${ch} `, bg: COLORS[marks[i]!], c: "#ffffff" }))]);
      if (guess === secret) {
        api.endMode();
        api.print(t(`Solved in ${tries}!`, `Résolu en ${tries} !`));
        api.award(CLIENT_FLAGS.wordle);
      } else if (tries >= MAX_TRIES) {
        api.endMode();
        api.print(t("Out of tries. The word was ", "Plus d'essais. Le mot était ") + secret.toUpperCase() + ".");
      } else {
        mode.prompt = label();
        api.setMode(mode);
      }
    },
    onCtrlC: () => {
      api.endMode();
      api.print("^C");
    },
  };
  api.setMode(mode);
  return 0;
};
