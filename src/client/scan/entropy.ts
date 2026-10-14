import { sha } from "../shared/hash";
import type { Row } from "./types";

export const POPULATION_BITS = 33;
export const SATURATION = 55;
export const UNIQUE_THRESHOLD = 29;

export interface Entropy {
  raw: number;
  total: number;
  unique: boolean;
  percent: number;
  top: Row[];
}

export const stableRows = (rows: Row[]): Row[] => rows.filter((r) => r.stable && r.bits > 0);

export const entropyOf = (rows: Row[], topCount = 8): Entropy => {
  const stable = stableRows(rows);
  const raw = stable.reduce((sum, r) => sum + r.bits, 0);
  const total = POPULATION_BITS * (1 - Math.exp(-raw / SATURATION));
  return {
    raw,
    total,
    unique: total >= UNIQUE_THRESHOLD,
    percent: Math.min(100, Math.round((total / POPULATION_BITS) * 100)),
    top: [...stable].sort((a, b) => b.bits - a.bits).slice(0, topCount),
  };
};

export const oneInN = (bits: number): number => Math.round(2 ** bits);

export const signature = (rows: Row[]): string =>
  rows
    .filter((r) => r.stable)
    .map((r) => `${r.id}=${r.value}`)
    .sort()
    .join("\n");

export const fingerprintId = async (rows: Row[]): Promise<string> => (await sha(signature(rows))).slice(0, 16).toUpperCase();
