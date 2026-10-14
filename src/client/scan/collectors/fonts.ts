import type { Collector } from "./context";

export const FONTS = [
  "Arial", "Arial Black", "Arial Narrow", "Calibri", "Cambria", "Cambria Math", "Candara", "Comic Sans MS", "Consolas",
  "Constantia", "Corbel", "Courier New", "Franklin Gothic Medium", "Gabriola", "Georgia", "Impact", "Lucida Console",
  "Lucida Sans Unicode", "Microsoft Sans Serif", "Palatino Linotype", "Segoe UI", "Segoe UI Emoji", "Tahoma",
  "Times New Roman", "Trebuchet MS", "Verdana", "Helvetica", "Helvetica Neue", "Menlo", "Monaco", "Geneva", "Optima",
  "Futura", "Gill Sans", "Avenir", "Avenir Next", "American Typewriter", "Baskerville", "Didot", "Hoefler Text",
  "SF Pro Text", "Apple Color Emoji", "Ubuntu", "Ubuntu Mono", "Cantarell", "DejaVu Sans", "DejaVu Sans Mono",
  "Liberation Sans", "Liberation Mono", "Noto Sans", "Noto Color Emoji", "Droid Sans", "Roboto", "Open Sans",
  "Fira Code", "Fira Sans", "JetBrains Mono", "Source Code Pro", "Hack", "Inconsolata", "Adobe Garamond Pro",
  "Minion Pro", "Myriad Pro", "Wingdings", "MS Gothic", "SimSun", "Meiryo", "Malgun Gothic",
];

const BASES = ["monospace", "sans-serif", "serif"] as const;

export const detectFonts = (measure: (family: string) => string, candidates: string[] = FONTS): string[] => {
  const baseline = Object.fromEntries(BASES.map((b) => [b, measure(b)]));
  return candidates.filter((font) => BASES.some((b) => measure(`'${font}',${b}`) !== baseline[b]));
};

export const summariseFonts = (found: string[], total: number): string =>
  `${found.length}/${total}${found.length ? ` · ${found.slice(0, 8).join(", ")}${found.length > 8 ? "…" : ""}` : ""}`;

export const collectFonts: Collector = ({ state, t }) => {
  const span = document.createElement("span");
  span.textContent = "mmmmmmmmmmlli1WwOo0";
  span.style.cssText = "position:absolute;left:-9999px;top:-9999px;font-size:72px;visibility:hidden";
  document.body.appendChild(span);
  const found = detectFonts((family) => {
    span.style.fontFamily = family;
    return `${span.offsetWidth}x${span.offsetHeight}`;
  });
  span.remove();
  state.add("hardware", "fonts", t("Fonts detected", "Polices détectées"), summariseFonts(found, FONTS.length), 7);
};
