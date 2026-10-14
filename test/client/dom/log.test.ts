// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { TerminalLog } from "../../../src/client/scan/log";

describe("TerminalLog", () => {
  it("prints queued lines in order, coloured by state", async () => {
    const host = document.createElement("div");
    const log = new TerminalLog(host, 0);
    log.push("a", "ok");
    log.push("b", "warn");
    await new Promise((r) => setTimeout(r, 30));
    expect([...host.children].map((c) => c.textContent)).toEqual(["a", "b"]);
    expect(host.children[0]!.className).toContain("green");
    expect(host.children[1]!.className).toContain("amber");
  });
  it("is a no-op without a host", () => {
    expect(() => new TerminalLog(null, 0).push("x")).not.toThrow();
  });
});
