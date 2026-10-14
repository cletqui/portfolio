import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CLIENT_FLAGS } from "../../../src/client/shared/flags";
import { HEIGHT, SnakeEngine, WIDTH, WIN_SCORE, runSnake } from "../../../src/client/shell/games/snake";
import { makeShell } from "../../helpers/shell";

const fixedFood = (positions: [number, number][]) => {
  const values = positions.flatMap(([x, y]) => [(x + 0.01) / WIDTH, (y + 0.01) / HEIGHT]);
  let i = 0;
  return () => values[i++] ?? 0.99;
};

describe("SnakeEngine", () => {
  it("starts with three segments heading right and food off the snake", () => {
    const g = new SnakeEngine(() => 0.5);
    expect(g.snake).toHaveLength(3);
    expect(g.dir).toEqual({ x: 1, y: 0 });
    expect(g.occupied(g.food.x, g.food.y)).toBe(false);
  });
  it("moves one cell per step", () => {
    const g = new SnakeEngine(fixedFood([[20, 1]]));
    expect(g.step()).toBe("moved");
    expect(g.snake[0]).toEqual({ x: 7, y: 6 });
    expect(g.snake).toHaveLength(3);
  });
  it("ignores a 180 degree turn and accepts a perpendicular one", () => {
    const g = new SnakeEngine(fixedFood([[20, 1]]));
    g.turn(-1, 0);
    g.step();
    expect(g.snake[0]).toEqual({ x: 7, y: 6 });
    g.turn(0, -1);
    g.step();
    expect(g.snake[0]).toEqual({ x: 7, y: 5 });
  });
  it("eats, grows, scores and relocates the food", () => {
    const g = new SnakeEngine(fixedFood([[7, 6], [20, 1]]));
    expect(g.step()).toBe("ate");
    expect(g.score).toBe(1);
    expect(g.snake).toHaveLength(4);
    expect(g.food).toEqual({ x: 20, y: 1 });
  });
  it("dies on the wall", () => {
    const g = new SnakeEngine(fixedFood([[0, 0]]), 8, 12);
    let result = g.step();
    for (let i = 0; i < 10 && result !== "wall"; i++) result = g.step();
    expect(result).toBe("wall");
  });
  it("dies biting its own body", () => {
    const g = new SnakeEngine(() => 0.99, 10, 10);
    g.snake = [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 4, y: 5 }, { x: 4, y: 4 }, { x: 5, y: 4 }];
    g.dir = { x: 0, y: -1 };
    g.next = { x: -1, y: 0 };
    expect(g.step()).toBe("self");
  });
  it("speeds up with the score down to a floor", () => {
    const g = new SnakeEngine(() => 0.5);
    expect(g.speed()).toBe(140);
    g.score = 5;
    expect(g.speed()).toBe(120);
    g.score = 100;
    expect(g.speed()).toBe(70);
  });
  it("renders a bordered board with head, body, food and a star at the target score", () => {
    const g = new SnakeEngine(fixedFood([[3, 3]]));
    const text = g.render("note", "score ");
    expect(text.split("\n")).toHaveLength(HEIGHT + 3);
    expect(text).toContain("@");
    expect(text).toContain("*");
    expect(text.split("\n")[0]).toMatch(/^┌─+┐ {2}score 0$/);
    g.score = WIN_SCORE;
    expect(g.render("", "score ")).toContain("★");
  });
});

describe("runSnake", () => {
  beforeEach(() => void vi.useFakeTimers());
  afterEach(() => void vi.useRealTimers());

  const key = (k: string) => ({ key: k, ctrlKey: false, metaKey: false, altKey: false });

  it("draws, accepts keys, and quits without a prize", () => {
    const h = makeShell();
    runSnake(h.sh.gameApi());
    expect(h.term.canvases[0]!.text).toContain("┌");
    expect(h.sh.mode?.prompt).toBe("snake");
    expect(h.sh.mode?.onKey?.(key("ArrowUp"))).toBe(true);
    expect(h.sh.mode?.onKey?.({ ...key("c"), ctrlKey: true })).toBe(false);
    vi.advanceTimersByTime(300);
    h.sh.mode?.onKey?.(key("q"));
    expect(h.sh.mode).toBeNull();
    const out = h.term.lines.join("\n");
    expect(out).toContain("Game over");
    expect(out).toContain("Reach 15 apples");
    expect(out).not.toContain(CLIENT_FLAGS.snake);
  });
  it("dies on a wall when left alone", () => {
    const h = makeShell("en", () => 0.99);
    runSnake(h.sh.gameApi());
    vi.advanceTimersByTime(140 * 30);
    expect(h.sh.mode).toBeNull();
    expect(h.term.canvases[0]!.text).toContain("You hit the wall.");
    expect(h.term.lines.join("\n")).toContain("Score: 0");
  });
  it("awards the flag for 15 apples", () => {
    const foods: [number, number][] = Array.from({ length: 15 }, (_v, i) => [7 + i, 6]);
    const h = makeShell("en", fixedFood(foods));
    runSnake(h.sh.gameApi());
    vi.advanceTimersByTime(10_000);
    const out = h.term.lines.join("\n");
    expect(out).toContain("Score: 15");
    expect(out).toContain(CLIENT_FLAGS.snake);
    expect(h.sh.mode).toBeNull();
  });
  it("Ctrl+C stops the game", () => {
    const h = makeShell();
    runSnake(h.sh.gameApi());
    h.sh.mode?.onCtrlC?.();
    expect(h.sh.mode).toBeNull();
  });
});
