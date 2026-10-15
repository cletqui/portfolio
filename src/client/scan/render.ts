import type { Translate } from "../shared/i18n";
import { entropyOf, oneInN, type Entropy } from "./entropy";
import { icon } from "./icons";
import type { ScanState } from "./state";
import type { Group, LieLevel, Row } from "./types";

export const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

const groupTitles = (t: Translate): [Group, string][] => [
  ["net", t("Network & request", "Réseau & requête")],
  ["browser", t("Browser", "Navigateur")],
  ["display", t("Display", "Affichage")],
  ["hardware", t("Hardware fingerprints", "Empreintes matérielles")],
  ["locale", t("Locale & input", "Locale & saisie")],
  ["prefs", t("Preferences", "Préférences")],
  ["caps", t("Capabilities", "Capacités")],
];

export const bitsClass = (bits: number): string => (bits >= 5 ? "text-amber-500" : bits >= 3 ? "text-foreground" : "text-muted-foreground");

export const valueHtml = (row: Row, t: Translate): string => {
  if (row.value === "true" || row.value === "false") {
    const yes = row.value === "true";
    return `<span class="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${yes ? "bg-foreground/10 text-foreground" : "bg-muted text-muted-foreground"}">${yes ? t("yes", "oui") : t("no", "non")}</span>`;
  }
  return `<span class="font-mono text-xs break-all">${esc(row.value)}</span>`;
};

export const rowHtml = (row: Row, t: Translate): string =>
  `<li class="grid grid-cols-[7.5rem_1fr_auto] items-baseline gap-x-3 border-b border-border py-2 first:pt-0 last:border-0 last:pb-0">` +
  `<span class="text-xs text-muted-foreground">${esc(row.label)}</span><span>${valueHtml(row, t)}</span>` +
  (row.bits ? `<span class="font-mono text-[10px] ${bitsClass(row.bits)}" title="${esc(t("estimated identifying information", "information identifiante estimée"))}">+${row.bits.toFixed(1)}</span>` : "<span></span>") +
  "</li>";

export const cardHtml = (iconName: string, title: string, body: string, badge = ""): string =>
  `<section class="card"><h3 class="mb-3 flex items-center gap-2 text-sm font-semibold">${icon(iconName, "text-muted-foreground")}${esc(title)}${badge ? `<span class="ml-auto">${badge}</span>` : ""}</h3>${body}</section>`;

export const groupsHtml = (state: ScanState, t: Translate): string =>
  groupTitles(t)
    .map(([group, title]) => {
      const rows = state.inGroup(group);
      if (!rows.length) return "";
      return cardHtml(group, title, `<ul>${rows.map((r) => rowHtml(r, t)).join("")}</ul>`, `<span class="font-mono text-[10px] text-muted-foreground">${rows.length}</span>`);
    })
    .join("");

const LIE_STYLE: Record<LieLevel, [string, string]> = {
  ok: ["check", "text-green-500"],
  warn: ["warn", "text-amber-500"],
  bad: ["bad", "text-destructive"],
  info: ["info", "text-sky-500"],
};
const LIE_ORDER: Record<LieLevel, number> = { bad: 0, warn: 1, info: 2, ok: 3 };

export const flaggedCount = (state: ScanState): number => state.lies.filter((l) => l.level === "bad" || l.level === "warn").length;

export const rtcHtml = (state: ScanState, t: Translate): string => {
  if (state.rtc === "idle")
    return `<div class="mt-4 space-y-2 border-t border-border pt-3"><p class="text-xs text-muted-foreground">${esc(t("Optional: WebRTC can reveal your real public IP behind a VPN. It contacts Google's public STUN server, the only request on this page that leaves your browser.", "Optionnel : WebRTC peut révéler ta vraie IP publique derrière un VPN. Cela contacte le serveur STUN public de Google, la seule requête de cette page qui quitte ton navigateur."))}</p><button type="button" id="scan-rtc" class="btn btn-secondary">${esc(t("Run WebRTC leak test", "Lancer le test de fuite WebRTC"))}</button></div>`;
  if (state.rtc === "running") return `<p class="mt-4 border-t border-border pt-3 font-mono text-xs text-muted-foreground">${esc(t("gathering ICE candidates…", "collecte des candidats ICE…"))}</p>`;
  return "";
};

export const liesHtml = (state: ScanState, t: Translate): string => {
  const flagged = flaggedCount(state);
  const badge = flagged
    ? `<span class="rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-medium text-amber-500">${flagged} ${t("flagged", "signalé(s)")}</span>`
    : `<span class="rounded bg-green-500/15 px-1.5 py-0.5 text-[11px] font-medium text-green-500">${t("consistent", "cohérent")}</span>`;
  const items = [...state.lies]
    .sort((a, b) => LIE_ORDER[a.level] - LIE_ORDER[b.level])
    .map((l) => {
      const [name, cls] = LIE_STYLE[l.level];
      return `<li class="flex gap-2.5"><span class="${cls} mt-0.5">${icon(name)}</span><div class="min-w-0"><div class="text-sm font-medium leading-snug">${esc(l.title)}</div><div class="break-words text-xs text-muted-foreground">${esc(l.detail)}</div></div></li>`;
    })
    .join("");
  const body = `<p class="mb-3 text-xs text-muted-foreground">${esc(t("What your browser claims versus what it actually does.", "Ce que ton navigateur annonce face à ce qu'il fait vraiment."))}</p><ul class="space-y-3">${items}</ul>${rtcHtml(state, t)}`;
  return cardHtml("lies", t("Lie detector", "Détecteur de mensonges"), body, badge);
};

export const inferHtml = (state: ScanState, t: Translate): string =>
  state.infer.length
    ? `<div class="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">// ${esc(t("what", "quoi"))}</div>` +
      `<ul class="space-y-1.5 text-sm leading-relaxed">${state.infer.map((s) => `<li class="flex gap-2"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50"></span><span>${esc(s)}</span></li>`).join("")}</ul>`
    : "";

export const verdict = (e: Entropy, t: Translate): string =>
  e.unique
    ? t("Statistically unique among everyone online.", "Statistiquement unique parmi toutes les personnes connectées.")
    : t(`Roughly 1 in ${oneInN(e.total).toLocaleString()}`, `Environ 1 sur ${oneInN(e.total).toLocaleString()}`);

const legendItem = (term: string, text: string): string =>
  `<li class="flex gap-2"><span class="w-28 shrink-0 font-mono">${esc(term)}</span><span>${esc(text)}</span></li>`;

export const entropyHtml = (state: ScanState, id: string, t: Translate): string => {
  const e = entropyOf(state.rows);
  const max = e.top[0]?.bits ?? 1;
  const bars = e.top
    .map((r) => `<div class="flex items-center gap-2 text-xs"><span class="w-32 shrink-0 truncate opacity-70">${esc(r.label)}</span><div class="h-1.5 flex-1 overflow-hidden rounded bg-primary-foreground/15"><div class="h-full rounded bg-primary-foreground/80" style="width:${Math.round((r.bits / max) * 100)}%"></div></div><span class="w-8 text-right font-mono opacity-70">+${r.bits.toFixed(1)}</span></div>`)
    .join("");
  const legend = [
    legendItem(t("bit", "bit"), t("each bit halves the crowd that looks like you: 10 bits ≈ 1 in 1,000, 20 ≈ 1 in a million, 33 ≈ 1 in 8 billion, i.e. you alone.", "chaque bit divise par deux la foule qui te ressemble : 10 bits ≈ 1 sur 1 000, 20 ≈ 1 sur un million, 33 ≈ 1 sur 8 milliards, donc toi seul·e.")),
    legendItem(t("+3.2 on a row", "+3,2 sur une ligne"), t("the bits that attribute adds. Rare values add more, common ones almost nothing.", "les bits qu'apporte cet attribut. Une valeur rare en apporte beaucoup, une valeur courante presque aucun.")),
    legendItem(t("total", "total"), t("not a plain sum, because attributes overlap (your OS predicts your fonts). It levels off near 33.", "pas une simple somme, car les attributs se recoupent (ton OS prédit tes polices). Il plafonne vers 33.")),
    legendItem(t("ID", "ID"), t("a hash of the stable attributes. Reload: same ID. Private window or another browser: different.", "un hash des attributs stables. Recharge : même ID. Fenêtre privée ou autre navigateur : autre ID.")),
  ].join("");
  return (
    `<section class="card-primary"><div class="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"><div class="space-y-4">` +
    `<h3 class="flex items-center gap-2 text-sm font-semibold">${icon("fp")}${esc(t("Your fingerprint", "Ton empreinte"))}</h3>` +
    `<div><div class="text-xs opacity-60">${esc(t("Fingerprint ID", "ID d'empreinte"))}</div><div class="break-all font-mono text-2xl tracking-wider">${esc(id)}</div></div>` +
    `<div><div class="mb-1 flex items-baseline justify-between"><span class="text-xs opacity-60">${esc(t("How identifiable you are", "À quel point on peut t'identifier"))}</span><span class="font-mono text-sm">~${e.total.toFixed(0)} / 33 bits</span></div>` +
    `<div class="h-2 overflow-hidden rounded bg-primary-foreground/15"><div class="h-full rounded ${e.unique ? "bg-amber-400" : "bg-green-400"}" style="width:${e.percent}%"></div></div>` +
    `<div class="mt-1 flex justify-between font-mono text-[10px] opacity-50"><span>${esc(t("blends in", "dans la masse"))}</span><span>${esc(t("unique", "unique"))}</span></div></div>` +
    `<p class="text-sm font-medium">${esc(verdict(e, t))}</p></div>` +
    `<div class="space-y-1.5"><div class="mb-2 text-xs opacity-60">${esc(t("What gives you away the most", "Ce qui te trahit le plus"))}</div>${bars}</div></div>` +
    `<div class="mt-5 border-t border-primary-foreground/15 pt-3"><div class="mb-2 text-xs font-medium opacity-80">${esc(t("How to read this", "Comment lire ça"))}</div><ul class="space-y-1 text-xs opacity-70">${legend}</ul>` +
    `<p class="mt-3 text-[11px] opacity-50">${esc(t("Estimates drawn from public fingerprinting studies, not a measurement of the whole web.", "Estimations tirées d'études publiques sur le fingerprinting, pas une mesure de tout le web."))}</p></div></section>`
  );
};

export const resultsHtml = (state: ScanState, id: string, t: Translate): string =>
  entropyHtml(state, id, t) +
  `<div class="columns-1 gap-6 lg:columns-2 [&>*]:mb-6 [&>*]:break-inside-avoid">${liesHtml(state, t)}${groupsHtml(state, t)}</div>`;
