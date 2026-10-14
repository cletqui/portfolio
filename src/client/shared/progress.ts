export interface FoundFlag {
  flag: string;
  points: number;
  name: string;
}
export type Found = Record<string, FoundFlag>;
export type StorageLike = Pick<Storage, "getItem" | "setItem"> & Partial<Pick<Storage, "removeItem">>;

export const STORAGE_KEY = "ctf_found";

export class Progress {
  private memory: Found | null = null;

  constructor(private readonly storage: StorageLike | null) {}

  get(): Found {
    if (this.memory) return this.memory;
    try {
      const parsed: unknown = JSON.parse(this.storage?.getItem(STORAGE_KEY) ?? "{}");
      return parsed && typeof parsed === "object" ? (parsed as Found) : {};
    } catch {
      return {};
    }
  }

  private save(found: Found): void {
    try {
      if (!this.storage) throw new Error("no storage");
      this.storage.setItem(STORAGE_KEY, JSON.stringify(found));
      this.memory = null;
    } catch {
      this.memory = found;
    }
  }

  add(id: string, entry: FoundFlag): Found {
    const found = { ...this.get(), [id]: entry };
    this.save(found);
    return found;
  }

  has(flag: string): boolean {
    return Object.values(this.get()).some((f) => f.flag === flag);
  }

  reset(): void {
    this.memory = null;
    try {
      if (this.storage?.removeItem) this.storage.removeItem(STORAGE_KEY);
      else this.storage?.setItem(STORAGE_KEY, "{}");
    } catch {
      /* storage may be blocked */
    }
  }

  count(): number {
    return Object.keys(this.get()).length;
  }

  points(): number {
    return Object.values(this.get()).reduce((sum, f) => sum + (f.points || 0), 0);
  }
}
