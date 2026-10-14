import type { Group, Lie, LieLevel, Row, RtcState } from "./types";

export class ScanState {
  rows: Row[] = [];
  lies: Lie[] = [];
  infer: string[] = [];
  rtc: RtcState = "idle";

  add(group: Group, id: string, label: string, value: unknown, bits = 0, stable = true): void {
    if (value === undefined || value === null || value === "") return;
    this.rows.push({ group, id, label, value: String(value), bits, stable });
  }

  get(id: string): string | undefined {
    return this.rows.find((r) => r.id === id)?.value;
  }

  lie(id: string, level: LieLevel, title: string, detail: string): void {
    const next: Lie = { id, level, title, detail };
    const i = this.lies.findIndex((l) => l.id === id);
    if (i >= 0) this.lies[i] = next;
    else this.lies.push(next);
  }

  inGroup(group: Group): Row[] {
    return this.rows.filter((r) => r.group === group);
  }
}
