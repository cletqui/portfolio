import { describe, expect, it } from "vitest";
import { entropyOf, fingerprintId, oneInN, signature, UNIQUE_THRESHOLD } from "../../../src/client/scan/entropy";
import { inferHtml, resultsHtml } from "../../../src/client/scan/render";
import { parseSrflx } from "../../../src/client/scan/rtc";
import { ScanState } from "../../../src/client/scan/state";
import { BehaviorTracker } from "../../../src/client/scan/behavior";
import { makeT } from "../../../src/client/shared/i18n";

const t = makeT("en");

describe("ScanState", () => {
  it("ignores empty values and keeps lookups", () => {
    const s = new ScanState();
    s.add("browser", "a", "A", "");
    s.add("browser", "b", "B", undefined);
    s.add("browser", "c", "C", 0, 3);
    expect(s.rows.map((r) => r.id)).toEqual(["c"]);
    expect(s.get("c")).toBe("0");
  });
  it("replaces a lie with the same id", () => {
    const s = new ScanState();
    s.lie("x", "warn", "t", "d1");
    s.lie("x", "bad", "t", "d2");
    expect(s.lies).toHaveLength(1);
    expect(s.lies[0]!.detail).toBe("d2");
  });
});

describe("entropy", () => {
  const rows = (bits: number[], stable = true) => bits.map((b, i) => ({ group: "browser" as const, id: `r${i}`, label: `R${i}`, value: "v", bits: b, stable }));
  it("is zero with nothing and monotonic with more attributes", () => {
    expect(entropyOf([]).total).toBe(0);
    expect(entropyOf(rows([5, 5])).total).toBeLessThan(entropyOf(rows([5, 5, 5, 5])).total);
  });
  it("saturates instead of summing", () => {
    const e = entropyOf(rows(Array(30).fill(5)));
    expect(e.total).toBeLessThan(150);
    expect(e.unique).toBe(e.total >= UNIQUE_THRESHOLD);
  });
  it("lists the biggest contributors first", () => {
    expect(entropyOf(rows([1, 9, 4])).top.map((r) => r.bits)).toEqual([9, 4, 1]);
  });
  it("ignores unstable rows in the signature and id", async () => {
    const stable = rows([4, 4]);
    const mixed = [...stable, ...rows([7], false).map((r) => ({ ...r, id: "volatile" }))];
    expect(signature(mixed)).toBe(signature(stable));
    expect(await fingerprintId(stable)).toMatch(/^[0-9A-F]{16}$/);
  });
  it("converts bits to a 1-in-N figure", () => {
    expect(oneInN(10)).toBe(1024);
  });
});

describe("render", () => {
  it("renders the deduction list and escapes it", () => {
    const s = new ScanState();
    s.infer = ["You use <b>Linux</b>"];
    const html = inferHtml(s, t);
    expect(html).toContain("// what");
    expect(html).toContain("&lt;b&gt;");
    expect(html).not.toContain("<b>Linux");
  });
  it("renders nothing without deductions, and keeps them out of the results columns", () => {
    const s = new ScanState();
    expect(inferHtml(s, t)).toBe("");
    s.infer = ["x"];
    expect(resultsHtml(s, "ABCDEF0123456789", t)).not.toContain("// what");
  });
  it("localises the label", () => {
    const s = new ScanState();
    s.infer = ["x"];
    expect(inferHtml(s, makeT("fr"))).toContain("// quoi");
  });
});

describe("rtc", () => {
  it("extracts the address from a server-reflexive candidate", () => {
    expect(parseSrflx("candidate:1 1 udp 1677729535 203.0.113.9 54321 typ srflx raddr 0.0.0.0 rport 0")).toBe("203.0.113.9");
    expect(parseSrflx("candidate:1 1 udp 2122260223 192.168.1.2 54321 typ host")).toBeNull();
  });
});

describe("BehaviorTracker", () => {
  const human = () => {
    const b = new BehaviorTracker();
    let x = 0;
    for (let i = 0; i < 60; i++) {
      x += i % 6 === 0 ? 60 : 2 + (i % 4);
      b.mouse(x, 100 + Math.sin(i / 2) * 80 + (i % 3) * 9, i * 16 + (i % 5) * 7);
    }
    let t0 = 0;
    for (let i = 0; i < 20; i++) b.key((t0 += 90 + ((i * 37) % 150)));
    b.scroll();
    b.scroll();
    return b;
  };
  it("scores a messy human high", () => expect(human().score().score).toBeGreaterThanOrEqual(75));
  it("scores nothing without input", () => expect(new BehaviorTracker().score().score).toBe(0));
  it("zeroes the score on synthetic events", () => {
    const b = human();
    b.key(99999, false);
    expect(b.score().score).toBe(0);
    expect(b.stats().find(([k]) => k === "synthetic")![1]).toBe(1);
  });
  it("scores a perfectly regular bot low", () => {
    const b = new BehaviorTracker();
    for (let i = 0; i < 60; i++) b.mouse(i * 10, 100, i * 16);
    for (let i = 0; i < 20; i++) b.key(i * 100);
    expect(b.score().score).toBeLessThanOrEqual(25);
  });
});
