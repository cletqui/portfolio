import { describe, expect, it } from "vitest";
import { emptyFilters, isActive, isVisible, toggleFilter } from "../../../src/client/ctf/filters";
import { submitFlag } from "../../../src/client/ctf/submit";
import { Progress } from "../../../src/client/shared/progress";
import { memoryStorage } from "../../helpers/shell";

const reply = (body: unknown): typeof fetch => (async () => new Response(JSON.stringify(body))) as typeof fetch;

describe("submitFlag", () => {
  it("records a valid flag and reports it", async () => {
    const p = new Progress(memoryStorage());
    const out = await submitFlag("cybai{x}", p, reply({ valid: true, id: "x", name: "X", points: 50 }));
    expect(out).toEqual({ kind: "success", id: "x", name: "X", points: 50 });
    expect(p.count()).toBe(1);
    expect(p.points()).toBe(50);
  });
  it("short-circuits a flag already found, without a request", async () => {
    const p = new Progress(memoryStorage());
    p.add("x", { flag: "cybai{x}", points: 1, name: "X" });
    const never = (async () => { throw new Error("no request expected"); }) as typeof fetch;
    expect(await submitFlag("cybai{x}", p, never)).toEqual({ kind: "already" });
  });
  it("reports invalid flags and network errors without recording", async () => {
    const p = new Progress(memoryStorage());
    expect(await submitFlag("cybai{no}", p, reply({ valid: false }))).toEqual({ kind: "invalid" });
    const boom = (async () => { throw new Error("offline"); }) as typeof fetch;
    expect(await submitFlag("cybai{no}", p, boom)).toEqual({ kind: "error" });
    expect(p.count()).toBe(0);
  });
});

describe("Progress", () => {
  it("falls back to memory when storage throws", () => {
    const broken = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
    const p = new Progress(broken);
    p.add("a", { flag: "f", points: 5, name: "A" });
    expect(p.count()).toBe(1);
    p.reset();
    expect(p.count()).toBe(0);
  });
  it("survives corrupted storage", () => {
    const s = memoryStorage();
    s.setItem("ctf_found", "{not json");
    expect(new Progress(s).count()).toBe(0);
  });
  it("shares state between instances over the same storage", () => {
    const s = memoryStorage();
    new Progress(s).add("a", { flag: "f", points: 5, name: "A" });
    expect(new Progress(s).has("f")).toBe(true);
  });
});

describe("filters", () => {
  const card = { id: "a", category: "web", difficulty: "easy" };
  it("is visible by default and when matching", () => {
    expect(isVisible(card, emptyFilters(), new Set())).toBe(true);
    expect(isVisible(card, { ...emptyFilters(), category: "web", difficulty: "easy" }, new Set())).toBe(true);
  });
  it("hides non-matching categories, difficulties and statuses", () => {
    expect(isVisible(card, { ...emptyFilters(), category: "crypto" }, new Set())).toBe(false);
    expect(isVisible(card, { ...emptyFilters(), difficulty: "hard" }, new Set())).toBe(false);
    expect(isVisible(card, { ...emptyFilters(), status: "solved" }, new Set())).toBe(false);
    expect(isVisible(card, { ...emptyFilters(), status: "unsolved" }, new Set(["a"]))).toBe(false);
    expect(isVisible(card, { ...emptyFilters(), status: "solved" }, new Set(["a"]))).toBe(true);
  });
  it("toggles a filter on and off", () => {
    const on = toggleFilter(emptyFilters(), "category", "web");
    expect(on.category).toBe("web");
    expect(isActive(on)).toBe(true);
    expect(isActive(toggleFilter(on, "category", "web"))).toBe(false);
  });
});
