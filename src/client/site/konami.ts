import { CLIENT_FLAGS } from "../shared/flags";
import type { Translate } from "../shared/i18n";
import { showToast } from "./toast";

export const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export const createSequenceMatcher = (sequence: readonly string[]) => {
  const recent: string[] = [];
  return (rawKey: string): boolean => {
    recent.push(rawKey.length === 1 ? rawKey.toLowerCase() : rawKey);
    if (recent.length > sequence.length) recent.shift();
    const hit = recent.length === sequence.length && recent.every((k, i) => k === sequence[i]);
    if (hit) recent.length = 0;
    return hit;
  };
};

export const initKonami = (t: Translate): void => {
  const matcher = createSequenceMatcher(KONAMI);
  document.addEventListener("keydown", (e) => {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (matcher(e.key)) showToast(t("↑↑↓↓←→←→BA — old school!", "↑↑↓↓←→←→BA — vieille école !"), CLIENT_FLAGS.konami);
  });
};
