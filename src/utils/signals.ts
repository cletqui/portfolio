import type { Context } from "hono";

export type ServerSignals = {
  now: number;
  ip: string;
  ua: string;
  ipTimezone: string;
  country: string;
  net: Record<string, string>;
  languages: { tag: string; q: number }[];
  headers: [string, string][];
};

const HIDDEN_HEADERS = new Set(["cookie", "authorization"]);

const parseAcceptLanguage = (raw: string | undefined) =>
  (raw ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => /q=([\d.]+)/.exec(p)?.[1]).find(Boolean);
      return { tag: tag.trim(), q: q ? parseFloat(q) : 1 };
    })
    .filter((l) => l.tag);

export const collectSignals = (
  c: Context,
  ip: string,
  ipTimezone: string,
  country: string,
): ServerSignals => {
  const cf = ((c.req.raw as unknown as { cf?: Record<string, unknown> }).cf ??
    {}) as Record<string, unknown>;

  const net: Record<string, string> = {};
  const pick = (key: string, label: string) => {
    const v = cf[key];
    if (v !== undefined && v !== null && v !== "") net[label] = String(v);
  };
  pick("colo", "colo");
  pick("asn", "asn");
  pick("asOrganization", "asOrganization");
  pick("httpProtocol", "httpProtocol");
  pick("tlsVersion", "tlsVersion");
  pick("tlsCipher", "tlsCipher");
  pick("clientTcpRtt", "tcpRtt");
  pick("clientQuicRtt", "quicRtt");
  pick("isEUCountry", "isEU");
  pick("postalCode", "postalCode");
  pick("metroCode", "metroCode");
  pick("tlsClientExtensionsSha1", "tlsExtensionsSha1");
  pick("tlsClientHelloLength", "tlsHelloLength");

  const headers: [string, string][] = [];
  c.req.raw.headers.forEach((value, name) => {
    if (!HIDDEN_HEADERS.has(name.toLowerCase())) headers.push([name, value]);
  });

  return {
    now: Date.now(),
    ip,
    ua: c.req.header("user-agent") ?? "",
    ipTimezone,
    country,
    net,
    languages: parseAcceptLanguage(c.req.header("accept-language")),
    headers,
  };
};

const HOSTING_RE =
  /amazon|\baws\b|google (cloud|llc)|microsoft|azure|digitalocean|ovh|hetzner|linode|akamai|vultr|scaleway|oracle|alibaba|tencent|contabo|leaseweb|choopa|m247|datacamp|cloudflare|fly\.io|netcup|ionos|hostinger|godaddy|rackspace|hosting|datacenter|data center|colo/i;

const VPN_RE =
  /mullvad|nord|proton|express ?vpn|surfshark|private internet|windscribe|cyberghost|ipvanish|tefincom|m247|datacamp|\bvpn\b|quintex|clouvider|packethub|xtom|tor\b/i;

export const guessConnection = (org: string) => ({
  hosting: HOSTING_RE.test(org) || VPN_RE.test(org),
  proxy: VPN_RE.test(org),
});
