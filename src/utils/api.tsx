/* TYPES */
export interface IPInfo {
  query: string;
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
export const queryIPInfo = async (address: string): Promise<IPInfo> => {
  const apiUrl = new URL("https://api.cybai.re/ip/info");
  apiUrl.pathname += `/${address}`;
  const response = await fetch(apiUrl);
  return response.json();
};

export const queryUserAgent = async (userAgent: string): Promise<UserAgent> => {
  const apiUrl = new URL("https://api.cybai.re/user-agent");
  apiUrl.searchParams.append("ua", userAgent);
  const response = await fetch(apiUrl);
  return response.json();
};
