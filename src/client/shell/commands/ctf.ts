import { Progress } from "../../shared/progress";
import type { Shell } from "../shell";
import type { CommandMap } from "../types";
import { usage } from "./util";

const FLAG_PATTERN = /^cybai\{[\x20-\x7E]{1,128}\}$/;

export const ctfCommands = (sh: Shell): CommandMap => {
  const { t, data } = sh;
  const progress = new Progress(sh.deps.storage);

  const ctf: CommandMap[string] = async (args, io) => {
    const sub = args[0] ?? "status";
    const found = progress.get();
    if (sub === "status") {
      const max = data.ctf.reduce((s, c) => s + c.points, 0);
      io.writeln(`${progress.count()}/${data.ctf.length}${t(" flags found, ", " flags trouvés, ")}${progress.points()}/${max} pts`);
      io.writeln(t("ctf list · ctf hint <id> · ctf submit cybai{...}. Not every flag lives in a browser.", "ctf list · ctf hint <id> · ctf submit cybai{...}. Tous les flags ne vivent pas dans un navigateur."));
      return 0;
    }
    if (sub === "list") {
      const filter = args[1];
      for (const c of data.ctf) {
        const keep = !filter || (filter === "solved" ? !!found[c.id] : filter === "unsolved" ? !found[c.id] : c.category.toLowerCase() === filter.toLowerCase() || c.difficulty === filter);
        if (keep) io.writeln(`${found[c.id] ? "✓" : "·"} ${c.id.padEnd(15)}${c.name.padEnd(26)}${c.category.padEnd(10)}${String(c.points).padStart(4)} ${c.difficulty}`);
      }
      return 0;
    }
    if (sub === "hint") {
      const c = data.ctf.find((x) => x.id === args[1]);
      if (!c) return io.err(t("unknown challenge id (see `ctf list`)", "id de défi inconnu (voir `ctf list`)")), 1;
      io.writeln(`${c.name} — ${c.hint}`);
      return 0;
    }
    if (sub === "submit") {
      const flag = args.slice(1).join(" ").trim();
      if (!FLAG_PATTERN.test(flag)) return io.err(t("that does not look like a flag: cybai{...}", "ça ne ressemble pas à un flag : cybai{...}")), 1;
      let res: Response;
      try {
        res = await sh.deps.fetch("/ctf/submit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ flag }),
        });
      } catch {
        return io.err(t("could not reach the server", "serveur injoignable")), 1;
      }
      if (res.status === 429) return io.err(t("too many attempts, slow down", "trop d'essais, doucement")), 1;
      const r = (await res.json()) as { valid: boolean; id?: string; name?: string; points?: number };
      if (!r.valid || !r.id) return io.writeln(`✗ ${t("not a valid flag", "flag invalide")}`), 1;
      if (found[r.id]) return io.writeln(`• ${t("already solved: ", "déjà résolu : ")}${r.name}`), 0;
      progress.add(r.id, { flag, points: r.points ?? 0, name: r.name ?? r.id });
      io.writeln(`✓ ${r.name} +${r.points} pts (${progress.count()}/${data.ctf.length}, ${progress.points()} pts)`);
      return 0;
    }
    return usage("ctf", io);
  };

  return { ctf, flags: (args, io) => ctf(["list", ...args], io) };
};
