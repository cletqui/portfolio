import { Hono } from "hono";
import type { Env } from "../..";
import { CHALLENGES } from "../../data/challenges";
import { FLAGS, findFlag } from "../../utils/flags";
import { signJwt, verifyJwt } from "../../utils/jwt";
import { rateLimit } from "../../utils/ratelimit";

const FLAG_RE = /^cybai\{[\x20-\x7E]{1,128}\}$/;
const JWT_SECRET = "letmein";

const api = new Hono<Env>();

api.use("/submit", rateLimit({ limit: 20, windowMs: 60_000 }));

api.post("/submit", async (c) => {
  const body = await c.req.json<{ flag?: string }>().catch(() => null);
  const flag = typeof body?.flag === "string" ? body.flag.trim() : "";
  if (!flag || !FLAG_RE.test(flag)) return c.json({ valid: false });

  const challenge = CHALLENGES.find((ch) => ch.id === findFlag(flag));
  if (!challenge) return c.json({ valid: false });

  const { id, name, points } = challenge;
  return c.json({ valid: true, id, name, points });
});

/* GATE */
api.get("/gate", (c) => {
  const forwarded = (c.req.header("x-forwarded-for") ?? "")
    .split(",")[0]
    .trim();
  const step = (n: number, status: 403 | 406, message: string) => {
    c.header("X-Gate-Step", String(n));
    return c.json({ step: n, error: "access denied", message }, status);
  };
  if (!["127.0.0.1", "::1", "localhost"].includes(forwarded))
    return step(
      1,
      403,
      "This door only opens from the inside. Where do you claim to come from?",
    );
  if (!/lynx/i.test(c.req.header("user-agent") ?? ""))
    return step(
      2,
      406,
      "Inside, we only use text-mode browsers. Ever met a certain big cat?",
    );
  if (!/^tlh\b/i.test(c.req.header("accept-language") ?? ""))
    return step(
      3,
      406,
      "I do not speak your language. Try the one spoken on Qo'noS.",
    );
  c.header("X-Gate-Step", "done");
  return c.json({ step: "done", flag: FLAGS.gate });
});


api.get("/whoami", async (c) =>
  c.json({
    user: "guest",
    role: "guest",
    token: await signJwt({ sub: "guest", role: "guest" }, JWT_SECRET),
    hint: "Admins live at /ctf/admin. Send your token as 'Authorization: Bearer <token>'.",
  }),
);

api.get("/admin", async (c) => {
  const token = (c.req.header("authorization") ?? "").replace(/^Bearer /i, "");
  const claims = token ? await verifyJwt(token, JWT_SECRET) : null;
  if (!claims) return c.json({ error: "missing or invalid token" }, 401);
  if (claims.role !== "admin")
    return c.json({ error: "guests are not welcome here", role: claims.role }, 403);
  return c.json({ welcome: "admin", flag: FLAGS.jwt });
});


export default api;
