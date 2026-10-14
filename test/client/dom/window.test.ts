// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { TerminalWindow } from "../../../src/client/shell/window";

const setup = (canEscape = () => true) => {
  document.body.innerHTML =
    '<main id="main"><div id="slot"><div id="root"><div id="bar"><button id="c"></button><button id="m"></button><button id="x"></button></div><div id="screen"></div><form id="form"></form></div></div></main>';
  const g = (id: string) => document.getElementById(id)!;
  let changes = 0;
  const win = new TerminalWindow(
    { slot: g("slot"), root: g("root"), screen: g("screen"), form: g("form"), titlebar: g("bar"), close: g("c"), minimize: g("m"), maximize: g("x") },
    canEscape,
    () => changes++,
  );
  return { win, g, changes: () => changes };
};

describe("TerminalWindow", () => {
  beforeEach(() => (document.body.innerHTML = ""));

  it("re-parents the terminal to <body> in fullscreen, above its backdrop, and back", () => {
    const { win, g } = setup();
    g("x").click();
    expect(win.isFullscreen).toBe(true);
    expect(g("root").parentElement).toBe(document.body);
    expect(g("root").className).toContain("z-[90]");
    expect(document.body.querySelector(".z-\\[80\\]")).not.toBeNull();
    g("c").click();
    expect(win.isFullscreen).toBe(false);
    expect(g("root").parentElement).toBe(g("slot"));
    expect(document.body.querySelector(".z-\\[80\\]")).toBeNull();
    expect(g("screen").className).toContain("h-[26rem]");
  });
  it("closes fullscreen on backdrop click and double-click toggles", () => {
    const { win, g } = setup();
    g("bar").dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    expect(win.isFullscreen).toBe(true);
    (document.body.querySelector(".z-\\[80\\]") as HTMLElement).click();
    expect(win.isFullscreen).toBe(false);
  });
  it("Escape exits fullscreen only when allowed", () => {
    let allowed = false;
    const { win } = setup(() => allowed);
    win.setFullscreen(true);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(win.isFullscreen).toBe(true);
    allowed = true;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(win.isFullscreen).toBe(false);
  });
  it("minimises, restores from the title bar, and leaves fullscreen first", () => {
    const { win, g } = setup();
    g("m").click();
    expect(g("screen").classList.contains("hidden")).toBe(true);
    expect(g("form").classList.contains("hidden")).toBe(true);
    g("bar").click();
    expect(g("screen").classList.contains("hidden")).toBe(false);
    win.setFullscreen(true);
    win.setMinimized(true);
    expect(win.isFullscreen).toBe(false);
    expect(g("root").parentElement).toBe(g("slot"));
  });
  it("the red button minimises when windowed", () => {
    const { g } = setup();
    g("c").click();
    expect(g("screen").classList.contains("hidden")).toBe(true);
  });
  it("notifies on every change and restores page scroll", () => {
    const { win, changes } = setup();
    win.setFullscreen(true);
    expect(document.documentElement.classList.contains("overflow-hidden")).toBe(true);
    win.setFullscreen(false);
    expect(document.documentElement.classList.contains("overflow-hidden")).toBe(false);
    expect(changes()).toBe(2);
  });
});
