import { encoder, toHex } from "./bytes";

export const fnv = (text: string): string => {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
};

export const digest = async (
  algorithm: "SHA-1" | "SHA-256" | "SHA-512",
  bytes: Uint8Array,
): Promise<string> =>
  toHex(
    new Uint8Array(
      await crypto.subtle.digest(algorithm, bytes as unknown as BufferSource),
    ),
  );

export const sha = async (text: string): Promise<string> => {
  try {
    return await digest("SHA-256", encoder.encode(text));
  } catch {
    return fnv(text) + fnv([...text].reverse().join(""));
  }
};
