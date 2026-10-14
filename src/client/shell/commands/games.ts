import type { Shell } from "../shell";
import type { CommandMap, GamesModule } from "../types";

export const gameCommands = (sh: Shell): CommandMap => {
  let pack: Promise<GamesModule> | null = null;
  const load = (): Promise<GamesModule> => {
    pack ??= sh.deps.loadGames(sh.data.games).catch((err) => {
      pack = null;
      throw err;
    });
    return pack;
  };
  const game =
    (name: keyof GamesModule): CommandMap[string] =>
    async (_args, io) => {
      try {
        const games = await load();
        sh.cancelled = false;
        return await games[name](sh.gameApi());
      } catch {
        io.err(sh.t("could not load the game pack", "impossible de charger les jeux"));
        return 1;
      }
    };
  const adventure = game("adventure");
  const wordle = game("wordle");
  const cmatrix = game("cmatrix");
  return { snake: game("snake"), wordle, phishle: wordle, adventure, colossal: adventure, sl: game("sl"), cmatrix, matrix: cmatrix };
};
