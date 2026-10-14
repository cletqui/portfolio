import { FLAGS } from "./flags";

const ESC = "\u001b[";
const c = (code: string, text: string) => `${ESC}${code}m${text}${ESC}0m`;
const visible = (s: string) => s.replace(/\u001b\[[0-9;]*m/g, "");

const box = (lines: string[]) => {
  const max = Math.max(...lines.map((l) => visible(l).length));
  const pad = (l: string) => l + " ".repeat(max - visible(l).length);
  const edge = (l: string, r: string) => c("90", l + "─".repeat(max + 4) + r);
  return [
    edge("╭", "╮"),
    ...lines.map((l) => `${c("90", "│")}  ${pad(l)}  ${c("90", "│")}`),
    edge("╰", "╯"),
  ].join("\n");
};

const link = (label: string, value: string) =>
  `${c("90", label.padEnd(9))}${c("36", value)}`;

export const terminalCard = (lang: string) => {
  const fr = lang === "fr";
  return (
    "\n" +
    box([
      `${c("1;32", "cybai.re")}`,
      fr
        ? "ingénieur cybersécurité · développeur full-stack"
        : "cybersecurity engineer · full-stack developer",
      c("90", "SOC · threat intel · SIEM · TypeScript · Python"),
      "",
      link("web", "https://www.cybai.re"),
      link("github", "https://github.com/cletqui"),
      link("bluesky", "https://bsky.app/profile/cybai.re"),
      link("mail", "admin@cybai.re"),
      link("projects", "https://www.cybai.re/projects"),
      "",
      c(
        "33",
        fr
          ? "$ ce site parle plus que HTML. des flags s'y cachent → /ctf"
          : "$ this site speaks more than HTML. flags hide in it → /ctf",
      ),
      c("90", fr ? "(il parle aussi JSON)" : "(it also speaks JSON)"),
    ]) +
    "\n\n"
  );
};

export const jsonCard = () => ({
  name: "cybai.re",
  role: ["cybersecurity engineer", "full-stack developer"],
  links: {
    web: "https://www.cybai.re",
    github: "https://github.com/cletqui",
    bluesky: "https://bsky.app/profile/cybai.re",
    mail: "admin@cybai.re",
  },
  ctf: "https://www.cybai.re/ctf",
  flag: FLAGS.negotiation,
});

export const plainCard = (lang: string) =>
  visible(terminalCard(lang)).replace(/^\n+|\n+$/g, "");
