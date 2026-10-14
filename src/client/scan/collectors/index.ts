import type { Collector, Ctx } from "./context";
import { collectAudio, collectAudioContext, collectFormats } from "./audio";
import { collectDisplay, collectWindowChrome } from "./display";
import { collectFonts } from "./fonts";
import { collectCanvas, collectWebGL, collectWebGLDeep, collectWebGPU } from "./graphics";
import { collectKeyboard, collectLocale, collectVoices } from "./locale";
import { collectNavigator, collectEngineQuirks, collectHighEntropy, collectMath, collectNavigatorDeep, collectPlugins } from "./navigator";
import { collectNetwork } from "./network";
import { collectAdblock, collectBattery, collectClock, collectFeatures, collectMedia, collectPermissions, collectSensors, collectStorage } from "./system";

export const TASKS: [string, Collector][] = [
  ["network & headers", collectNetwork],
  ["navigator", collectNavigator],
  ["client hints", collectHighEntropy],
  ["display & media queries", collectDisplay],
  ["locale & Intl", collectLocale],
  ["canvas", collectCanvas],
  ["WebGL", collectWebGL],
  ["WebGPU", collectWebGPU],
  ["audio", collectAudio],
  ["fonts", collectFonts],
  ["media devices", collectMedia],
  ["storage", collectStorage],
  ["battery", collectBattery],
  ["speech voices", collectVoices],
  ["keyboard layout", collectKeyboard],
  ["permissions", collectPermissions],
  ["clock skew", collectClock],
  ["content blocker", collectAdblock],
  ["web APIs", collectFeatures],
  ["JS engine", collectMath],
  ["navigator internals", collectNavigatorDeep],
  ["plugins & MIME types", collectPlugins],
  ["engine quirks", collectEngineQuirks],
  ["audio & video formats", collectFormats],
  ["audio context", collectAudioContext],
  ["sensors & touch", collectSensors],
  ["window chrome", collectWindowChrome],
  ["WebGL render", collectWebGLDeep],
];

export const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });

export type TaskReport = (name: string, ok: boolean, error?: string) => void;

export const runTask = async (name: string, fn: () => void | Promise<void>, report: TaskReport, ms = 2500): Promise<void> => {
  try {
    await withTimeout(Promise.resolve().then(fn), ms);
    report(name, true);
  } catch (e) {
    report(name, false, e instanceof Error && e.message ? e.message : "unavailable");
  }
};

export const runCollectors = (ctx: Ctx, report: TaskReport, tasks: [string, Collector][] = TASKS): Promise<void[]> =>
  Promise.all(tasks.map(([name, fn]) => runTask(name, () => fn(ctx), report)));
