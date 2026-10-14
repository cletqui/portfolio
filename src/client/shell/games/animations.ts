import type { GameApi } from "../types";

const TRAIN = [
  "      (  )   (   )  )        ",
  "       ) (   )  (  (         ",
  "     ___________________     ",
  " ___|  _  _  _  _  _   |__   ",
  "|  __|_||_||_||_||_||__|  |  ",
  "| (O)==(O)==(O)==(O)======|=-",
  " \\_____________________|__/  ",
];
export const SL_WIDTH = 64;

export const slFrameCount = (): number => SL_WIDTH + TRAIN[0]!.length;

export const slFrame = (frame: number): string => {
  const offset = SL_WIDTH - frame;
  return TRAIN.map((row) => (offset >= 0 ? (" ".repeat(offset) + row).slice(0, SL_WIDTH) : row.slice(-offset, SL_WIDTH - offset))).join("\n");
};

export const runSl = (api: GameApi): Promise<number> => {
  const canvas = api.canvas("text-muted-foreground select-none");
  api.print(api.t("(you typed sl instead of ls, it happens to everyone)", "(tu as tapé sl au lieu de ls, ça arrive à tout le monde)"), "text-muted-foreground");
  return new Promise((resolve) => {
    let frame = 0;
    const timer = setInterval(() => {
      if (api.isCancelled() || frame > slFrameCount()) {
        clearInterval(timer);
        canvas.remove();
        resolve(0);
        return;
      }
      canvas.setText(slFrame(frame));
      frame += 2;
      api.scroll();
    }, api.reducedMotion ? 1 : 45);
  });
};

const GLYPHS = "01ABCDEFXYZ$#@%&*+=<>/\\|{}[]ｱｲｳｴｵｶｷｸｹｺ";
export const MATRIX_ROWS = 14;

interface Drop {
  y: number;
  len: number;
  speed: number;
}

export class MatrixRain {
  private drops: Drop[];
  constructor(
    readonly cols: number,
    private readonly random: () => number,
    readonly rows = MATRIX_ROWS,
  ) {
    this.drops = Array.from({ length: cols }, () => ({ y: -Math.floor(random() * rows * 2), len: this.len(), speed: this.speed() }));
  }
  private len = () => 4 + Math.floor(this.random() * 8);
  private speed = () => 1 + Math.floor(this.random() * 2);

  frame(): string {
    const grid = Array.from({ length: this.rows }, () => new Array<string>(this.cols).fill(" "));
    this.drops.forEach((d, c) => {
      for (let k = 0; k < d.len; k++) {
        const y = d.y - k;
        if (y >= 0 && y < this.rows) grid[y]![c] = GLYPHS.charAt(Math.floor(this.random() * GLYPHS.length));
      }
      d.y += d.speed;
      if (d.y - d.len > this.rows) {
        d.y = -Math.floor(this.random() * this.rows);
        d.len = this.len();
        d.speed = this.speed();
      }
    });
    return grid.map((row) => row.join("")).join("\n");
  }
}

export const runCmatrix = (api: GameApi): number => {
  const cols = Math.max(20, Math.min(90, Math.floor(api.width() / 8.6)));
  const canvas = api.canvas("text-green-500 select-none");
  const rain = new MatrixRain(cols, api.random);
  let done = false;
  let ticks = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  const stop = () => {
    if (done) return;
    done = true;
    clearInterval(timer);
    api.endMode();
    canvas.remove();
    api.print(api.t("(wake up, Neo… no wait, that's the other egg)", "(réveille-toi, Neo… non attends, c'est l'autre easter egg)"), "text-muted-foreground");
  };
  const frame = () => {
    canvas.setText(rain.frame());
    if (++ticks > 200) stop();
  };
  api.print(api.t("(press any key to leave the matrix)", "(appuie sur une touche pour quitter la matrice)"), "text-muted-foreground");
  api.setMode({
    prompt: "matrix",
    onKey: (e) => {
      if (e.ctrlKey || e.metaKey) return false;
      stop();
      return true;
    },
    onCtrlC: stop,
  });
  timer = setInterval(frame, 90);
  frame();
  return 0;
};
