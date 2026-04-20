import { Context } from "hono";
import { getCookie } from "hono/cookie";

/* TYPES */
export interface IPInfo {
  address?: string;
  query?: string;
  status: string;
  continent: string;
  continentCode: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  district: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  offset: number;
  currency: string;
  isp: string;
  org: string;
  as: string;
  asname: string;
  reverse: string;
  mobile: boolean;
  proxy: boolean;
  hosting: boolean;
}

export interface UserAgent {
  ua: string;
  browser: { name?: string; version?: string; major?: string };
  engine: { name?: string; version?: string };
  os: { name?: string; version?: string };
  device: { type?: string; model?: string; vendor?: string };
  cpu: { architecture?: string };
}

/* QUERIES */
const queryIPInfo = async (address: string): Promise<IPInfo> => {
  const apiUrl = new URL("https://api.cybai.re/ip/info");
  apiUrl.pathname += `/${address}`;
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error(`ip lookup ${response.status}`);
  const data = (await response.json()) as IPInfo & { status?: string };
  if (data.status === "fail") throw new Error("ip lookup failed");
  return data;
};

export const getIPInfo = async (
  c: Context,
  address: string,
): Promise<IPInfo> => {
  const cookie = getCookie(c, "you");
  if (cookie) {
    try {
      const { ipInfo }: { ipInfo: IPInfo } = JSON.parse(decodeURIComponent(cookie));
      if (ipInfo.address && ipInfo.address === address) return ipInfo;
    } catch {
      // malformed or stale cookie — fetch fresh
    }
  }
  const info = await queryIPInfo(address);
  return { address, ...info };
};

const queryUserAgent = async (userAgent: string): Promise<UserAgent> => {
  if (!userAgent) throw new Error("no user-agent");
  const apiUrl = new URL("https://api.cybai.re/user-agent");
  apiUrl.searchParams.append("ua", userAgent);
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error(`ua lookup ${response.status}`);
  return response.json();
};

export const getUserAgent = async (c: Context, userAgent: string) => {
  const cookie = getCookie(c, "you");
  if (cookie) {
    try {
      const { ua }: { ua: UserAgent } = JSON.parse(decodeURIComponent(cookie));
      if (ua.ua === userAgent) return ua;
    } catch {
      // malformed or stale cookie — fetch fresh
    }
  }
  return queryUserAgent(userAgent);
};
