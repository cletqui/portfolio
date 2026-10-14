import { el } from "../shared/dom";

export interface WindowParts {
  slot: HTMLElement;
  root: HTMLElement;
  screen: HTMLElement;
  form: HTMLElement;
  titlebar: HTMLElement;
  close: HTMLElement;
  minimize: HTMLElement;
  maximize: HTMLElement;
}

const ROOT_FULL = ["fixed", "inset-3", "sm:inset-10", "z-[90]", "flex", "flex-col", "shadow-2xl", "bg-background"];
const SCREEN_FIXED = ["h-[26rem]"];
const SCREEN_FLEX = ["min-h-0", "flex-1"];

export class TerminalWindow {
  private full = false;
  private minimized = false;
  private backdrop: HTMLElement | null = null;

  constructor(
    private readonly parts: WindowParts,
    private readonly canEscape: () => boolean,
    private readonly onChange: () => void,
  ) {
    const { close, minimize, maximize, titlebar } = parts;
    maximize.addEventListener("click", () => this.toggleFullscreen());
    minimize.addEventListener("click", () => this.toggleMinimize());
    close.addEventListener("click", () => (this.full ? this.setFullscreen(false) : this.setMinimized(true)));
    titlebar.addEventListener("dblclick", () => this.toggleFullscreen());
    titlebar.addEventListener("click", (e) => {
      if (this.minimized && e.target === titlebar) this.setMinimized(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.full && this.canEscape()) this.setFullscreen(false);
    });
  }

  get isFullscreen(): boolean {
    return this.full;
  }

  toggleFullscreen(): void {
    this.setFullscreen(!this.full);
  }

  toggleMinimize(): void {
    this.setMinimized(!this.minimized);
  }

  setMinimized(value: boolean): void {
    if (value && this.full) this.setFullscreen(false);
    this.minimized = value;
    const { screen, form } = this.parts;
    screen.classList.toggle("hidden", value);
    form.classList.toggle("hidden", value);
    this.parts.minimize.setAttribute("aria-pressed", String(value));
    this.onChange();
  }

  setFullscreen(value: boolean): void {
    if (value === this.full) return;
    if (value && this.minimized) this.setMinimized(false);
    const { slot, root, screen } = this.parts;
    this.full = value;
    if (value) {
      slot.style.minHeight = `${root.offsetHeight}px`;
      this.backdrop = el("div", "fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm");
      this.backdrop.addEventListener("click", () => this.setFullscreen(false));
      document.body.appendChild(this.backdrop);
      document.body.appendChild(root);
    } else {
      this.backdrop?.remove();
      this.backdrop = null;
      slot.style.minHeight = "";
      slot.appendChild(root);
    }
    document.documentElement.classList.toggle("overflow-hidden", value);
    root.classList.toggle("bg-muted/40", !value);
    ROOT_FULL.forEach((c) => root.classList.toggle(c, value));
    SCREEN_FIXED.forEach((c) => screen.classList.toggle(c, !value));
    SCREEN_FLEX.forEach((c) => screen.classList.toggle(c, value));
    this.parts.maximize.setAttribute("aria-pressed", String(value));
    this.onChange();
  }
}
