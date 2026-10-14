import type { Translate } from "../shared/i18n";

export type Group = "net" | "browser" | "display" | "hardware" | "locale" | "prefs" | "caps";

export interface Row {
  group: Group;
  id: string;
  label: string;
  value: string;
  bits: number;
  stable: boolean;
}

export type LieLevel = "ok" | "warn" | "bad" | "info";

export interface Lie {
  id: string;
  level: LieLevel;
  title: string;
  detail: string;
}

export interface ServerSignals {
  now: number;
  ip: string;
  ua: string;
  ipTimezone: string;
  country: string;
  net: Record<string, string>;
  languages: { tag: string; q: number }[];
  headers: [string, string][];
}

export const emptySignals: ServerSignals = {
  now: 0,
  ip: "",
  ua: "",
  ipTimezone: "",
  country: "",
  net: {},
  languages: [],
  headers: [],
};

export type RtcState = "idle" | "running" | "done";

export interface ScanContext {
  t: Translate;
  signals: ServerSignals;
}
