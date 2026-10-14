const encoder = new TextEncoder();

const b64url = (data: ArrayBuffer | string): string => {
  const bytes = typeof data === "string" ? encoder.encode(data) : new Uint8Array(data);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const b64urlDecode = (part: string): string => atob(part.replace(/-/g, "+").replace(/_/g, "/"));

const hmac = async (input: string, secret: string): Promise<string> =>
  b64url(
    await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
      encoder.encode(input),
    ),
  );

export const signJwt = async (payload: Record<string, unknown>, secret: string): Promise<string> => {
  const body = `${b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }))}.${b64url(JSON.stringify(payload))}`;
  return `${body}.${await hmac(body, secret)}`;
};

export const verifyJwt = async (token: string, secret: string): Promise<Record<string, unknown> | null> => {
  const [h, p, sig] = token.split(".");
  if (!h || !p || !sig) return null;
  try {
    const header = JSON.parse(b64urlDecode(h)) as { alg?: string };
    if (header.alg !== "HS256") return null;
    if ((await hmac(`${h}.${p}`, secret)) !== sig) return null;
    return JSON.parse(b64urlDecode(p)) as Record<string, unknown>;
  } catch {
    return null;
  }
};
