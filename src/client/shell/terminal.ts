import { el } from "../shared/dom";
import type { Lang } from "../shared/i18n";
import type { Canvas, Segment, Term } from "./types";

export interface TerminalElements {
  root: HTMLElement;
  screen: HTMLElement;
  form: HTMLFormElement;
  input: HTMLInputElement;
  prompt: HTMLElement;
}

export class DomTerm implements Term {
  constructor(
    private readonly ui: TerminalElements,
    readonly lang: Lang,
    readonly reducedMotion: boolean,
  ) {}

  width(): number {
    return this.ui.screen.clientWidth;
  }

  scroll(): void {
    this.ui.screen.scrollTop = this.ui.screen.scrollHeight;
  }

  print(text: string, cls = ""): void {
    for (const line of text.split("\n")) {
      const d = el("div", `whitespace-pre-wrap break-words ${cls}`.trim());
      d.textContent = line === "" ? " " : line;
      this.ui.screen.appendChild(d);
    }
    this.scroll();
  }

  printRich(lines: Segment[][]): void {
    for (const segs of lines) {
      const d = el("div", "whitespace-pre");
      for (const seg of segs) {
        const s = el("span", seg.cls ?? "", seg.t);
        if (seg.c) s.style.color = seg.c;
        if (seg.bg) s.style.backgroundColor = seg.bg;
        d.appendChild(s);
      }
      this.ui.screen.appendChild(d);
    }
    this.scroll();
  }

  clear(): void {
    this.ui.screen.textContent = "";
  }

  canvas(cls = ""): Canvas {
    const pre = el("pre", `font-mono leading-tight ${cls}`.trim());
    this.ui.screen.appendChild(pre);
    return { setText: (text) => void (pre.textContent = text), remove: () => pre.remove() };
  }

  setPrompt(label: string, color?: string): void {
    this.ui.prompt.textContent = label;
    this.ui.prompt.style.color = color ?? "";
  }

  setMasked(masked: boolean): void {
    this.ui.input.type = masked ? "password" : "text";
  }

  focus(): void {
    this.ui.input.focus({ preventScroll: true });
  }
}
