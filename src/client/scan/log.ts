import { el } from "../shared/dom";

export type LogState = "ok" | "warn" | "plain";

const COLORS: Record<LogState, string> = { ok: "text-green-500", warn: "text-amber-500", plain: "text-muted-foreground" };

export class TerminalLog {
  private queue: { text: string; state: LogState }[] = [];
  private draining = false;

  constructor(
    private readonly host: HTMLElement | null,
    private readonly delayMs: number,
  ) {}

  push(text: string, state: LogState = "plain"): void {
    if (!this.host) return;
    this.queue.push({ text, state });
    if (!this.draining) this.drain();
  }

  private drain(): void {
    this.draining = true;
    const next = () => {
      const item = this.queue.shift();
      if (!item || !this.host) {
        this.draining = false;
        return;
      }
      this.host.appendChild(el("p", COLORS[item.state], item.text));
      this.host.scrollTop = this.host.scrollHeight;
      setTimeout(next, this.delayMs);
    };
    next();
  }
}
