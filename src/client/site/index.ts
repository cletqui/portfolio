import { decodeEmail } from "../../data/email-codec";
import { readJson } from "../shared/dom";
import { asLang, makeT, type Lang } from "../shared/i18n";
import { initCopyButtons } from "./copy";
import { installConsoleObject } from "./console";
import { initEmail } from "./email";
import { initEpochCountdown } from "./epoch";
import { initErrorPath } from "./errorpage";
import { initKonami } from "./konami";
import { initMobileMenu } from "./menu";
import { Palette, type PaletteItem } from "./palette";
import { applyTheme, initThemeToggle } from "./theme";
import { showToast } from "./toast";

interface PaletteData {
  lang: Lang;
  items: PaletteItem[];
}

const initPalette = (): void => {
  const data = readJson<PaletteData>("palette-data", { lang: "en", items: [] });
  const items = data.items.map((item) => {
    if (!item.email) return item;
    const address = decodeEmail(item.email);
    return { ...item, copy: address, hint: address };
  });
  const palette = new Palette(items, asLang(data.lang), {
    navigate: (url) => void (location.href = url),
    openExternal: (url) => void window.open(url, "_blank", "noopener,noreferrer"),
    toggleTheme: () => void applyTheme(),
    pathname: () => location.pathname,
    copy: (text) => void navigator.clipboard?.writeText(text),
    toast: showToast,
  });
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      palette.toggle();
    }
  });
  document.addEventListener("click", (e) => {
    if ((e.target as Element | null)?.closest?.("#palette-open")) palette.open();
  });
};

const lang = asLang(document.documentElement.lang);
initCopyButtons();
initEmail();
initKonami(makeT(lang));
installConsoleObject();
initPalette();
initThemeToggle();
initMobileMenu();
initEpochCountdown();
initErrorPath();
