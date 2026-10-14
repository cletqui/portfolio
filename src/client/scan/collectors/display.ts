import { mq } from "../env";
import type { Collector } from "./context";

export const gamut = (): string => (mq("(color-gamut: rec2020)") ? "rec2020" : mq("(color-gamut: p3)") ? "p3" : mq("(color-gamut: srgb)") ? "srgb" : "?");
export const contrast = (): string => (mq("(prefers-contrast: more)") ? "more" : mq("(prefers-contrast: less)") ? "less" : "no-preference");
export const pointer = (): string => `${mq("(pointer: fine)") ? "fine" : mq("(pointer: coarse)") ? "coarse" : "none"} / ${mq("(hover: hover)") ? "hover" : "no-hover"}`;

export const collectDisplay: Collector = ({ state, t }) => {
  const s = screen;
  state.add("display", "screen", t("Screen", "Écran"), `${s.width}×${s.height}`, 4.8);
  state.add("display", "avail", t("Available area", "Zone disponible"), `${s.availWidth}×${s.availHeight}`, 2);
  state.add("display", "dpr", t("Pixel ratio", "Ratio de pixels"), window.devicePixelRatio, 2);
  state.add("display", "depth", t("Color depth", "Profondeur couleur"), `${s.colorDepth} bit`, 1);
  state.add("display", "viewport", t("Viewport", "Fenêtre"), `${window.innerWidth}×${window.innerHeight}`, 0, false);
  state.add("display", "gamut", t("Color gamut", "Gamut couleur"), gamut(), 1.5);
  state.add("display", "hdr", "HDR", mq("(dynamic-range: high)"), 1);
  state.add("display", "orientation", "Orientation", s.orientation?.type, 0.5, false);
  state.add("prefs", "scheme", t("Color scheme", "Thème"), mq("(prefers-color-scheme: dark)") ? t("dark", "sombre") : t("light", "clair"), 1);
  state.add("prefs", "motion", t("Reduced motion", "Animations réduites"), mq("(prefers-reduced-motion: reduce)"), 0.5);
  state.add("prefs", "contrast", t("Contrast preference", "Contraste"), contrast(), 0.5);
  state.add("prefs", "forced", "forced-colors", mq("(forced-colors: active)"), 0.5);
  state.add("prefs", "inverted", "inverted-colors", mq("(inverted-colors: inverted)"), 0.3);
  state.add("prefs", "pointer", t("Pointer / hover", "Pointeur / survol"), pointer(), 1.5);
};

export const collectWindowChrome: Collector = ({ state, t }) => {
  const bars = (["locationbar", "menubar", "personalbar", "statusbar", "toolbar", "scrollbars"] as const).map((k) => (window[k]?.visible ? 1 : 0));
  state.add("display", "bars", t("Window bars", "Barres de la fenêtre"), bars.join(""), 1);
  const avail = screen as Screen & { availLeft?: number; availTop?: number };
  state.add("display", "winpos", t("Window position", "Position de la fenêtre"), `${window.screenX},${window.screenY} · ${t("avail", "dispo")} ${avail.availLeft ?? 0},${avail.availTop ?? 0}`, 0, false);
};
