import { fnv, sha } from "../../shared/hash";
import { detectEngine, nav } from "../env";
import { unavailable, type Collector } from "./context";

export const collectNavigator: Collector = ({ state, t }) => {
  const n = nav();
  state.add("browser", "ua", "User-Agent", n.userAgent, 10);
  state.add("browser", "platform", "navigator.platform", n.platform, 2);
  state.add("browser", "vendor", t("Vendor", "Éditeur"), n.vendor, 1);
  state.add("browser", "langs", t("JS languages", "Langues JS"), (n.languages ?? [n.language]).join(", "), 5);
  state.add("browser", "cores", t("CPU threads", "Threads CPU"), n.hardwareConcurrency, 2.5);
  if (n.deviceMemory) state.add("browser", "mem", t("Device memory", "Mémoire"), `${n.deviceMemory} GB (${t("capped at 8", "plafonné à 8")})`, 2);
  state.add("browser", "touch", t("Touch points", "Points tactiles"), n.maxTouchPoints, 1.5);
  state.add("browser", "pdf", t("PDF viewer", "Lecteur PDF"), n.pdfViewerEnabled, 0.5);
  state.add("browser", "dnt", "Do Not Track / GPC", `DNT=${n.doNotTrack ?? "unset"} · GPC=${n.globalPrivacyControl ? "on" : "unset"}`, 1);
  state.add("browser", "webdriver", "navigator.webdriver", String(!!n.webdriver), 0);
  state.add("browser", "cookies", t("Cookies enabled", "Cookies activés"), n.cookieEnabled, 0.3);
  state.add("browser", "history", t("History length", "Taille de l'historique"), history.length, 0, false);
  state.add("browser", "referrer", "document.referrer", document.referrer || t("(none)", "(aucun)"), 0, false);
  const c = n.connection ?? n.mozConnection;
  if (c)
    state.add("net", "conn", t("Connection API", "API connexion"), [c.effectiveType, c.downlink && `${c.downlink} Mbps`, c.rtt && `${c.rtt} ms`, c.saveData && "save-data"].filter(Boolean).join(" · "), 1.5, false);
};

export const collectHighEntropy: Collector = async ({ state, t }) => {
  const uad = nav().userAgentData;
  if (!uad?.getHighEntropyValues) unavailable(t("not exposed (non-Chromium)", "non exposé (hors Chromium)"));
  const h = (await uad!.getHighEntropyValues!(["architecture", "bitness", "model", "platformVersion", "fullVersionList", "wow64"])) as {
    platformVersion?: string;
    architecture?: string;
    bitness?: string;
    wow64?: boolean;
    model?: string;
    fullVersionList?: { brand: string; version: string }[];
  };
  state.add("browser", "uad-platform", "Client Hints platform", `${uad!.platform ?? ""} ${h.platformVersion ?? ""}`, 3);
  state.add("browser", "uad-arch", "Client Hints arch", `${h.architecture ?? ""}${h.bitness ? "-" + h.bitness : ""}${h.wow64 ? " (WoW64)" : ""}`, 2);
  if (h.model) state.add("browser", "uad-model", t("Device model", "Modèle d'appareil"), h.model, 5);
  if (h.fullVersionList) state.add("browser", "uad-brands", t("Full versions", "Versions complètes"), h.fullVersionList.map((b) => `${b.brand} ${b.version}`).join(", "), 4);
};

export const collectNavigatorDeep: Collector = async ({ state, t }) => {
  const n = nav();
  const own = Object.getOwnPropertyNames(n);
  const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(n));
  const h = await sha(`${own.join(",")}|${proto.join(",")}`);
  state.add("browser", "navprops", t("Navigator properties", "Propriétés du navigator"), `${proto.length} · ${h.slice(0, 12)}`, 5);
  state.add("browser", "product", "product / productSub / vendorSub", [n.product, n.productSub, n.vendorSub || "-"].join(" / "), 1.5);
  state.add("browser", "buildid", "buildID", n.buildID, 3);
  state.add("browser", "java", "javaEnabled", typeof n.javaEnabled === "function" ? String(n.javaEnabled()) : "n/a", 0.2);
};

export const collectPlugins: Collector = ({ state, t }) => {
  const names = Array.from(navigator.plugins ?? [], (p) => p.name);
  const mimes = Array.from(navigator.mimeTypes ?? [], (m) => m.type);
  state.add("browser", "plugins", "Plugins", names.length + (names.length ? ` · ${names.slice(0, 3).join(", ")}${names.length > 3 ? "…" : ""}` : ""), 2);
  state.add("browser", "mimes", t("MIME types", "Types MIME"), `${mimes.length} · ${fnv(mimes.join(","))}`, 2);
};

const PROBES: (() => unknown)[] = [
  () => (null as unknown as { x: unknown }).x,
  () => (undefined as unknown as () => void)(),
  () => new Array(-1),
  () => (1).toFixed(101),
  () => JSON.parse("{"),
  () => decodeURIComponent("%"),
];

export const errorMessages = (probes: (() => unknown)[] = PROBES): string[] => {
  const out: string[] = [];
  for (const probe of probes) {
    try {
      probe();
    } catch (e) {
      out.push(String((e as Error)?.message));
    }
  }
  return out;
};

export const collectEngineQuirks: Collector = async ({ state, t }) => {
  const h = await sha(errorMessages().join("|"));
  state.add("browser", "errors", t("Error messages", "Messages d'erreur"), h.slice(0, 12), 2.5);
  state.add("browser", "evalen", "eval.toString().length", String(eval.toString().length), 1.2);
};

export const collectMath: Collector = async ({ state, t }) => {
  const v = [Math.tan(-1e300), Math.sinh(1), Math.expm1(1), Math.cbrt(100), Math.atanh(0.5), Math.PI ** -100].join("|");
  const h = await sha(v);
  state.add("browser", "math", t("JS math quirks", "Particularités maths JS"), `${h.slice(0, 12)} · ${detectEngine()}`, 3);
};
