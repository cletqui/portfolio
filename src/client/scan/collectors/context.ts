import type { Translate } from "../../shared/i18n";
import type { ScanState } from "../state";
import type { ServerSignals } from "../types";

export interface Ctx {
  state: ScanState;
  t: Translate;
  signals: ServerSignals;
}

export type Collector = (ctx: Ctx) => void | Promise<void>;

export const unavailable = (message: string): never => {
  throw new Error(message);
};
