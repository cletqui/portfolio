import { describe, expect, it } from "vitest";
import type { EnvSnapshot } from "../../../src/client/scan/env";
import { runInference } from "../../../src/client/scan/inference";
import { ScanState } from "../../../src/client/scan/state";
import { makeT } from "../../../src/client/shared/i18n";

const env = (over: Partial<EnvSnapshot> = {}): EnvSnapshot => ({
  ua: "Mozilla/5.0 (X11; Linux x86_64; rv:150.0) Gecko/20100101 Firefox/150.0",
  platform: "Linux x86_64", language: "en-US", maxTouchPoints: 0, screenWidth: 1920, screenHeight: 1080,
  timezone: "Europe/Paris", webdriver: false, hasChromeObject: false, engine: "Gecko", automationHits: [],
  outerWidth: 1920, innerWidth: 1900, outerHeight: 1000, innerHeight: 900, hour: 14, time: "14:00", darkMode: false, trackingSignal: false,
  ...over,
});
const run = (lang: "en" | "fr", gpu: string) => {
  const s = new ScanState();
  s.add("hardware", "gpu", "GPU", gpu);
  return runInference(s, env(), 1, makeT(lang));
};

describe("runInference", () => {
  it("strips the browser's 'or similar' suffix and localises the generic GPU line", () => {
    const fr = run("fr", "Radeon R9 200 Series, or similar").join("\n");
    expect(fr).toContain("Carte graphique : Radeon R9 200 Series");
    expect(fr).not.toMatch(/or similar|GPU :/);
    expect(run("en", "Radeon R9 200 Series, or similar").join("\n")).toContain("GPU: Radeon R9 200 Series");
  });
  it("says Linux idiomatically in French", () => {
    const fr = run("fr", "").join("\n");
    expect(fr).toContain("Tu es sous Linux");
    expect(fr).not.toContain("Linux de bureau");
  });
  it("classifies dedicated and integrated GPUs", () => {
    expect(run("en", "NVIDIA GeForce RTX 4070").join(" ")).toContain("dedicated GPU");
    expect(run("en", "Intel(R) UHD Graphics").join(" ")).toContain("integrated GPU");
  });
});
