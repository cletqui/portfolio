import type { Shell } from "../shell";
import type { CommandMap, Segment } from "../types";
import { lines, stdinText } from "./util";

export const wrapText = (text: string, width: number): string[] => {
  const out: string[] = [];
  let cur = "";
  for (const w of text.split(/\s+/).filter(Boolean)) {
    if ((cur + " " + w).trim().length > width) {
      out.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  return out.length ? out : [""];
};

export const cowsay = (text: string): string[] => {
  const rows = wrapText(text, 38);
  const w = Math.max(...rows.map((r) => r.length));
  const out = [" " + "_".repeat(w + 2)];
  if (rows.length === 1) out.push(`< ${rows[0]!.padEnd(w)} >`);
  else
    rows.forEach((r, i) => {
      const l = i === 0 ? "/" : i === rows.length - 1 ? "\\" : "|";
      const rr = i === 0 ? "\\" : i === rows.length - 1 ? "/" : "|";
      out.push(`${l} ${r.padEnd(w)} ${rr}`);
    });
  out.push(" " + "-".repeat(w + 2));
  out.push("        \\   ^__^", "         \\  (oo)\\_______", "            (__)\\       )\\/\\", "                ||----w |", "                ||     ||");
  return out;
};

const FONT =
  "A:.###./#...#/#####/#...#/#...#;B:####./#...#/####./#...#/####.;C:.####/#..../#..../#..../.####;D:####./#...#/#...#/#...#/####.;E:#####/#..../####./#..../#####;F:#####/#..../####./#..../#....;G:.####/#..../#..##/#...#/.###.;H:#...#/#...#/#####/#...#/#...#;I:#####/..#../..#../..#../#####;J:..###/...#./...#./#..#./.##..;K:#...#/#..#./###../#..#./#...#;L:#..../#..../#..../#..../#####;M:#...#/##.##/#.#.#/#...#/#...#;N:#...#/##..#/#.#.#/#..##/#...#;O:.###./#...#/#...#/#...#/.###.;P:####./#...#/####./#..../#....;Q:.###./#...#/#.#.#/#..#./.##.#;R:####./#...#/####./#..#./#...#;S:.####/#..../.###./....#/####.;T:#####/..#../..#../..#../..#..;U:#...#/#...#/#...#/#...#/.###.;V:#...#/#...#/#...#/.#.#./..#..;W:#...#/#...#/#.#.#/##.##/#...#;X:#...#/.#.#./..#../.#.#./#...#;Y:#...#/.#.#./..#../..#../..#..;Z:#####/...#./..#../.#.../#####;0:.###./#..##/#.#.#/##..#/.###.;1:..#../.##../..#../..#../.###.;2:.###./#...#/..##./.#.../#####;3:####./....#/.###./....#/####.;4:#..#./#..#./#####/...#./...#.;5:#####/#..../####./....#/####.;6:.###./#..../####./#...#/.###.;7:#####/....#/...#./..#../..#..;8:.###./#...#/.###./#...#/.###.;9:.###./#...#/.####/....#/.###.;.:...../...../...../...../..#..;!:..#../..#../..#../...../..#..;-:...../...../.###./...../.....;_:...../...../...../...../#####;?:.###./....#/..##./...../..#..;::...../..#../...../..#../.....;/:....#/...#./..#../.#.../#....";

const GLYPHS: Record<string, string[]> = Object.fromEntries(
  FONT.split(";").map((g) => [g.charAt(0), g.slice(2).split("/")]),
);

export const figlet = (text: string): string[] => {
  const rows = ["", "", "", "", ""];
  for (const ch of text.toUpperCase().slice(0, 14)) {
    const g = GLYPHS[ch] ?? (ch === " " ? ["   ", "   ", "   ", "   ", "   "] : GLYPHS["?"]!);
    for (let r = 0; r < 5; r++) rows[r] += g[r]!.replace(/#/g, "█").replace(/\./g, " ") + " ";
  }
  return rows.map((r) => r.replace(/\s+$/, ""));
};

export const lolcat = (text: string, hue: number): Segment[][] =>
  lines(text).map((l, li) => [...l].map((ch, ci) => ({ t: ch, c: `hsl(${(hue + li * 12 + ci * 8) % 360},90%,58%)` })));

export const toyCommands = (sh: Shell): CommandMap => {
  const textArg = (args: string[], io: Parameters<CommandMap[string]>[1], fallback: string) =>
    args.length ? args.join(" ") : (stdinText(io) ?? fallback);
  const figletCommand: CommandMap[string] = (args, io) =>
    void figlet(textArg(args, io, "cybai")).forEach((l) => io.writeln(l));
  return {
    cowsay: (args, io) => void cowsay(textArg(args, io, "Moo.")).forEach((l) => io.writeln(l)),
    figlet: figletCommand,
    banner: figletCommand,
    lolcat: (args, io) => void io.rich(lolcat(textArg(args, io, ""), Math.floor(sh.deps.random() * 360))),
  };
};
