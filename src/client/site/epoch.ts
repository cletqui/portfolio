export interface Remaining {
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
}

const pad = (n: number): string => String(n).padStart(2, "0");

export const remaining = (targetMs: number, nowMs: number): Remaining => {
  const d = Math.max(0, targetMs - nowMs);
  return {
    days: Math.floor(d / 86_400_000),
    hours: pad(Math.floor((d % 86_400_000) / 3_600_000)),
    minutes: pad(Math.floor((d % 3_600_000) / 60_000)),
    seconds: pad(Math.floor((d % 60_000) / 1000)),
  };
};

export const initEpochCountdown = (): void => {
  const root = document.getElementById("epoch-countdown");
  const target = Number(root?.getAttribute("data-target"));
  if (!root || !Number.isFinite(target)) return;
  const tick = () => {
    const r = remaining(target, Date.now());
    const set = (unit: string, value: string | number) => {
      const node = document.getElementById(`epoch-${unit}`);
      if (node) node.textContent = String(value);
    };
    set("days", r.days);
    set("hours", r.hours);
    set("minutes", r.minutes);
    set("seconds", r.seconds);
  };
  tick();
  setInterval(tick, 1000);
};
