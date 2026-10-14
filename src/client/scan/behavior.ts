import { el, mount } from "../shared/dom";
import type { Translate } from "../shared/i18n";
import { icon } from "./icons";
import { esc } from "./render";

const mean = (xs: number[]): number => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const std = (xs: number[]): number => {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};

export interface BehaviorScore {
  score: number;
  intervals: number[];
}

export class BehaviorTracker {
  moves = 0;
  turns = 0;
  speeds: number[] = [];
  keys = 0;
  keyTimes: number[] = [];
  scrolls = 0;
  touches = 0;
  untrusted = 0;
  private last: { x: number; y: number; t: number; angle: number | null } | null = null;

  mouse(x: number, y: number, t: number, trusted = true): void {
    if (!trusted) this.untrusted++;
    const prev = this.last;
    let angle: number | null = prev?.angle ?? null;
    if (prev) {
      const dx = x - prev.x;
      const dy = y - prev.y;
      const d = Math.hypot(dx, dy);
      const dt = t - prev.t;
      if (d > 0 && dt > 0) {
        this.moves++;
        if (dt < 200) {
          this.speeds.push((d / dt) * 1000);
          if (this.speeds.length > 400) this.speeds.shift();
        }
        const a = Math.atan2(dy, dx);
        if (angle !== null) {
          let diff = Math.abs(a - angle);
          if (diff > Math.PI) diff = 2 * Math.PI - diff;
          if (diff > 0.35) this.turns++;
        }
        angle = a;
      }
    }
    this.last = { x, y, t, angle };
  }

  scroll(): void {
    this.scrolls++;
  }

  touch(trusted = true): void {
    if (!trusted) this.untrusted++;
    this.touches++;
  }

  key(t: number, trusted = true): void {
    if (!trusted) this.untrusted++;
    this.keys++;
    this.keyTimes.push(t);
    if (this.keyTimes.length > 200) this.keyTimes.shift();
  }

  intervals(): number[] {
    return this.keyTimes.slice(1).map((t, i) => t - this.keyTimes[i]!);
  }

  score(): BehaviorScore {
    if (this.untrusted) return { score: 0, intervals: this.intervals() };
    const intervals = this.intervals();
    const speedCv = mean(this.speeds) ? std(this.speeds) / mean(this.speeds) : 0;
    const checks = [
      (this.moves >= 30 && this.turns >= 5) || this.touches >= 3,
      this.speeds.length >= 20 && speedCv > 0.5,
      intervals.length >= 8 && mean(intervals) > 0 && std(intervals) / mean(intervals) > 0.25,
      this.scrolls >= 2,
    ];
    return { score: checks.filter(Boolean).length * 25, intervals };
  }

  stats(): [string, number][] {
    const iv = this.intervals();
    return [
      ["moves", this.moves],
      ["turns", this.turns],
      ["speed", Math.round(mean(this.speeds))],
      ["scrolls", this.scrolls],
      ["keys", this.keys],
      ["gap", Math.round(mean(iv))],
      ["sigma", Math.round(std(iv))],
      ["synthetic", this.untrusted],
    ];
  }
}

export const initBehaviorPanel = (panel: HTMLElement, t: Translate): BehaviorTracker => {
  const tracker = new BehaviorTracker();
  const labels: Record<string, string> = {
    moves: t("mouse moves", "mouvements"),
    turns: t("direction changes", "changements de direction"),
    speed: t("avg speed px/s", "vitesse moy. px/s"),
    scrolls: t("scroll events", "défilements"),
    keys: t("keystrokes", "frappes"),
    gap: t("avg key gap ms", "écart moy. touches ms"),
    sigma: t("rhythm σ ms", "rythme σ ms"),
    synthetic: t("synthetic events", "événements synthétiques"),
  };

  panel.classList.remove("hidden");
  panel.innerHTML =
    `<h3 class="flex items-center gap-2 text-sm font-semibold">${icon("behavior", "text-muted-foreground")}${esc(t("Behavioural biometrics", "Biométrie comportementale"))}</h3>` +
    `<p class="text-xs text-muted-foreground">${esc(t("Move your mouse, scroll, and type a sentence below. Sites use movement curves and keystroke rhythm to tell humans from bots, and sometimes to recognise you. Nothing leaves this page.", "Bouge la souris, scrolle et tape une phrase ci-dessous. Les sites utilisent les trajectoires et le rythme de frappe pour distinguer humains et bots, et parfois pour te reconnaître. Rien ne quitte cette page."))}</p>` +
    `<textarea id="scan-type" rows="2" class="w-full rounded border border-border bg-background p-2 text-sm font-mono" placeholder="${esc(t("type something here…", "tape quelque chose ici…"))}"></textarea>` +
    `<div class="grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-4" id="scan-bstats"></div>` +
    `<div><div class="mb-1 flex justify-between text-xs"><span class="text-muted-foreground">${esc(t("Human-likeness (toy model)", "Humanité (modèle jouet)"))}</span><span id="scan-bscore">0%</span></div><div class="h-2 overflow-hidden rounded bg-muted"><div id="scan-bbar" class="h-full bg-green-500 transition-all" style="width:0%"></div></div></div>`;

  const stats = panel.querySelector<HTMLElement>("#scan-bstats")!;
  const scoreLabel = panel.querySelector<HTMLElement>("#scan-bscore")!;
  const bar = panel.querySelector<HTMLElement>("#scan-bbar")!;
  let pending = false;
  const refresh = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      const { score } = tracker.score();
      stats.textContent = "";
      for (const [key, value] of tracker.stats()) {
        const cell = el("div");
        stats.appendChild(mount(cell, el("div", "text-muted-foreground", labels[key]), el("div", "text-base", String(value))));
      }
      scoreLabel.textContent = `${score}%`;
      bar.style.width = `${score}%`;
    });
  };

  document.addEventListener("mousemove", (e) => (tracker.mouse(e.clientX, e.clientY, performance.now(), e.isTrusted), refresh()), { passive: true });
  document.addEventListener("scroll", () => (tracker.scroll(), refresh()), { passive: true });
  document.addEventListener("touchmove", (e) => (tracker.touch(e.isTrusted), refresh()), { passive: true });
  document.addEventListener("keydown", (e) => {
    if ((e.target as HTMLElement | null)?.id !== "scan-type") return;
    tracker.key(performance.now(), e.isTrusted);
    refresh();
  });
  refresh();
  return tracker;
};
