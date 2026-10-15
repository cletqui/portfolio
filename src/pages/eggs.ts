import { Hono } from "hono";
import type { Env } from "..";
import { HTPASSWD } from "../data/admin";
import { FAKE_GIT } from "../utils/fake-git";
import { FLAGS } from "../utils/flags";

const app = new Hono<Env>();

app
  .get("/teapot", (c) =>
    c.text(
      [
        "418 I'm a teapot",
        "",
        "      ;,'",
        "   _o_    ;:;'",
        " ,-.'--;o.   ;:;'",
        "(,'  `.  `.-.__",
        " \\ `.__) `. ))))",
        "  `._.______`'",
        "",
        "The requested entity body is short and stout.",
        `Tip me over and pour me out: ${FLAGS.teapot}`,
        "",
      ].join("\n"),
      418,
    ),
  )
  .post((c) => c.redirect("https://www.rfc-editor.org/rfc/rfc2324#section-2.3.2"));

app.get("/rickroll", (c) => c.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUJcmljayByb2xs"));
app.get("/fl@g.txt", (c) => c.text(FLAGS.manifest));
app.get("/ctf.txt", (c) => c.text("Nothing here. The scoreboard lives at /ctf.\n"));
app.get("/.htpasswd", (c) => c.text(HTPASSWD));

app.get("/.env", (c) =>
  c.text(
    [
      "NODE_ENV=production",
      "DATABASE_URL=postgres://admin:hunter2@db.internal:5432/portfolio",
      "STRIPE_SECRET_KEY=sk_live_this_is_not_a_real_key",
      `CTF_FLAG=${FLAGS.env}`,
      "",
    ].join("\n"),
  ),
);

app.get("/.git/*", (c, next) => {
  const key = new URL(c.req.url).pathname.replace(/^\/\.git\//, "");
  const encoded = Object.hasOwn(FAKE_GIT, key) ? FAKE_GIT[key] : undefined;
  if (!encoded) return next();
  const bytes = Uint8Array.from(atob(encoded), (ch) => ch.charCodeAt(0));
  const isObject = key.startsWith("objects/") || key === "index";
  return c.body(bytes, 200, {
    "Content-Type": isObject ? "application/octet-stream" : "text/plain; charset=utf-8",
  });
});

export default app;
