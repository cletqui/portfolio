import type { GamesModule } from "../types";
import { runAdventure } from "./adventure";
import { runCmatrix, runSl } from "./animations";
import { runSnake } from "./snake";
import { runWordle } from "./wordle";

export const games: GamesModule = {
  snake: runSnake,
  wordle: runWordle,
  adventure: runAdventure,
  sl: runSl,
  cmatrix: runCmatrix,
};

if (typeof window !== "undefined") window.__shellGames = games;
