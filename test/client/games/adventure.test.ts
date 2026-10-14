import { describe, expect, it } from "vitest";
import { CLIENT_FLAGS } from "../../../src/client/shared/flags";
import { makeT } from "../../../src/client/shared/i18n";
import { Adventure, PASSWORD, normalise, runAdventure } from "../../../src/client/shell/games/adventure";
import { makeShell } from "../../helpers/shell";

const text = (lines: { text: string }[]) => lines.map((l) => l.text).join("\n");
const game = (lang: "en" | "fr" = "en") => {
  const g = new Adventure(makeT(lang));
  g.intro();
  return g;
};
const say = (g: Adventure, ...inputs: string[]) => inputs.map((i) => text(g.handle(i))).join("\n---\n");

const SOLUTION = ["open drawer", "take badge", "take flashlight", "use badge", "n", "w", "move boxes", "take fuse", "e", "use fuse", "e", "read note", "w", "n", "use terminal", PASSWORD];

describe("normalise", () => {
  it("lowercases, strips accents and articles", () => {
    expect(normalise("Prendre LA  Lampe")).toBe("prendre lampe");
    expect(normalise("take the badge")).toBe("take badge");
    expect(normalise("utiliser l'écran")).toBe("utiliser ecran");
  });
});

describe("the English walkthrough", () => {
  it("can be completed with the intended solution", () => {
    const g = game();
    const output = say(g, ...SOLUTION);
    expect(g.status).toBe("won");
    expect(output).toContain("EMERGENCY EXIT UNLOCKED");
    expect(output).toContain("You escaped in 16 moves");
  });
  it("introduces the story and the first room", () => {
    const g = new Adventure(makeT("en"));
    const intro = text(g.intro());
    expect(intro).toContain("COLOSSAL DATA CENTER");
    expect(intro).toContain("RECEPTION");
  });
  it("keeps the badge door locked until the badge is used", () => {
    const g = game();
    expect(say(g, "n")).toContain("badge reader blinks red");
    say(g, "open drawer", "take badge");
    expect(say(g, "use badge")).toContain("BEEP");
    expect(say(g, "n")).toContain("COLD AISLE");
  });
  it("needs the drawer opened before taking things", () => {
    const g = game();
    expect(say(g, "take badge")).toContain("don't see that here");
    expect(say(g, "open drawer")).toContain("a staff badge and a flashlight");
    expect(say(g, "open drawer")).toContain("already open");
    expect(say(g, "take badge")).toContain("Taken");
    expect(say(g, "take badge")).toContain("already have it");
  });
  it("is dark in storage without the flashlight", () => {
    const g = game();
    say(g, "open drawer", "take badge", "use badge", "n", "w");
    expect(say(g, "look")).toContain("pitch dark");
    expect(say(g, "move boxes")).toContain("too dark");
    say(g, "e", "s", "take flashlight", "n", "w");
    expect(say(g, "look")).toContain("cardboard boxes");
  });
  it("blocks the control room until the fuse is in", () => {
    const g = game();
    say(g, "open drawer", "take badge", "use badge", "n");
    expect(say(g, "n")).toContain("magnetic lock has no power");
    expect(say(g, "use fuse")).toContain("don't have a fuse");
  });
  it("rejects a wrong password and allows retrying", () => {
    const g = game();
    say(g, ...SOLUTION.slice(0, 15));
    expect(say(g, "letmein")).toContain("ACCESS DENIED");
    expect(g.status).toBe("playing");
    expect(say(g, "login", PASSWORD)).toContain("EMERGENCY EXIT UNLOCKED");
  });
  it("only has a terminal in the control room", () => {
    expect(say(game(), "use terminal")).toContain("no terminal here");
  });
  it("tracks inventory and examines things", () => {
    const g = game();
    expect(say(g, "inventory")).toContain("empty-handed");
    say(g, "open drawer", "take badge");
    expect(say(g, "i")).toContain("a staff badge");
    expect(say(g, "examine plant")).toContain("seen things");
    expect(say(g, "look at the desk")).toContain("reception desk");
    expect(say(g, "examine")).toContain("Examine what");
    expect(say(g, "drop badge")).toContain("keep it");
    expect(say(g, "drop fuse")).toContain("don't have that");
  });
  it("gives a hint for each stage of the puzzle", () => {
    const g = game();
    const hints = [say(g, "hint")];
    say(g, "open drawer");
    hints.push(say(g, "hint"));
    say(g, "take badge");
    hints.push(say(g, "hint"));
    say(g, "use badge", "n", "w", "e", "s", "take flashlight", "n", "w", "move boxes", "take fuse");
    hints.push(say(g, "hint"));
    say(g, "e", "use fuse");
    hints.push(say(g, "hint"));
    say(g, "e", "read note");
    hints.push(say(g, "hint"));
    expect(new Set(hints).size).toBe(hints.length);
  });
  it("understands directions on their own, quits, and refuses nonsense", () => {
    const g = game();
    expect(say(g, "dance")).toContain("don't understand");
    expect(say(g, "go")).toContain("Go where");
    expect(say(g, "go west")).toContain("can't go that way");
    expect(say(g, "xyzzy")).toContain("Wrong game");
    expect(say(g, "kick rack")).toContain("Ow");
    expect(say(g, "help")).toContain("Verbs:");
    expect(say(g, "quit")).toContain("nap");
    expect(g.status).toBe("quit");
  });
  it("ignores empty input", () => {
    expect(game().handle("   ")).toEqual([]);
  });
});

describe("the French walkthrough", () => {
  it("accepts French verbs and nouns", () => {
    const g = game("fr");
    const output = say(g, "ouvrir tiroir", "prendre badge", "prendre lampe", "utiliser lecteur", "nord", "ouest", "déplacer cartons", "prendre fusible", "est", "utiliser fusible", "est", "lire post-it", "ouest", "n", "login", PASSWORD);
    expect(g.status).toBe("won");
    expect(output).toContain("SORTIE DE SECOURS DÉVERROUILLÉE");
  });
  it("translates the intro and help", () => {
    const g = new Adventure(makeT("fr"));
    expect(text(g.intro())).toContain("RÉCEPTION");
    expect(say(g, "aide")).toContain("Verbes :");
  });
});

describe("runAdventure", () => {
  it("plays through the terminal and awards the flag", async () => {
    const h = makeShell();
    runAdventure(h.sh.gameApi());
    expect(h.term.prompt).toBe(">");
    for (const step of SOLUTION) await h.sh.submit(step);
    const out = h.term.lines.join("\n");
    expect(out).toContain(CLIENT_FLAGS.adventure);
    expect(h.sh.mode).toBeNull();
  });
  it("quitting ends the mode without a flag", async () => {
    const h = makeShell();
    runAdventure(h.sh.gameApi());
    await h.sh.submit("quit");
    expect(h.sh.mode).toBeNull();
    expect(h.term.lines.join("\n")).not.toContain(CLIENT_FLAGS.adventure);
  });
  it("Ctrl+C leaves the game", () => {
    const h = makeShell();
    runAdventure(h.sh.gameApi());
    h.sh.mode?.onCtrlC?.();
    expect(h.sh.mode).toBeNull();
  });
  it("is reachable from the shell through its aliases", async () => {
    const h = makeShell();
    await h.run("colossal");
    expect(h.term.prompt).toBe(">");
    expect(h.term.lines.join("\n")).toContain("COLOSSAL DATA CENTER");
  });
});
