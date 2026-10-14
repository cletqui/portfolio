import type { Translate } from "../shared/i18n";
import { platformOs, uaEngine, uaOs, type EnvSnapshot } from "./env";
import type { ScanState } from "./state";
import type { ServerSignals } from "./types";

const SOFTWARE_GPU = /swiftshader|llvmpipe|software|microsoft basic render|virtualbox|vmware|parallels/i;

export const runChecks = (state: ScanState, signals: ServerSignals, env: EnvSnapshot, timerMs: number, t: Translate): void => {
  const { ua } = env;

  const osUA = uaOs(ua);
  const osReal = platformOs(env.uaDataPlatform ?? env.platform);
  const osBad = osUA !== "unknown" && osReal !== "unknown" && osUA !== osReal && !(osUA === "Android" && osReal === "Linux");
  state.lie(
    "os",
    osBad ? "bad" : "ok",
    t("User-Agent OS matches the real platform", "L'OS du User-Agent correspond à la plateforme"),
    osBad
      ? t(`UA claims ${osUA} but the platform says ${osReal}: the UA is spoofed.`, `Le UA annonce ${osUA} mais la plateforme dit ${osReal} : le UA est usurpé.`)
      : `${osUA} / ${osReal}`,
  );

  const engineClaimed = uaEngine(ua);
  const engineBad = env.engine !== "unknown" && engineClaimed !== "unknown" && env.engine !== engineClaimed;
  state.lie(
    "engine",
    engineBad ? "bad" : "ok",
    t("Claimed engine matches the real engine", "Le moteur annoncé correspond au vrai moteur"),
    engineBad
      ? t(`UA says ${engineClaimed}, feature detection says ${env.engine}.`, `Le UA dit ${engineClaimed}, la détection de fonctionnalités dit ${env.engine}.`)
      : `${engineClaimed} / ${env.engine}`,
  );

  const mobileUA = /Mobi|Android|iPhone/.test(ua);
  const touchy = env.maxTouchPoints > 0 && env.screenWidth < 900;
  state.lie(
    "mobile",
    mobileUA && !touchy ? "warn" : "ok",
    t("Mobile claim matches the hardware", "Le type d'appareil annoncé correspond au matériel"),
    `${mobileUA ? "mobile UA" : "desktop UA"} · ${env.maxTouchPoints} touch · ${env.screenWidth}px`,
  );

  if (signals.ipTimezone) {
    const bad = env.timezone !== signals.ipTimezone;
    state.lie(
      "tz",
      bad ? "warn" : "ok",
      t("Browser timezone matches IP timezone", "Le fuseau du navigateur correspond à celui de l'IP"),
      bad
        ? t(`Browser: ${env.timezone} · IP: ${signals.ipTimezone}. Classic VPN tell (or you are travelling).`, `Navigateur : ${env.timezone} · IP : ${signals.ipTimezone}. Signe classique d'un VPN (ou tu voyages).`)
        : env.timezone,
    );
  }

  const accept = signals.languages[0]?.tag.toLowerCase().split("-")[0] ?? "";
  const jsLang = env.language.toLowerCase().split("-")[0] ?? "";
  if (accept) {
    const bad = accept !== jsLang;
    state.lie(
      "lang",
      bad ? "warn" : "ok",
      t("HTTP and JS languages agree", "Langues HTTP et JS cohérentes"),
      bad ? `Accept-Language: ${accept} · navigator.language: ${jsLang}` : accept,
    );
  }

  if (env.webdriver)
    state.lie("webdriver", "bad", t("Automation flag set", "Drapeau d'automatisation actif"), t("navigator.webdriver is true: you look like a bot (Selenium / Puppeteer / Playwright).", "navigator.webdriver est vrai : tu ressembles à un bot (Selenium / Puppeteer / Playwright)."));
  else state.lie("webdriver", "ok", t("Not flagged as automated", "Pas marqué comme automatisé"), "navigator.webdriver = false");

  const renderer = state.get("gpu") ?? "";
  if (renderer) {
    const soft = SOFTWARE_GPU.test(renderer);
    state.lie(
      "gpu",
      soft ? "info" : "ok",
      t("Real GPU", "Vrai GPU"),
      soft ? t(`Software rendering (${renderer}): a VM, a headless browser or a server.`, `Rendu logiciel (${renderer}) : une VM, un navigateur headless ou un serveur.`) : renderer,
    );
  }

  const headless = /HeadlessChrome/.test(ua) || (/Chrome/.test(ua) && !env.hasChromeObject);
  state.lie(
    "headless",
    headless ? "bad" : "ok",
    t("No headless-browser traces", "Aucune trace de navigateur headless"),
    headless ? t("The UA or missing window.chrome suggests headless mode.", "Le UA ou l'absence de window.chrome suggère le mode headless.") : "OK",
  );

  const hits = env.automationHits;
  state.lie(
    "automation-globals",
    hits.length ? "bad" : "ok",
    t("No automation-tool traces", "Aucune trace d'outil d'automatisation"),
    hits.length
      ? t(`Found: ${hits.join(", ")}`, `Trouvé : ${hits.join(", ")}`)
      : t("Selenium / Playwright / Phantom / Nightmare probes are clean.", "Les sondes Selenium / Playwright / Phantom / Nightmare sont propres."),
  );

  if (env.buildID === "20181001000000")
    state.lie("buildid", "info", t("Frozen Firefox buildID", "buildID Firefox figé"), t("buildID 20181001000000 is the fixed value of Firefox resistFingerprinting.", "Le buildID 20181001000000 est la valeur fixe de resistFingerprinting de Firefox."));

  if (timerMs >= 50)
    state.lie("rfp", "info", t("Fingerprint-resistance mode", "Mode anti-fingerprinting"), t(`Timers are rounded to ${Math.round(timerMs)} ms and the clock is probably UTC: Tor Browser / Firefox resistFingerprinting.`, `Les timers sont arrondis à ${Math.round(timerMs)} ms : Tor Browser / Firefox resistFingerprinting.`));
  else if (env.timezone === "UTC" && /en/.test(jsLang) && env.screenWidth % 200 === 0 && env.screenHeight % 100 === 0)
    state.lie("rfp", "info", t("Looks like Tor-style letterboxing", "Ressemble au letterboxing de Tor"), t("UTC timezone and round screen dimensions.", "Fuseau UTC et dimensions d'écran arrondies."));

  const devtools = env.outerWidth - env.innerWidth > 160 || env.outerHeight - env.innerHeight > 200;
  if (devtools && !/Mobi|Android/.test(ua))
    state.lie("devtools", "info", t("DevTools probably open", "DevTools probablement ouverts"), t("The window is much bigger than its viewport: a docked inspector, hopefully hunting flags.", "La fenêtre est bien plus grande que son viewport : un inspecteur ancré, à la chasse aux flags j'espère."));
};
