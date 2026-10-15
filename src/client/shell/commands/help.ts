import type { Shell } from "../shell";
import type { CommandMap } from "../types";
import { ALIASES, GROUP_ORDER, GROUP_TITLES, HIDDEN, MANUAL } from "./manual";

const VERSION = "cybai-sh, version 1.2 (x86_64-pc-cybai)";

export const helpCommands = (sh: Shell): CommandMap => {
  const { t } = sh;
  const fr = sh.term.lang === "fr";
  const pick = (pair: [string, string]): string => pair[fr ? 1 : 0];

  const resolve = (name: string): string => ALIASES[name] ?? name;

  const sections: Record<string, () => string[]> = {
    sh: () => [
      "NAME",
      `    cybai-sh - ${t("the shell behind this prompt", "le shell derrière ce prompt")}`,
      "",
      t("SYNTAX", "SYNTAXE"),
      `    cmd1 | cmd2       ${t("pipe the output of cmd1 into cmd2", "envoie la sortie de cmd1 dans cmd2")}`,
      `    cmd1 ; cmd2       ${t("run both, one after the other", "lance les deux, l'un après l'autre")}`,
      `    cmd1 && cmd2      ${t("run cmd2 only if cmd1 succeeded", "lance cmd2 seulement si cmd1 a réussi")}`,
      `    cmd1 || cmd2      ${t("run cmd2 only if cmd1 failed", "lance cmd2 seulement si cmd1 a échoué")}`,
      `    cmd > file        ${t("write the output to a file (>> appends)", "écrit la sortie dans un fichier (>> ajoute)")}`,
      `    $VAR  $?  ~       ${t("variables, last exit status, home directory", "variables, dernier code retour, dossier personnel")}`,
      `    *.md  ?           ${t("globbing", "jokers de nom de fichier")}`,
      "",
      t("KEYS", "TOUCHES"),
      `    Tab               ${t("complete", "compléter")}`,
      `    Up / Down         ${t("history", "historique")}`,
      `    Ctrl+L            ${t("clear the screen", "effacer l'écran")}`,
      `    Ctrl+C            ${t("cancel", "annuler")}`,
    ],
    cybai: () => [
      "NAME",
      `    cybai.re - ${t("a portfolio that behaves like a machine", "un portfolio qui se comporte comme une machine")}`,
      "",
      t("DESCRIPTION", "DESCRIPTION"),
      `    ${t("Every page of the site is a directory in your home. cd into one to open it:", "Chaque page du site est un dossier de ton home. Fais cd dedans pour l'ouvrir :")}`,
      "",
      "        cd about    cd projects    cd projects/NAME",
      "        cd contact  cd ctf         cd now    cd you",
      "",
      `    ${t("CDPATH points at your home, so this works from anywhere.", "CDPATH pointe sur ton home, donc ça marche de n'importe où.")}`,
      `    ${t("ls and cat read what a page contains without leaving the terminal.", "ls et cat lisent le contenu d'une page sans quitter le terminal.")}`,
      "",
      t("CTF", "CTF"),
      `    ${t("Flags look like cybai{...}. See `ctf`, then `ctf submit FLAG`.", "Les flags ressemblent à cybai{...}. Voir `ctf`, puis `ctf submit FLAG`.")}`,
      `    ${t("Not every flag lives in a browser, and not everything is documented.", "Tous les flags ne vivent pas dans un navigateur, et tout n'est pas documenté.")}`,
    ],
  };

  const header = (name: string, section: number): string => {
    const tag = `${name.toUpperCase()}(${section})`;
    const mid = "CybaiOS Manual";
    const gap = Math.max(2, 72 - tag.length * 2 - mid.length);
    return `${tag}${" ".repeat(Math.floor(gap / 2))}${mid}${" ".repeat(Math.ceil(gap / 2))}${tag}`;
  };

  return {
    help: (args, io) => {
      const name = args[0];
      if (name) {
        const target = resolve(name);
        const entry = MANUAL[target];
        if (!entry) return io.err(`help: ${t("no help topics match", "aucun sujet d'aide ne correspond à")} '${name}'. ${t("Try `help` or `man sh`.", "Essaie `help` ou `man sh`.")}`), 1;
        io.writeln(`${target}: ${entry.synopsis}`);
        io.writeln(`    ${pick(entry.summary)}`);
        return 0;
      }
      io.writeln(VERSION);
      io.writeln(t("These commands are built into the shell.", "Ces commandes sont intégrées au shell."));
      io.writeln(t("Type `help NAME` to learn about one, `man sh` for the syntax, `man cybai` for how this place works.", "Tape `help NOM` pour en savoir plus, `man sh` pour la syntaxe, `man cybai` pour comprendre ce lieu."));
      for (const group of GROUP_ORDER) {
        const names = Object.keys(MANUAL).filter((n) => MANUAL[n]!.group === group && !HIDDEN.test(n)).sort();
        io.writeln("");
        io.writeln(pick(GROUP_TITLES[group]));
        io.writeln("  " + names.join(" "));
      }
      return 0;
    },
    man: (args, io) => {
      const name = args[0];
      if (!name) return io.err(t("What manual page do you want?", "Quelle page de manuel veux-tu ?")), 1;
      const target = resolve(name);
      const section = sections[target];
      if (section) {
        io.writeln(header(target, target === "cybai" ? 7 : 1));
        io.writeln("");
        section().forEach((l) => io.writeln(l));
        return 0;
      }
      const entry = MANUAL[target];
      if (!entry) return io.err(`${t("No manual entry for", "Pas de page de manuel pour")} ${name}`), 16;
      io.writeln(header(target, 1));
      io.writeln("");
      io.writeln("NAME");
      io.writeln(`    ${target} - ${pick(entry.summary)}`);
      io.writeln("");
      io.writeln(t("SYNOPSIS", "SYNOPSIS"));
      io.writeln(`    ${entry.synopsis}`);
      if (target === "ctf") {
        io.writeln("");
        io.writeln(t("DESCRIPTION", "DESCRIPTION"));
        io.writeln(`    ctf                ${t("progress summary", "résumé de la progression")}`);
        io.writeln(`    ctf list [FILTER]  ${t("challenges; FILTER is solved, unsolved, a category or a difficulty", "défis ; FILTER vaut solved, unsolved, une catégorie ou une difficulté")}`);
        io.writeln(`    ctf hint ID        ${t("a hint for one challenge", "un indice pour un défi")}`);
        io.writeln(`    ctf submit FLAG    ${t("check a flag against the server", "vérifie un flag auprès du serveur")}`);
      }
      const aliases = Object.entries(ALIASES).filter(([, to]) => to === target).map(([from]) => from);
      if (aliases.length) {
        io.writeln("");
        io.writeln(t("ALIASES", "ALIAS"));
        io.writeln(`    ${aliases.join(", ")}`);
      }
      return 0;
    },
  };
};
