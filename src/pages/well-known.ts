import { Hono } from "hono";
import type { Env } from "..";
import { FLAGS } from "../utils/flags";
import { PGP } from "../utils/pgp";

const app = new Hono<Env>();

app.get("/robots.txt", (c) => c.redirect("/.well-known/robots.txt", 301));
app.get("/keybase.txt", (c) => c.redirect("/.well-known/keybase.txt", 301));
app.get("/security.txt", (c) => c.redirect("/.well-known/security.txt", 301));
app.get("/.well-known", (c) => c.redirect("https://www.rfc-editor.org/rfc/rfc8615"));

app.get("/.well-known/security.txt", (c) => {
  const origin = new URL(c.req.url).origin;
  const expires = new Date(Date.now() + 300 * 86_400_000).toISOString();
  return c.text(
    [
      `Contact: ${origin}/contact`,
      "Contact: mailto:admin@cybai.re",
      `Expires: ${expires}`,
      `Encryption: ${origin}/pgp.asc`,
      "Preferred-Languages: en, fr",
      `Canonical: ${origin}/.well-known/security.txt`,
      "",
      `# found something? submit it at ${origin}/ctf`,
      `# ${FLAGS["security-txt"]}`,
      "",
    ].join("\n"),
  );
});

app.get("/humans.txt", (c) =>
  c.text(
    [
      "/* TEAM */",
      "Developer: cybai.re",
      "Site: https://cybai.re",
      "",
      "/* THANKS */",
      "Hono · Tailwind CSS · Cloudflare Pages",
      "",
      "/* CONTACT */",
      "Email: admin@cybai.re",
      `PGP: ${PGP.fingerprint}`,
      "",
      "/* SITE */",
      `Last update: ${new Date().getFullYear()}`,
      "Language: English / French",
      "",
      `# ${FLAGS.humans}`,
    ].join("\n"),
  ),
);

export default app;
