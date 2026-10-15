export type HostKind = "self" | "private" | "ip" | "name";

const octets = (host: string): number[] | null => {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return null;
  const parts = m.slice(1).map(Number);
  return parts.every((n) => n <= 255) ? parts : null;
};

export const isIpv6 = (host: string): boolean => host.includes(":") && /^[0-9a-f:.]+$/i.test(host);

export const classify = (rawHost: string): HostKind => {
  const host = rawHost.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (/^(localhost|cybai|(www\.)?cybai\.re)$/.test(host) || host === "::1") return "self";
  const o = octets(host);
  if (o) {
    const [a, b] = o as [number, number];
    if (a === 127) return "self";
    if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254)) return "private";
    return "ip";
  }
  if (isIpv6(host)) return /^f[cd]|^fe80/i.test(host) ? "private" : "ip";
  return "name";
};

export const connectFailure = (kind: HostKind, open: boolean): string =>
  kind === "private" ? "No route to host" : kind === "self" && !open ? "Connection refused" : "Connection timed out";

export interface Target {
  user?: string;
  host: string;
  port?: string;
  path: string;
  scheme?: string;
}

export const parseTarget = (raw: string): Target => {
  let rest = raw;
  const scheme = /^([a-z][a-z0-9+.-]*):\/\//i.exec(rest)?.[1]?.toLowerCase();
  if (scheme) rest = rest.slice(scheme.length + 3);
  const slash = rest.search(/[/?#]/);
  const path = slash >= 0 ? rest.slice(slash) : "";
  let authority = slash >= 0 ? rest.slice(0, slash) : rest;
  let user: string | undefined;
  const at = authority.lastIndexOf("@");
  if (at >= 0) {
    user = authority.slice(0, at);
    authority = authority.slice(at + 1);
  }
  let port: string | undefined;
  const bracket = /^\[([^\]]*)\](?::(\d*))?$/.exec(authority);
  if (bracket) {
    authority = bracket[1]!;
    port = bracket[2] || undefined;
  } else if ((authority.match(/:/g) ?? []).length === 1) {
    const [h, p] = authority.split(":") as [string, string];
    authority = h;
    port = p || undefined;
  }
  return { user, host: authority, port, path, scheme };
};
