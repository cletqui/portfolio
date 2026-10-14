import { beforeEach, describe, expect, it } from "vitest";
import { FLAGS } from "../../../src/utils/flags";
import { CHALLENGES } from "../../../src/data/challenges";
import { makeShell, type Harness } from "../../helpers/shell";

let h: Harness;
beforeEach(() => {
  h = makeShell();
});

describe("ctf command", () => {
  it("shows a status line", async () => {
    expect(await h.out("ctf")).toContain(`0/${CHALLENGES.length} flags found, 0/`);
  });
  it("lists challenges, filterable by category and difficulty", async () => {
    const all = (await h.run("ctf list")).filter((l) => l.trim());
    expect(all).toHaveLength(CHALLENGES.length);
    expect(await h.out("ctf list crypto")).toContain("crypto");
    expect((await h.run("ctf list hard")).every((l) => l.includes("hard"))).toBe(true);
    expect(await h.out("flags unsolved")).toContain("source");
  });
  it("gives hints and rejects unknown ids", async () => {
    expect(await h.out("ctf hint snake")).toContain("Eat enough");
    expect(await h.out("ctf hint nope")).toContain("unknown challenge id");
  });
  it("rejects malformed flags without calling the server", async () => {
    expect(await h.out("ctf submit nope")).toContain("does not look like a flag");
    expect(await h.out("ctf submit")).toContain("does not look like a flag");
  });
  it("submits a flag to the real endpoint, records it, and updates the status", async () => {
    const out = await h.out(`ctf submit ${FLAGS.teapot}`);
    expect(out).toMatch(/✓ RFC 2324 \+100 pts \(1\/\d+, 100 pts\)/);
    expect(JSON.parse(h.storage.store.get("ctf_found") ?? "{}").teapot.points).toBe(100);
    expect(await h.out("ctf")).toContain(`1/${CHALLENGES.length} flags found, 100/`);
    expect(await h.out("ctf list solved")).toContain("teapot");
  });
  it("does not double count a flag", async () => {
    await h.run(`ctf submit ${FLAGS.teapot}`);
    expect(await h.out(`ctf submit ${FLAGS.teapot}`)).toContain("already solved");
    expect(Object.keys(JSON.parse(h.storage.store.get("ctf_found") ?? "{}"))).toHaveLength(1);
  });
  it("reports a well-formed but wrong flag", async () => {
    expect(await h.out("ctf submit cybai{not-a-real-one}")).toContain("not a valid flag");
  });
  it("accepts every client-side easter egg flag", async () => {
    const { CLIENT_FLAGS } = await import("../../../src/client/shared/flags");
    for (const [id, flag] of Object.entries(CLIENT_FLAGS)) {
      const fresh = makeShell();
      expect(await fresh.out(`ctf submit ${flag}`), id).toContain("✓");
    }
  });
  it("falls back to memory when storage is unavailable", async () => {
    const noStorage = makeShell();
    noStorage.deps.storage!.setItem = () => {
      throw new Error("blocked");
    };
    await noStorage.run(`ctf submit ${FLAGS.header}`);
    expect(await noStorage.out("ctf")).toContain(`1/${CHALLENGES.length}`);
  });
  it("copes with an unreachable server and with the rate limit", async () => {
    const offline = makeShell();
    (offline.deps as { fetch: typeof fetch }).fetch = async () => {
      throw new Error("offline");
    };
    expect(await offline.out(`ctf submit ${FLAGS.teapot}`)).toContain("could not reach the server");
    const limited = makeShell();
    (limited.deps as { fetch: typeof fetch }).fetch = async () => new Response("slow down", { status: 429 });
    expect(await limited.out(`ctf submit ${FLAGS.teapot}`)).toContain("too many attempts");
  });
  it("prints usage for unknown subcommands", async () => {
    expect(await h.out("ctf explode")).toContain("usage:");
  });
  it("speaks French when asked", async () => {
    const fr = makeShell("fr");
    expect(await fr.out("ctf")).toContain("flags trouvés");
    expect(await fr.out("ctf hint snake")).toContain("Mange assez");
  });
});
