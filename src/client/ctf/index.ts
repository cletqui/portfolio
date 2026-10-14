import { byId } from "../shared/dom";
import { asLang, makeT } from "../shared/i18n";
import { Progress } from "../shared/progress";
import { initFilters } from "./filters";
import { submitFlag } from "./submit";

const storage = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const boot = (): void => {
  const t = makeT(asLang(document.documentElement.lang));
  const progress = new Progress(storage());
  const total = Number(byId("ctf-count")?.dataset.total ?? 0);
  const filters = initFilters(() => new Set(Object.keys(progress.get())));

  const render = () => {
    const found = progress.get();
    const score = byId("ctf-score");
    const count = byId("ctf-count");
    const bar = byId("ctf-progress");
    if (score) score.textContent = String(progress.points());
    if (count) count.textContent = `${progress.count()}/${total}`;
    if (bar) bar.style.width = `${total > 0 ? Math.round((progress.count() / total) * 100) : 0}%`;
    for (const card of document.querySelectorAll<HTMLElement>("[data-challenge]")) {
      const solved = !!found[card.dataset.challenge ?? ""];
      const badge = card.querySelector<HTMLElement>(".challenge-status");
      card.style.outline = solved ? "1px solid #22c55e" : "";
      card.style.opacity = solved ? "0.5" : "";
      card.style.order = solved ? "1" : "";
      if (solved && badge) {
        badge.textContent = t("✓ Solved", "✓ Résolu");
        badge.style.color = "#22c55e";
      }
    }
    filters.refresh();
  };

  const result = byId("ctf-result");
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  const flash = (message: string, type: "success" | "error" | "info") => {
    if (!result) return;
    result.textContent = message;
    result.style.display = "block";
    result.className =
      "mt-2 text-sm px-3 py-2 rounded-md " +
      (type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : type === "error" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-muted text-muted-foreground");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => void (result.style.display = "none"), 4000);
  };

  render();
  const form = byId<HTMLFormElement>("ctf-form");
  const input = byId<HTMLInputElement>("ctf-input");
  const button = byId<HTMLButtonElement>("ctf-btn");
  if (form && input && button) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const flag = input.value.trim();
      if (!flag) return;
      button.disabled = true;
      button.textContent = t("Checking…", "Vérification…");
      const outcome = await submitFlag(flag, progress, (...args) => fetch(...args));
      button.disabled = false;
      button.textContent = t("Submit", "Soumettre");
      if (outcome.kind === "already") flash(t("You already found this flag!", "Vous avez déjà trouvé ce drapeau !"), "info");
      else if (outcome.kind === "success") {
        render();
        flash(`+${outcome.points} pts — ${outcome.name}!`, "success");
        input.value = "";
      } else if (outcome.kind === "invalid") flash(t("Invalid flag. Keep looking!", "Drapeau invalide. Continuez !"), "error");
      else flash(t("Submission failed. Try again.", "Échec de la soumission. Réessayez."), "error");
    });
  }
  byId("ctf-reset")?.addEventListener("click", () => {
    if (!confirm(t("Reset all progress?", "Réinitialiser la progression ?"))) return;
    progress.reset();
    render();
    flash(t("Progress reset.", "Progression réinitialisée."), "info");
  });
};

boot();
