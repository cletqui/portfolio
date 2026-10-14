export interface NavigatorExtras {
  userAgentData?: {
    platform?: string;
    getHighEntropyValues?(hints: string[]): Promise<Record<string, unknown>>;
  };
  deviceMemory?: number;
  connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean };
  mozConnection?: NavigatorExtras["connection"];
  globalPrivacyControl?: boolean;
  buildID?: string;
  getBattery?(): Promise<{ level: number; charging: boolean }>;
  keyboard?: { getLayoutMap?(): Promise<{ get(key: string): string | undefined }> };
  gpu?: { requestAdapter(): Promise<{ info?: Record<string, string> } | null> };
  pdfViewerEnabled?: boolean;
  bluetooth?: unknown;
  usb?: unknown;
  serial?: unknown;
  hid?: unknown;
  requestMIDIAccess?: unknown;
  wakeLock?: unknown;
  share?: unknown;
}

export const nav = (): Navigator & NavigatorExtras => navigator as Navigator & NavigatorExtras;

export interface EnvSnapshot {
  ua: string;
  platform: string;
  uaDataPlatform?: string;
  language: string;
  maxTouchPoints: number;
  screenWidth: number;
  screenHeight: number;
  timezone: string;
  webdriver: boolean;
  hasChromeObject: boolean;
  buildID?: string;
  engine: string;
  automationHits: string[];
  outerWidth: number;
  innerWidth: number;
  outerHeight: number;
  innerHeight: number;
  hour: number;
  time: string;
  darkMode: boolean;
  trackingSignal: boolean;
}

export const AUTOMATION_GLOBALS = [
  "callPhantom", "_phantom", "phantom", "__nightmare", "domAutomation", "domAutomationController", "_selenium",
  "__selenium_unwrapped", "__webdriver_evaluate", "__driver_evaluate", "__webdriver_script_fn", "__fxdriver_unwrapped",
  "_Selenium_IDE_Recorder", "calledSelenium", "__playwright", "__pw_manual", "__PW_inspect",
];

export const mq = (query: string): boolean => window.matchMedia(query).matches;

export const detectEngine = (): string => {
  const w = window as Window & { chrome?: unknown; GestureEvent?: unknown };
  if (window.CSS?.supports?.("-moz-appearance", "none")) return "Gecko";
  if (nav().userAgentData || w.chrome) return "Blink";
  if (w.GestureEvent || (navigator.vendor ?? "").startsWith("Apple")) return "WebKit";
  return "unknown";
};

export const snapshotEnv = (): EnvSnapshot => {
  const n = nav();
  const now = new Date();
  const hits = AUTOMATION_GLOBALS.filter((k) => k in window);
  for (const k of Object.keys(document)) if (k.startsWith("$cdc_") || k.startsWith("$chrome_asyncScriptInfo")) hits.push(k);
  return {
    ua: n.userAgent,
    platform: n.platform,
    uaDataPlatform: n.userAgentData?.platform,
    language: n.language,
    maxTouchPoints: n.maxTouchPoints,
    screenWidth: screen.width,
    screenHeight: screen.height,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    webdriver: !!n.webdriver,
    hasChromeObject: !!(window as Window & { chrome?: unknown }).chrome,
    buildID: n.buildID,
    engine: detectEngine(),
    automationHits: hits,
    outerWidth: window.outerWidth,
    innerWidth: window.innerWidth,
    outerHeight: window.outerHeight,
    innerHeight: window.innerHeight,
    hour: now.getHours(),
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    darkMode: mq("(prefers-color-scheme: dark)"),
    trackingSignal: !!n.globalPrivacyControl || n.doNotTrack === "1",
  };
};

export const uaOs = (ua: string): string => {
  if (/Windows/.test(ua)) return "Windows";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Linux|X11/.test(ua)) return "Linux";
  return "unknown";
};

export const platformOs = (platform: string): string => {
  if (/^Win/i.test(platform)) return "Windows";
  if (/^Mac/i.test(platform)) return "macOS";
  if (/iPhone|iPad|iPod/i.test(platform)) return "iOS";
  if (/Android/i.test(platform)) return "Android";
  if (/CrOS/i.test(platform)) return "ChromeOS";
  if (/Linux|X11/i.test(platform)) return "Linux";
  return "unknown";
};

export const uaEngine = (ua: string): string => {
  if (/Firefox\//.test(ua)) return "Gecko";
  if (/Chrome\/|Chromium\/|Edg\/|OPR\//.test(ua)) return "Blink";
  if (/Safari\//.test(ua)) return "WebKit";
  return "unknown";
};
