import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MATRIX_ROWS, MatrixRain, SL_WIDTH, runCmatrix, runSl, slFrame, slFrameCount } from "../../../src/client/shell/games/animations";
import { games } from "../../../src/client/shell/games";
import { makeShell, seededRandom } from "../../helpers/shell";

describe("sl frames", () => {
  it("never exceeds the viewport width and has seven rows", () => {
    for (let f = 0; f <= slFrameCount(); f += 7) {
      const rows = slFrame(f).split("\n");
      expect(rows).toHaveLength(7);
      for (const r of rows) expect(r.length).toBeLessThanOrEqual(SL_WIDTH);
    }
  });
  it("starts empty on the right and ends empty on the left", () => {
    expect(slFrame(0).trim()).toBe("");
    expect(slFrame(slFrameCount()).trim()).toBe("");
    expect(slFrame(SL_WIDTH).includes("(O)")).toBe(true);
  });
});

describe("MatrixRain", () => {
  it("renders a fixed-size grid", () => {
    const rain = new MatrixRain(30, seededRandom(3));
    for (let i = 0; i < 20; i++) {
      const rows = rain.frame().split("\n");
      expect(rows).toHaveLength(MATRIX_ROWS);
      for (const r of rows) expect([...r]).toHaveLength(30);
    }
  });
  it("is deterministic for a given seed and actually draws something", () => {
    const a = new MatrixRain(20, seededRandom(9));
    const b = new MatrixRain(20, seededRandom(9));
    let drew = false;
    for (let i = 0; i < 30; i++) {
      const fa = a.frame();
      expect(fa).toBe(b.frame());
      if (fa.trim()) drew = true;
    }
    expect(drew).toBe(true);
  });
});

describe("runners", () => {
  beforeEach(() => void vi.useFakeTimers());
  afterEach(() => void vi.useRealTimers());

  it("sl animates, then removes its canvas and resolves", async () => {
    const h = makeShell();
    const promise = runSl(h.sh.gameApi());
    vi.advanceTimersByTime(5);
    expect(h.term.canvases[0]!.text).not.toBe("");
    vi.advanceTimersByTime(60_000);
    expect(await promise).toBe(0);
    expect(h.term.canvases[0]!.removed).toBe(true);
  });
  it("sl stops early when cancelled", async () => {
    const h = makeShell();
    const promise = runSl(h.sh.gameApi());
    h.sh.cancelled = true;
    vi.advanceTimersByTime(100);
    expect(await promise).toBe(0);
    expect(h.term.canvases[0]!.removed).toBe(true);
  });
  it("cmatrix runs until a key is pressed", () => {
    const h = makeShell("en", seededRandom(5));
    runCmatrix(h.sh.gameApi());
    vi.advanceTimersByTime(500);
    expect(h.sh.mode?.prompt).toBe("matrix");
    expect(h.sh.mode?.onKey?.({ key: "a", ctrlKey: true, metaKey: false, altKey: false })).toBe(false);
    expect(h.sh.mode?.onKey?.({ key: "x", ctrlKey: false, metaKey: false, altKey: false })).toBe(true);
    expect(h.sh.mode).toBeNull();
    expect(h.term.canvases[0]!.removed).toBe(true);
  });
  it("cmatrix ends by itself and on Ctrl+C", () => {
    const h = makeShell("en", seededRandom(5));
    runCmatrix(h.sh.gameApi());
    vi.advanceTimersByTime(90 * 250);
    expect(h.sh.mode).toBeNull();
    const c = makeShell("en", seededRandom(5));
    runCmatrix(c.sh.gameApi());
    c.sh.mode?.onCtrlC?.();
    expect(c.sh.mode).toBeNull();
  });
});

describe("game pack", () => {
  it("exposes every game", () => {
    expect(Object.keys(games).sort()).toEqual(["adventure", "cmatrix", "sl", "snake", "wordle"]);
  });
  it("is loaded lazily and once by the shell", async () => {
    const h = makeShell();
    let loads = 0;
    (h.deps as { loadGames: typeof h.deps.loadGames }).loadGames = async () => {
      loads++;
      return games;
    };
    const h2 = makeShell();
    (h2.deps as { loadGames: typeof h2.deps.loadGames }).loadGames = h.deps.loadGames;
    await h2.run("wordle");
    await h2.sh.submit("q");
    await h2.run("wordle");
    expect(loads).toBe(1);
  });
  it("reports a failed load and allows a retry", async () => {
    const h = makeShell();
    let attempts = 0;
    (h.deps as { loadGames: typeof h.deps.loadGames }).loadGames = async () => {
      if (++attempts === 1) throw new Error("network");
      return games;
    };
    expect(await h.out("snake")).toContain("could not load the game pack");
    await h.run("wordle");
    expect(h.term.lines.join("\n")).toContain("PHISHLE");
  });
});
