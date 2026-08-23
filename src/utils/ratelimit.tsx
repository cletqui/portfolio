import { createMiddleware } from "hono/factory";

export const rateLimit = ({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}) => {
  const hits = new Map<string, number[]>();

  return createMiddleware(async (c, next) => {
    const key = c.req.header("cf-connecting-ip") ?? "anon";
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

    if (recent.length >= limit) {
      const retry = Math.ceil((windowMs - (now - recent[0])) / 1000);
      c.header("Retry-After", String(retry));
      return c.json({ error: "rate limited" }, 429);
    }

    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 10_000) hits.clear();

    await next();
  });
};
