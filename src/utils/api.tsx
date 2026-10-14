import { Context } from "hono";

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
  mobile: boolean | null;
  proxy: boolean | null;
  hosting: boolean | null;
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
  const info = await queryIPInfo(address);
  return { address, ...info };
};
