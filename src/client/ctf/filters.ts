export type Status = "" | "solved" | "unsolved";
export type FilterKind = "category" | "difficulty" | "status";

export interface FilterState {
  category: string;
  difficulty: string;
  status: Status;
}
export interface CardInfo {
  id: string;
  category: string;
  difficulty: string;
}

export const emptyFilters = (): FilterState => ({ category: "", difficulty: "", status: "" });

export const isActive = (state: FilterState): boolean => !!(state.category || state.difficulty || state.status);

export const isVisible = (card: CardInfo, state: FilterState, solved: ReadonlySet<string>): boolean => {
  if (state.category && card.category !== state.category) return false;
  if (state.difficulty && card.difficulty !== state.difficulty) return false;
  if (state.status === "solved") return solved.has(card.id);
  if (state.status === "unsolved") return !solved.has(card.id);
  return true;
};

export const toggleFilter = (state: FilterState, kind: FilterKind, value: string): FilterState => ({
  ...state,
  [kind]: state[kind] === value ? "" : value,
});

const BASE = "text-xs px-2.5 py-1 rounded-md font-mono cursor-pointer transition-colors border ";
export const CHIP_ON = BASE + "border-foreground bg-foreground text-background";
export const CHIP_OFF = BASE + "border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/50";

export const initFilters = (getSolved: () => ReadonlySet<string>): { refresh(): void } => {
  let state = emptyFilters();
  const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-challenge]"));
  const buttons = Array.from(document.querySelectorAll<HTMLElement>("[data-filter]"));
  const count = document.getElementById("ctf-filter-count");
  const clear = document.getElementById("ctf-clear");

  const refresh = () => {
    const solved = getSolved();
    let shown = 0;
    for (const card of cards) {
      const info: CardInfo = { id: card.dataset.challenge ?? "", category: card.dataset.category ?? "", difficulty: card.dataset.difficulty ?? "" };
      const visible = isVisible(info, state, solved);
      if (visible) shown++;
      card.style.display = visible ? "" : "none";
    }
    if (count) count.textContent = `${shown} / ${cards.length}`;
    clear?.classList.toggle("hidden", !isActive(state));
    for (const b of buttons) {
      const kind = b.dataset.filter as FilterKind;
      b.className = state[kind] === b.dataset.value ? CHIP_ON : CHIP_OFF;
    }
  };

  for (const b of buttons)
    b.addEventListener("click", () => {
      state = toggleFilter(state, b.dataset.filter as FilterKind, b.dataset.value ?? "");
      refresh();
    });
  clear?.addEventListener("click", () => {
    state = emptyFilters();
    refresh();
  });
  refresh();
  return { refresh };
};
