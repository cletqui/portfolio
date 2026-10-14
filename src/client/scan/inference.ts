import type { Translate } from "../shared/i18n";
import { uaOs, type EnvSnapshot } from "./env";
import type { ScanState } from "./state";

const CODE_FONTS = /Fira Code|JetBrains Mono|Source Code Pro|Hack/;
const MOODS_EN = ["a night owl, or a different shift.", "early start.", "working hours, are you supposed to be browsing portfolios?", ""];
const MOODS_FR = ["oiseau de nuit, ou autre quart.", "tôt ce matin.", "heures de bureau, tu devrais travailler ?", ""];

export const runInference = (state: ScanState, env: EnvSnapshot, timerMs: number, t: Translate): string[] => {
  const out: string[] = [];
  const { hour, timezone: tz } = env;
  const gpu = state.get("gpu") ?? "";

  const mood = hour >= 23 || hour < 5 ? 0 : hour < 9 ? 1 : hour < 18 ? 2 : 3;
  const en = MOODS_EN[mood]!;
  const fr = MOODS_FR[mood]!;
  out.push(t(`It is ${env.time} in ${tz}${en ? ": " + en : "."}`, `Il est ${env.time} (${tz})${fr ? " : " + fr : "."}`));

  if (gpu) {
    const short = gpu.split("(")[0]!.replace(/,?\s*or similar$/i, "").trim();
    if (/nvidia|geforce|rtx|gtx|radeon rx|radeon pro|arc a/i.test(gpu))
      out.push(t(`A dedicated GPU (${short}): gamer, creator, or just someone who likes fast things.`, `Un GPU dédié (${short}) : gamer, créateur, ou amateur de vitesse.`));
    else if (/apple/i.test(gpu)) out.push(t("Apple silicon, a unified-memory machine and probably a good keyboard.", "Apple silicon, mémoire unifiée et sûrement un bon clavier."));
    else if (/intel|uhd|iris|radeon graphics|vega|adreno|mali|powervr/i.test(gpu))
      out.push(t("An integrated GPU: a laptop or a small form factor, built for efficiency over frames.", "Un GPU intégré : un portable ou un mini-PC, l'efficacité avant les images par seconde."));
    else out.push(t(`GPU: ${short}`, `Carte graphique : ${short}`));
  }

  const layout = state.get("keyboard");
  if (layout?.startsWith("AZERTY")) out.push(t("AZERTY keyboard: francophone, most likely France or Belgium.", "Clavier AZERTY : francophone, très probablement France ou Belgique."));
  else if (layout && /alternative|BÉPO|Dvorak/.test(layout))
    out.push(t(`A non-QWERTY layout (${layout}): you type for a living, or for fun.`, `Une disposition non-QWERTY (${layout}) : tu tapes pour vivre, ou pour le plaisir.`));

  const fonts = state.get("fonts") ?? "";
  if (/Segoe UI|Calibri|Consolas/.test(fonts)) out.push(t("Microsoft fonts installed: Windows (or a Windows font pack).", "Polices Microsoft installées : Windows (ou un pack de polices)."));
  else if (/Ubuntu|DejaVu|Liberation|Cantarell|Noto/.test(fonts)) out.push(t("Linux-flavoured font stack: Ubuntu / DejaVu / Liberation.", "Pile de polices typique Linux : Ubuntu / DejaVu / Liberation."));
  else if (/Helvetica Neue|Menlo|SF Pro/.test(fonts)) out.push(t("Apple system fonts: macOS or iOS.", "Polices système Apple : macOS ou iOS."));
  const codeFont = CODE_FONTS.exec(fonts)?.[0];
  if (codeFont) out.push(t(`Coding fonts installed (${codeFont}): you write code.`, `Polices de code installées (${codeFont}) : tu écris du code.`));
  if (/Adobe Garamond|Minion|Myriad/.test(fonts)) out.push(t("Adobe fonts: design or print work.", "Polices Adobe : du design ou de l'impression."));

  const blocker = state.get("adblock");
  if (blocker === "detected" || blocker === "détecté") out.push(t("A content blocker is running: you care about what loads on your machine.", "Un bloqueur de contenu tourne : tu fais attention à ce qui se charge chez toi."));
  if (env.trackingSignal) out.push(t("You sent a Do-Not-Track / GPC signal. Nobody honours it, but it is a statement.", "Tu as envoyé un signal Do-Not-Track / GPC. Personne ne le respecte, mais c'est un message."));
  if (timerMs >= 50) out.push(t("Fingerprint-resistance is on. Respect, and you are in a very small crowd.", "L'anti-fingerprinting est actif. Respect, et vous êtes très peu nombreux."));
  if (uaOs(env.ua) === "Linux") out.push(t("Linux desktop. I do not need more than that to know we would get along.", "Tu es sous Linux. Rien de plus à savoir, on va s'entendre."));
  if (/^0 cam/.test(state.get("media") ?? "")) out.push(t("No camera is visible to the browser: desktop without a webcam, privacy switch, or blocked.", "Aucune caméra visible par le navigateur : pas de webcam, interrupteur de confidentialité, ou bloquée."));
  if (env.darkMode) out.push(t("Dark mode. Statistically correlates with security people, and with sleeping less.", "Mode sombre. Corrélé aux profils sécu, et à dormir moins."));
  return out;
};
