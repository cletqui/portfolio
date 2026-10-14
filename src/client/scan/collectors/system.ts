import { nav } from "../env";
import { unavailable, type Collector } from "./context";

export const collectMedia: Collector = async ({ state, t }) => {
  if (!navigator.mediaDevices?.enumerateDevices) unavailable(t("no mediaDevices", "pas de mediaDevices"));
  const counts = { audioinput: 0, audiooutput: 0, videoinput: 0 };
  for (const d of await navigator.mediaDevices.enumerateDevices()) if (d.kind in counts) counts[d.kind]++;
  state.add("hardware", "media", t("Media devices", "Périphériques média"), `${counts.videoinput} cam · ${counts.audioinput} mic · ${counts.audiooutput} out`, 2);
};

export const collectStorage: Collector = async ({ state, t }) => {
  const parts = (["localStorage", "sessionStorage", "indexedDB"] as const).map((k) => {
    try {
      return `${k}=${window[k] ? "yes" : "no"}`;
    } catch {
      return `${k}=blocked`;
    }
  });
  state.add("caps", "storage", t("Storage APIs", "APIs de stockage"), parts.join(" "), 0.5);
  if (!navigator.storage?.estimate) return;
  const { quota = 0 } = await navigator.storage.estimate();
  state.add("caps", "quota", t("Storage quota", "Quota de stockage"), `${(quota / 1073741824).toFixed(1)} GB`, 1.5);
  if (quota < 300 * 1048576)
    state.lie("private-mode", "info", t("Private window likely", "Fenêtre privée probable"), t("The storage quota is tiny, a typical sign of incognito / private browsing.", "Le quota de stockage est minuscule, signe classique de la navigation privée."));
};

export const collectBattery: Collector = async ({ state, t }) => {
  const n = nav();
  if (!n.getBattery) unavailable(t("Battery API not exposed", "API batterie non exposée"));
  const b = await n.getBattery!();
  state.add("hardware", "battery", t("Battery", "Batterie"), `${Math.round(b.level * 100)}% ${b.charging ? t("charging", "en charge") : t("discharging", "sur batterie")}`, 0.5, false);
};

export const collectPermissions: Collector = async ({ state, t }) => {
  if (!navigator.permissions?.query) unavailable(t("no Permissions API", "pas d'API Permissions"));
  const names = ["geolocation", "notifications", "camera", "microphone"] as const;
  const results = await Promise.all(
    names.map((name) =>
      navigator.permissions.query({ name: name as PermissionName }).then(
        (r) => `${name}=${r.state}`,
        () => `${name}=?`,
      ),
    ),
  );
  state.add("caps", "perms", t("Permission states", "États des permissions"), results.join(" "), 1.5);
};

export const measureTimer = (now: () => number = () => performance.now(), budgetMs = 25): number => {
  let min = Infinity;
  let last = now();
  const end = last + budgetMs;
  while (last < end) {
    const current = now();
    if (current > last && current - last < min) min = current - last;
    last = current;
  }
  return Number.isFinite(min) ? min : 0;
};

export const formatTimer = (ms: number): string => (ms >= 1 ? `${ms.toFixed(0)} ms` : `${(ms * 1000).toFixed(0)} µs`);

export const collectTimer = ({ state, t }: Parameters<Collector>[0]): number => {
  const ms = measureTimer();
  state.add("caps", "timer", t("Timer resolution", "Résolution du timer"), formatTimer(ms), 1.5);
  return ms;
};

export const collectClock: Collector = ({ state, t, signals }) => {
  if (!signals.now) return;
  const skew = Date.now() - signals.now;
  state.add("locale", "skew", t("Clock vs server", "Horloge vs serveur"), `${skew > 0 ? "+" : ""}${(skew / 1000).toFixed(1)} s`, 0, false);
  if (Math.abs(skew) > 120000)
    state.lie("clock", "warn", t("Clock is off", "Horloge décalée"), t("Your system clock differs from the server by more than two minutes.", "L'horloge de ton système diffère du serveur de plus de deux minutes."));
};

export const collectAdblock: Collector = ({ state, t }) =>
  new Promise<void>((resolve) => {
    const bait = document.createElement("div");
    bait.className = "adsbox ad-banner ad-placement textads banner-ads pub_300x250";
    bait.style.cssText = "position:absolute;left:-9999px;width:10px;height:10px;";
    bait.innerHTML = "&nbsp;";
    document.body.appendChild(bait);
    setTimeout(() => {
      const style = getComputedStyle(bait);
      const blocked = !bait.offsetHeight || style.display === "none" || style.visibility === "hidden";
      bait.remove();
      state.add("caps", "adblock", t("Content blocker", "Bloqueur de contenu"), blocked ? t("detected", "détecté") : t("none detected", "non détecté"), 1.2);
      resolve();
    }, 120);
  });

export const collectFeatures: Collector = ({ state, t }) => {
  const n = nav();
  const w = window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown; PublicKeyCredential?: unknown };
  const checks: Record<string, boolean> = {
    WebGPU: !!n.gpu,
    WebAssembly: typeof WebAssembly === "object",
    SharedArrayBuffer: typeof SharedArrayBuffer === "function",
    Bluetooth: !!n.bluetooth,
    USB: !!n.usb,
    Serial: !!n.serial,
    HID: !!n.hid,
    MIDI: !!n.requestMIDIAccess,
    Gamepad: !!n.getGamepads,
    WebAuthn: !!w.PublicKeyCredential,
    Share: !!n.share,
    Wakelock: !!n.wakeLock,
    ServiceWorker: !!n.serviceWorker,
    "Speech recognition": !!(w.SpeechRecognition ?? w.webkitSpeechRecognition),
    "View Transitions": !!(document as Document & { startViewTransition?: unknown }).startViewTransition,
    "Container queries": !!window.CSS?.supports?.("container-type: inline-size"),
  };
  const names = Object.keys(checks);
  const on = names.filter((k) => checks[k]);
  state.add("caps", "features", t("Web APIs present", "APIs web présentes"), `${on.length}/${names.length} · ${on.join(", ")}`, 3);
};

export const collectSensors: Collector = ({ state, t }) => {
  const present = ["Accelerometer", "Gyroscope", "Magnetometer", "AbsoluteOrientationSensor", "AmbientLightSensor", "DeviceMotionEvent", "DeviceOrientationEvent"].filter((k) => k in window);
  state.add("caps", "sensors", t("Sensor APIs", "APIs de capteurs"), present.length ? present.join(", ") : t("none", "aucune"), 2);
  let touchEvent = false;
  try {
    document.createEvent("TouchEvent");
    touchEvent = true;
  } catch {
    /* not supported */
  }
  state.add("browser", "touchapi", t("Touch support", "Support tactile"), `${navigator.maxTouchPoints} pts · TouchEvent=${touchEvent} · ontouchstart=${"ontouchstart" in window}`, 1.5);
};
