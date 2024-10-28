/* TYPES */
export interface IPInfo {
  ipVersion: number;
  ipAddress: string;
  latitude: number;
  longitude: number;
  countryName: string;
  countryCode: string;
  timeZone: string;
  zipCode: string;
  cityName: string;
  regionName: string;
  isProxy: boolean;
  continent: string;
  continentCode: string;
  currency: {
    code: string;
    name: string;
  };
  language: string;
  timeZones: string[];
  tlds: string[];
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
