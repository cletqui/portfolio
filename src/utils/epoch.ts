export const EPOCH_TARGET_MS = (2 ** 31 - 1) * 1000;

export const icsDate = (ms: number): string =>
  new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
