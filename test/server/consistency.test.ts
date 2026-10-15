import { describe, expect, it } from "vitest";
import { CHALLENGES, TOTAL_POINTS } from "../../src/data/challenges";
import { CLIENT_FLAGS, CIPHER_TEXT } from "../../src/client/shared/flags";
import { FLAGS } from "../../src/utils/flags";
import { b64ToBytes } from "../../src/client/shared/bytes";

describe("flags and challenges", () => {
  it("has a challenge for every flag and a flag for every challenge", () => {
    expect(CHALLENGES.map((c) => c.id).sort()).toEqual(Object.keys(FLAGS).sort());
  });
  it("has unique ids and names, sane points and a French translation", () => {
    expect(new Set(CHALLENGES.map((c) => c.id)).size).toBe(CHALLENGES.length);
    expect(new Set(CHALLENGES.map((c) => c.name)).size).toBe(CHALLENGES.length);
    for (const c of CHALLENGES) {
      expect(c.points, c.id).toBeGreaterThan(0);
      expect(c.nameFr && c.hintFr && c.hint, c.id).toBeTruthy();
    }
  });
  it("totals the advertised amount", () => {
    expect(CHALLENGES.reduce((s, c) => s + c.points, 0)).toBe(TOTAL_POINTS);
    expect(CHALLENGES).toHaveLength(36);
  });
  it("is sorted by difficulty, then points", () => {
    const order = { easy: 0, medium: 1, hard: 2 };
    for (let i = 1; i < CHALLENGES.length; i++) {
      const a = CHALLENGES[i - 1]!, b = CHALLENGES[i]!;
      expect(order[a.difficulty] * 1e6 + a.points).toBeLessThanOrEqual(order[b.difficulty] * 1e6 + b.points);
    }
  });
  it("uses well-formed flags only", () => {
    for (const [id, f] of Object.entries(FLAGS)) expect(f, id).toMatch(/^cybai\{[\x20-\x7E]{1,128}\}$/);
    expect(new Set(Object.values(FLAGS)).size).toBe(Object.keys(FLAGS).length);
  });
  it("keeps the client-held flags identical to the server's", () => {
    for (const [id, f] of Object.entries(CLIENT_FLAGS)) expect(FLAGS[id as keyof typeof FLAGS], id).toBe(f);
  });
  it("hides the crypto flag behind base64 → rot13 → hex", () => {
    const rot13 = (s: string) => s.replace(/[a-z]/gi, (c) => String.fromCharCode(((c.charCodeAt(0) - (c < "a" ? 65 : 97) + 13) % 26) + (c < "a" ? 65 : 97)));
    const hex = rot13(new TextDecoder().decode(b64ToBytes(CIPHER_TEXT)));
    expect(Buffer.from(hex, "hex").toString()).toBe(FLAGS.crypto);
  });
});
