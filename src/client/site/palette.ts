import { el, mount } from "../shared/dom";
import type { Lang } from "../shared/i18n";

export interface PaletteItem {
  label: string;
  group: string;
  hint?: string;
  href?: string;
  external?: boolean;
  action?: "theme" | "lang";
  copy?: string;
}

export interface PaletteActions {
  navigate(url: string): void;
  openExternal(url: string): void;
  toggleTheme(): void;
  pathname(): string;
  copy(text: string): void;
  toast(title: string, body: string, ms: number): void;
}

export const filterItems = (items: PaletteItem[], query: string): PaletteItem[] => {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    const hay = `${item.label} ${item.group} ${item.hint ?? ""}`.toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });
};

const ACTIVE = ["bg-accent", "text-accent-foreground"];
const INPUT_ATTRS: Record<string, string> = {
  autocomplete: "off",
  name: "palette-search",
  role: "combobox",
  "aria-expanded": "true",
  spellcheck: "false",
  "data-bwignore": "true",
  "data-lpignore": "true",
  "data-1p-ignore": "true",
  "data-form-type": "other",
};

export class Palette {
  private overlay: HTMLElement | null = null;
  private list: HTMLElement | null = null;
  private shown: PaletteItem[] = [];
  private rows: HTMLElement[] = [];
  private active = 0;
  private opener: Element | null = null;
  private mouse = { x: -1, y: -1 };

  constructor(
    private readonly items: PaletteItem[],
    private readonly lang: Lang,
    private readonly actions: PaletteActions,
  ) {}

  get isOpen(): boolean {
    return this.overlay !== null;
  }

  toggle(): void {
    if (this.overlay) this.close();
    else this.open();
  }

  run(item: PaletteItem): void {
    this.close();
    const fr = this.lang === "fr";
    if (item.href) {
      if (item.external) this.actions.openExternal(item.href);
      else this.actions.navigate(item.href);
    } else if (item.action === "theme") this.actions.toggleTheme();
    else if (item.action === "lang") this.actions.navigate(`${this.actions.pathname().replace(/\/$/, "")}/${fr ? "en" : "fr"}`);
    else if (item.copy) {
      this.actions.copy(item.copy);
      this.actions.toast(fr ? "Copié" : "Copied", item.copy, 3000);
    }
  }

  open(): void {
    if (this.overlay) return;
    const fr = this.lang === "fr";
    this.opener = document.activeElement;
    const overlay = el("div", "fixed inset-0 z-[110] flex items-start justify-center bg-black/50 px-4 pt-[15vh] backdrop-blur-sm");
    const box = el("div", "w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-xl");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", fr ? "Palette de commandes" : "Command palette");
    const input = el("input", "w-full border-b border-border bg-transparent px-4 py-3 font-mono text-sm outline-none");
    input.type = "text";
    input.placeholder = fr ? "tape une commande ou une page…" : "type a command or a page…";
    for (const [k, v] of Object.entries(INPUT_ATTRS)) input.setAttribute(k, v);
    const list = el("ul", "max-h-80 overflow-y-auto p-2");
    list.setAttribute("role", "listbox");
    mount(box, input, list);
    overlay.appendChild(box);
    overlay.addEventListener("mousedown", (e) => {
      if (e.target === overlay) this.close();
    });
    input.addEventListener("input", () => this.filter(input.value));
    input.addEventListener("keydown", (e) => this.onKey(e));
    document.body.appendChild(overlay);
    this.overlay = overlay;
    this.list = list;
    this.filter("");
    input.focus();
  }

  close(): void {
    if (!this.overlay) return;
    this.overlay.remove();
    this.overlay = this.list = null;
    (this.opener as HTMLElement | null)?.focus?.();
  }

  private onKey(e: KeyboardEvent): void {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.setActive(Math.min(this.active + 1, this.shown.length - 1), true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.setActive(Math.max(this.active - 1, 0), true);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = this.shown[this.active];
      if (item) this.run(item);
    } else if (e.key === "Escape") {
      e.preventDefault();
      this.close();
    }
  }

  private setActive(i: number, scroll: boolean): void {
    this.rows[this.active]?.classList.remove(...ACTIVE);
    this.active = i;
    const row = this.rows[i];
    if (!row) return;
    row.classList.add(...ACTIVE);
    if (scroll) row.scrollIntoView({ block: "nearest" });
  }

  private filter(query: string): void {
    this.shown = filterItems(this.items, query);
    this.build();
    this.setActive(0, false);
    if (this.list) this.list.scrollTop = 0;
  }

  private build(): void {
    const list = this.list;
    if (!list) return;
    list.textContent = "";
    this.rows = [];
    if (!this.shown.length) {
      list.appendChild(el("li", "px-3 py-6 text-center text-sm text-muted-foreground font-mono", this.lang === "fr" ? "commande introuvable" : "command not found"));
      return;
    }
    let last = "";
    this.shown.forEach((item, i) => {
      if (item.group !== last) {
        last = item.group;
        list.appendChild(el("li", "px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground", item.group));
      }
      const li = el("li", "flex items-center justify-between gap-3 rounded px-3 py-2 text-sm cursor-pointer");
      li.setAttribute("role", "option");
      li.appendChild(el("span", "", item.label));
      if (item.hint) li.appendChild(el("span", "text-xs font-mono text-muted-foreground truncate", item.hint));
      li.addEventListener("mousemove", (e) => {
        if (e.screenX === this.mouse.x && e.screenY === this.mouse.y) return;
        this.mouse = { x: e.screenX, y: e.screenY };
        if (this.active !== i) this.setActive(i, false);
      });
      li.addEventListener("click", () => this.run(item));
      list.appendChild(li);
      this.rows.push(li);
    });
  }
}
