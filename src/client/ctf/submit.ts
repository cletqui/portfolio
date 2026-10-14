import type { Progress } from "../shared/progress";

export type Outcome =
  | { kind: "already" }
  | { kind: "success"; id: string; name: string; points: number }
  | { kind: "invalid" }
  | { kind: "error" };

interface SubmitResponse {
  valid: boolean;
  id?: string;
  name?: string;
  points?: number;
}

export const submitFlag = async (flag: string, progress: Progress, doFetch: typeof fetch): Promise<Outcome> => {
  if (progress.has(flag)) return { kind: "already" };
  try {
    const res = await doFetch("/ctf/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flag }),
    });
    const data = (await res.json()) as SubmitResponse;
    if (!data.valid || !data.id) return { kind: "invalid" };
    const points = data.points ?? 0;
    const name = data.name ?? data.id;
    progress.add(data.id, { flag, points, name });
    return { kind: "success", id: data.id, name, points };
  } catch {
    return { kind: "error" };
  }
};
