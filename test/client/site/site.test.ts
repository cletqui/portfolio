import { describe, expect, it } from "vitest";
import { remaining } from "../../../src/client/site/epoch";
import { createSequenceMatcher, KONAMI } from "../../../src/client/site/konami";
import { EPOCH_TARGET_MS, icsDate } from "../../../src/utils/epoch";

describe("konami matcher", () => {
  const feed = (keys: string[]) => {
    const m = createSequenceMatcher(KONAMI);
    return keys.map(m);
  };
  it("fires on the full sequence, case-insensitively", () => {
    expect(feed([...KONAMI.slice(0, 8), "B", "A"]).at(-1)).toBe(true);
  });
  it("does not fire on partial or wrong sequences", () => {
    expect(feed(KONAMI.slice(0, 9)).some(Boolean)).toBe(false);
    expect(feed([...KONAMI.slice(0, 5), "x", ...KONAMI.slice(5)]).some(Boolean)).toBe(false);
  });
  it("recovers when a wrong key is the start of the sequence, and can repeat", () => {
    expect(feed(["ArrowUp", ...KONAMI]).at(-1)).toBe(true);
    expect(feed([...KONAMI, ...KONAMI]).filter(Boolean)).toHaveLength(2);
  });
});

describe("epoch countdown", () => {
  it("splits the remaining time", () => {
    const now = EPOCH_TARGET_MS - (2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 5_000);
    expect(remaining(EPOCH_TARGET_MS, now)).toEqual({ days: 2, hours: "03", minutes: "04", seconds: "05" });
  });
  it("clamps at zero after the deadline", () => {
    expect(remaining(EPOCH_TARGET_MS, EPOCH_TARGET_MS + 5000)).toEqual({ days: 0, hours: "00", minutes: "00", seconds: "00" });
  });
  it("targets 2^31-1 seconds, i.e. 2038-01-19T03:14:07Z", () => {
    expect(new Date(EPOCH_TARGET_MS).toISOString()).toBe("2038-01-19T03:14:07.000Z");
    expect(icsDate(EPOCH_TARGET_MS)).toBe("20380119T031407Z");
  });
});
