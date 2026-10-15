import { CLIENT_FLAGS } from "../../shared/flags";
import { join, type FsNode } from "../fs";
import type { Shell } from "../shell";
import type { CommandMap } from "../types";

export const scorchedEarth = async (sh: Shell): Promise<number> => {
  const { t, term, deps } = sh;
  sh.busy = true;
  const paths: string[] = [];
  const walk = (children: Record<string, FsNode>, base: string) => {
    for (const name of Object.keys(children).sort()) {
      const path = join(base, name);
      paths.push(path);
      const child = children[name]!;
      if (child.type === "dir") walk(child.children, path);
    }
  };
  walk(sh.vfs.root.children, "/");
  for (const [i, path] of paths.entries()) {
    sh.print(`removed '${path}'`, "text-muted-foreground");
    if (i % 3 === 0) await deps.sleep(25);
  }
  await deps.sleep(400);
  term.clear();
  sh.errLine("Kernel panic - not syncing: Attempted to kill init!");
  sh.errLine("---[ end Kernel panic - not syncing ]---");
  await deps.sleep(1300);
  term.clear();
  sh.print("…", "text-muted-foreground");
  await deps.sleep(500);
  sh.print(t("Just kidding. This is a browser tab and nothing was deleted.", "Je plaisante. C'est un onglet de navigateur, rien n'a été supprimé."));
  sh.award(CLIENT_FLAGS.wipe);
  sh.busy = false;
  return 0;
};

export const forkBomb = async (sh: Shell): Promise<void> => {
  const { t, deps } = sh;
  sh.busy = true;
  for (let i = 0; i < 8; i++) {
    sh.errLine("bash: fork: retry: Resource temporarily unavailable");
    await deps.sleep(110);
  }
  await deps.sleep(500);
  sh.errLine("bash: fork: Cannot allocate memory");
  sh.print(t("…the load average climbs, the fans spin up, and then ulimit -u steps in.", "…la charge grimpe, les ventilateurs s'emballent, puis ulimit -u intervient."), "text-muted-foreground");
  sh.busy = false;
};

export const eggCommands = (sh: Shell): CommandMap => ({
  xyzzy: (_a, io) => {
    sh.heardPlugh = true;
    io.writeln('A hollow voice says "Plugh."');
  },
  plugh: (_a, io) => {
    if (!sh.heardPlugh) return void io.writeln("Nothing happens.");
    io.writeln("A hidden passage opens in the wall of the scrollback. Something shines inside.");
    sh.award(CLIENT_FLAGS.xyzzy);
  },
});
