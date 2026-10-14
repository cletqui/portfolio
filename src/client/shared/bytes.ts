export const encoder = new TextEncoder();

export const latin1ToBytes = (text: string): Uint8Array => {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) out[i] = text.charCodeAt(i) & 255;
  return out;
};

export const bytesToLatin1 = (bytes: Uint8Array): string => {
  let out = "";
  for (let i = 0; i < bytes.length; i += 4096)
    out += String.fromCharCode(...bytes.subarray(i, i + 4096));
  return out;
};

export const b64ToBytes = (b64: string): Uint8Array =>
  latin1ToBytes(atob(b64));

export const bytesToB64 = (bytes: Uint8Array): string =>
  btoa(bytesToLatin1(bytes));

export const hex2 = (n: number): string => (n < 16 ? "0" : "") + n.toString(16);

export const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, hex2).join("");

export const fromHex = (hex: string): Uint8Array | null => {
  if (hex.length % 2 || /[^0-9a-fA-F]/.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++)
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
};

export interface Decoded {
  text: string;
  binary: boolean;
}

export const decodeBytes = (bytes: Uint8Array): Decoded => {
  try {
    return {
      text: new TextDecoder("utf-8", { fatal: true }).decode(bytes),
      binary: false,
    };
  } catch {
    return { text: bytesToLatin1(bytes), binary: true };
  }
};

export const b64UrlDecode = (part: string): string => {
  let p = part.replace(/-/g, "+").replace(/_/g, "/");
  while (p.length % 4) p += "=";
  return decodeBytes(b64ToBytes(p)).text;
};
