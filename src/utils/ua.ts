import Bowser from "bowser";

export interface UserAgent {
  ua: string;
  browser: { name?: string; version?: string; major?: string };
  engine: { name?: string; version?: string };
  os: { name?: string; version?: string };
  device: { type?: string; model?: string; vendor?: string };
  cpu: { architecture?: string };
}

const architecture = (ua: string) =>
  /arm64|aarch64|armv8/i.test(ua)
    ? "arm64"
    : /x86_64|x64|amd64|wow64|win64/i.test(ua)
      ? "amd64"
      : /i[3-6]86|x86/i.test(ua)
        ? "x86"
        : undefined;

export const parseUserAgent = (ua: string): UserAgent => {
  const r = Bowser.parse(ua || " ");
  const type = r.platform.type;
  return {
    ua,
    browser: {
      name: r.browser.name,
      version: r.browser.version,
      major: r.browser.version?.split(".")[0],
    },
    engine: { name: r.engine.name, version: r.engine.version },
    os: { name: r.os.name, version: r.os.versionName ?? r.os.version },
    device: {
      type: type && type !== "desktop" ? type : undefined,
      model: r.platform.model,
      vendor: r.platform.vendor,
    },
    cpu: { architecture: architecture(ua) },
  };
};
