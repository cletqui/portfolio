import { describe, expect, it } from "vitest";
import { CLIENT_FLAGS } from "../../../src/client/shared/flags";
import { MAX_TRIES, WORDS, isValidGuess, runWordle, scoreGuess } from "../../../src/client/shell/games/wordle";
import { makeShell } from "../../helpers/shell";

describe("scoreGuess", () => {
  it("marks exact matches green", () => {
    expect(scoreGuess("phish", "phish")).toEqual(["g", "g", "g", "g", "g"]);
  });
  it("marks present letters yellow and absent ones grey", () => {
    expect(scoreGuess("shell", "phish")).toEqual(["y", "g", "x", "x", "x"]);
    expect(scoreGuess("zzzzz", "phish")).toEqual(["x", "x", "x", "x", "x"]);
  });
  it("does not over-count repeated letters", () => {
    expect(scoreGuess("eerie", "there")).toEqual(["y", "x", "y", "x", "g"]);
    expect(scoreGuess("llama", "hello")).toEqual(["y", "y", "x", "x", "x"]);
    expect(scoreGuess("sssss", "salts")).toEqual(["g", "x", "x", "x", "g"]);
  });
  it("prefers a green over an earlier yellow for the same letter", () => {
    expect(scoreGuess("abbey", "kebab")).toEqual(["y", "y", "g", "y", "x"]);
  });
});

describe("word list and validation", () => {
  it("only offers five letter lowercase words", () => {
    expect(WORDS.length).toBeGreaterThan(20);
    for (const w of WORDS) expect(w).toMatch(/^[a-z]{5}$/);
    expect(new Set(WORDS).size).toBe(WORDS.length);
  });
  it("accepts exactly five lowercase letters", () => {
    expect(isValidGuess("crack")).toBe(true);
    for (const bad of ["", "abcd", "abcdef", "ab1de", "ABCDE", "ab de"]) expect(isValidGuess(bad)).toBe(false);
  });
});

describe("runWordle", () => {
  const secret = WORDS[0]!;
  const start = () => {
    const h = makeShell("en", () => 0);
    runWordle(h.sh.gameApi());
    return h;
  };

  it("announces itself and counts guesses in the prompt", async () => {
    const h = start();
    expect(h.term.lines.join("\n")).toContain("PHISHLE");
    expect(h.term.prompt).toBe("guess 1/6>");
    await h.sh.submit("crack");
    expect(h.term.prompt).toBe("guess 2/6>");
  });
  it("renders coloured tiles", async () => {
    const h = start();
    await h.sh.submit("shell");
    const tiles = h.term.rich.at(-1)!;
    expect(tiles.map((t) => t.t.trim()).join("")).toBe("SHELL");
    expect(tiles.every((t) => t.bg && t.c === "#ffffff")).toBe(true);
  });
  it("rejects invalid guesses without using a try", async () => {
    const h = start();
    await h.sh.submit("abc");
    expect(h.term.lines.join("\n")).toContain("five letters, a-z only");
    expect(h.term.prompt).toBe("guess 1/6>");
  });
  it("awards the flag when solved", async () => {
    const h = start();
    await h.sh.submit(secret);
    const out = h.term.lines.join("\n");
    expect(out).toContain("Solved in 1!");
    expect(out).toContain(CLIENT_FLAGS.wordle);
    expect(h.sh.mode).toBeNull();
  });
  it("reveals the word after the last wrong try", async () => {
    const h = start();
    for (let i = 0; i < MAX_TRIES; i++) await h.sh.submit("crack");
    const out = h.term.lines.join("\n");
    expect(out).toContain("Out of tries. The word was PHISH");
    expect(out).not.toContain(CLIENT_FLAGS.wordle);
    expect(h.sh.mode).toBeNull();
  });
  it("quits on q or Ctrl+C", async () => {
    const h = start();
    await h.sh.submit("q");
    expect(h.term.lines.join("\n")).toContain("The word was PHISH");
    const c = start();
    c.sh.mode?.onCtrlC?.();
    expect(c.sh.mode).toBeNull();
  });
  it("is playable in French", async () => {
    const h = makeShell("fr", () => 0);
    runWordle(h.sh.gameApi());
    expect(h.term.prompt).toBe("essai 1/6>");
    await h.sh.submit("abc");
    expect(h.term.lines.join("\n")).toContain("cinq lettres");
  });
});
