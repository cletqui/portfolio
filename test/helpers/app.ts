import app from "../../src/index";

export type Cf = Record<string, unknown>;

let counter = 0;
export const nextIp = (): string => `198.51.100.${(counter++ % 250) + 1}`;

export const get = (path: string, init?: RequestInit) => app.request(path, init);
export const text = async (path: string, init?: RequestInit) => (await get(path, init)).text();

export const withCf = (path: string, cf: Cf, headers: Record<string, string> = {}) => {
  const req = new Request(`http://localhost${path}`, {
    headers: { "cf-connecting-ip": "203.0.113.7", ...headers },
  });
  return app.fetch(Object.assign(req, { cf }));
};

export const submit = (flag: string, ip = nextIp()) =>
  app.request("/ctf/submit", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": ip },
    body: JSON.stringify({ flag }),
  });

export const FRANCE: Cf = {
  country: "FR",
  continent: "EU",
  city: "Rennes",
  region: "Brittany",
  regionCode: "BRE",
  latitude: "48.11",
  longitude: "-1.68",
  timezone: "Europe/Paris",
  asn: 3215,
  asOrganization: "Orange S.A.",
  colo: "CDG",
  httpProtocol: "HTTP/2",
  tlsVersion: "TLSv1.3",
  tlsCipher: "AEAD-AES128-GCM-SHA256",
};
