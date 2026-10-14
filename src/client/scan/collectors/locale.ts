import { nav } from "../env";
import { unavailable, type Collector } from "./context";

export const keyboardLayout = (keys: Record<"KeyQ" | "KeyW" | "KeyY" | "KeyE" | "KeyR", string | undefined>, alternative: string): string => {
  const { KeyQ: q, KeyW: w, KeyY: y } = keys;
  if (q === "a") return "AZERTY";
  if (y === "z") return "QWERTZ";
  if (q === "'") return "Dvorak";
  if (q === "b") return "BÉPO";
  if (q === "q" && w === "w") return "QWERTY";
  return `${alternative} (${[q, w, keys.KeyE, keys.KeyR].join("")})`;
};

export const collectLocale: Collector = ({ state, t }) => {
  const o = Intl.DateTimeFormat().resolvedOptions();
  state.add("locale", "tz", t("Timezone", "Fuseau horaire"), o.timeZone, 3);
  state.add("locale", "locale", "Locale", o.locale, 3);
  state.add("locale", "cal", t("Calendar / numbering", "Calendrier / chiffres"), `${o.calendar} / ${o.numberingSystem}`, 0.5);
  state.add("locale", "offset", t("UTC offset", "Décalage UTC"), `${-new Date().getTimezoneOffset() / 60} h`, 0, false);
  state.add("locale", "datefmt", t("Date format", "Format de date"), new Date(Date.UTC(2001, 11, 31, 23, 59, 58)).toLocaleString(), 2);
  state.add("locale", "numfmt", t("Number format", "Format de nombre"), (1234567.891).toLocaleString(), 1);
  state.add("locale", "localtime", t("Your local time", "Ton heure locale"), new Date().toLocaleTimeString(), 0, false);
};

export const collectVoices: Collector = ({ state, t }) => {
  if (!window.speechSynthesis) unavailable(t("no speechSynthesis", "pas de speechSynthesis"));
  return new Promise<void>((resolve) => {
    const read = (): boolean => {
      const voices = speechSynthesis.getVoices();
      if (!voices.length) return false;
      const langs = [...new Set(voices.map((v) => v.lang))];
      state.add("locale", "voices", t("Speech voices", "Voix de synthèse"), `${voices.length} · ${langs.slice(0, 6).join(", ")}`, 4);
      resolve();
      return true;
    };
    if (read()) return;
    speechSynthesis.addEventListener("voiceschanged", read);
    setTimeout(resolve, 900);
  });
};

export const collectKeyboard: Collector = async ({ state, t }) => {
  const kb = nav().keyboard;
  if (!kb?.getLayoutMap) unavailable(t("Keyboard API not exposed", "API clavier non exposée"));
  const map = await kb!.getLayoutMap!();
  const keys = { KeyQ: map.get("KeyQ"), KeyW: map.get("KeyW"), KeyY: map.get("KeyY"), KeyE: map.get("KeyE"), KeyR: map.get("KeyR") };
  state.add("locale", "keyboard", t("Keyboard layout", "Disposition clavier"), keyboardLayout(keys, t("alternative layout", "disposition alternative")), 2.5);
};
