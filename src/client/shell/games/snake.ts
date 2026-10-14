import { CLIENT_FLAGS } from "../../shared/flags";
import type { GameApi } from "../types";

export const WIDTH = 26;
export const HEIGHT = 12;
export const WIN_SCORE = 15;

export interface Point {
  x: number;
  y: number;
}
export type StepResult = "moved" | "ate" | "wall" | "self";

export class SnakeEngine {
  snake: Point[] = [
    { x: 6, y: 6 },
    { x: 5, y: 6 },
    { x: 4, y: 6 },
  ];
  dir: Point = { x: 1, y: 0 };
  next: Point = { x: 1, y: 0 };
  food: Point = { x: 0, y: 0 };
  score = 0;

  constructor(
    private readonly random: () => number,
    readonly width = WIDTH,
    readonly height = HEIGHT,
  ) {
    this.placeFood();
  }

  occupied(x: number, y: number): boolean {
    return this.snake.some((p) => p.x === x && p.y === y);
  }

  placeFood(): void {
    let f: Point;
    do {
      f = { x: Math.floor(this.random() * this.width), y: Math.floor(this.random() * this.height) };
    } while (this.occupied(f.x, f.y));
    this.food = f;
  }

  turn(dx: number, dy: number): void {
    if (dx === -this.dir.x && dy === -this.dir.y) return;
    this.next = { x: dx, y: dy };
  }

  speed(): number {
    return Math.max(70, 140 - this.score * 4);
  }

  step(): StepResult {
    this.dir = this.next;
    const head = { x: this.snake[0]!.x + this.dir.x, y: this.snake[0]!.y + this.dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= this.width || head.y >= this.height) return "wall";
    if (this.snake.slice(0, -1).some((p) => p.x === head.x && p.y === head.y)) return "self";
    this.snake.unshift(head);
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      this.placeFood();
      return "ate";
    }
    this.snake.pop();
    return "moved";
  }

  render(note: string, scoreLabel: string): string {
    const rows = [`┌${"─".repeat(this.width)}┐  ${scoreLabel}${this.score}${this.score >= WIN_SCORE ? " ★" : ""}`];
    for (let y = 0; y < this.height; y++) {
      let row = "│";
      for (let x = 0; x < this.width; x++) {
        let ch = " ";
        if (this.food.x === x && this.food.y === y) ch = "*";
        if (this.occupied(x, y)) ch = this.snake[0]!.x === x && this.snake[0]!.y === y ? "@" : "o";
        row += ch;
      }
      rows.push(row + "│");
    }
    rows.push(`└${"─".repeat(this.width)}┘`, note);
    return rows.join("\n");
  }
}

const KEYS: Record<string, [number, number]> = {
  ArrowUp: [0, -1], w: [0, -1],
  ArrowDown: [0, 1], s: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0],
  ArrowRight: [1, 0], d: [1, 0],
};

export const runSnake = (api: GameApi): number => {
  const { t } = api;
  const canvas = api.canvas("text-green-500 select-none");
  const game = new SnakeEngine(api.random);
  const hint = t("arrows / WASD to move · q to quit · 15 apples pays off", "flèches / WASD pour bouger · q pour quitter · 15 pommes, ça paie");
  let timer: ReturnType<typeof setInterval> | undefined;
  let speed = game.speed();
  let over = false;

  const draw = (note = hint) => {
    canvas.setText(game.render(note, t("score ", "score ")));
    api.scroll();
  };
  const finish = (reason: string) => {
    if (over) return;
    over = true;
    clearInterval(timer);
    api.endMode();
    draw(reason);
    api.print(t("Game over. Score: ", "Partie terminée. Score : ") + game.score);
    if (game.score >= WIN_SCORE) api.award(CLIENT_FLAGS.snake);
    else api.print(t("Reach 15 apples for a prize.", "Atteins 15 pommes pour une récompense."), "text-muted-foreground");
  };
  const tick = () => {
    if (over) return;
    const result = game.step();
    if (result === "wall") return finish(t("You hit the wall.", "Tu as heurté le mur."));
    if (result === "self") return finish(t("You bit your own tail.", "Tu t'es mordu la queue."));
    if (result === "ate" && game.speed() !== speed) {
      speed = game.speed();
      clearInterval(timer);
      timer = setInterval(tick, speed);
    }
    draw();
  };

  draw();
  api.setMode({
    prompt: "snake",
    onKey: (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return false;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === "q" || k === "Escape") {
        finish(t("You quit.", "Tu as quitté."));
        return true;
      }
      const dir = KEYS[k];
      if (dir) game.turn(dir[0], dir[1]);
      return true;
    },
    onCtrlC: () => finish(t("You quit.", "Tu as quitté.")),
  });
  timer = setInterval(tick, speed);
  return 0;
};
