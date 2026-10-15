import { Context, Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { bodyLimit } from "hono/body-limit";
import type { Env } from "..";
import { ADMIN_PASSWORD, ADMIN_USER } from "../data/admin";
import { FLAGS } from "../utils/flags";
import { Icon } from "../utils/icons";

const REALM = "cybai.re intranet";

const SQLI = /('|--|;|\bor\b\s+\S+\s*=|\bunion\b|\bselect\b)/i;

const REFUSALS: [string, string][] = [
  ["Invalid credentials. This incident will not be reported (nobody reads the logs).", "Identifiants invalides. Cet incident ne sera pas signalé (personne ne lit les logs)."],
  ["Wrong again. The password is not 'password', I checked.", "Raté encore. Le mot de passe n'est pas 'password', j'ai vérifié."],
  ["Access denied. Have you tried turning it off and on again?", "Accès refusé. As-tu essayé de l'éteindre et de le rallumer ?"],
];

const SQLI_REFUSAL: [string, string] = [
  "Nice injection. Sadly this form talks to a database that does not exist.",
  "Jolie injection. Dommage, ce formulaire parle à une base de données qui n'existe pas.",
];

const LoginPage = ({ lang, error }: { lang: string; error?: string }) => {
  const fr = lang === "fr";
  return (
    <div class="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <form
        method="post"
        action="/login"
        class="card w-full max-w-sm space-y-4"
        autocomplete="off"
      >
        <div class="flex items-center gap-2">
          <Icon name="shield-check" size={18} class="text-muted-foreground" />
          <h1 class="text-lg font-semibold">
            {fr ? "Connexion à l'intranet" : "Intranet sign-in"}
          </h1>
        </div>
        {error && (
          <p role="alert" class="text-sm text-destructive">
            {error}
          </p>
        )}
        <label class="block space-y-1 text-sm">
          <span class="text-muted-foreground">{fr ? "Identifiant" : "Username"}</span>
          <input
            name="username"
            type="text"
            required
            data-bwignore="true"
            data-lpignore="true"
            data-1p-ignore="true"
            class="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2"
          />
        </label>
        <label class="block space-y-1 text-sm">
          <span class="text-muted-foreground">{fr ? "Mot de passe" : "Password"}</span>
          <input
            name="password"
            type="password"
            required
            data-bwignore="true"
            data-lpignore="true"
            data-1p-ignore="true"
            class="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2"
          />
        </label>
        <button type="submit" class="btn btn-primary w-full">
          {fr ? "Se connecter" : "Sign in"}
        </button>
        <p class="text-xs text-muted-foreground">
          {fr
            ? "Ce formulaire est décoratif. L'authentification réelle est ailleurs."
            : "This form is decorative. The real authentication lives elsewhere."}
        </p>
      </form>
    </div>
  );
};

const AdminPage = ({ lang }: { lang: string }) => {
  const fr = lang === "fr";
  const stats: [string, string][] = [
    [fr ? "Visiteurs en ligne" : "Visitors online", "0"],
    [fr ? "Tickets ouverts" : "Open tickets", "1337"],
    [fr ? "Dernière sauvegarde" : "Last backup", "03:00"],
    [fr ? "Mots de passe réutilisés" : "Reused passwords", "all of them"],
  ];
  return (
    <div class="mx-auto max-w-4xl space-y-6 px-4 py-12">
      <div class="flex items-center gap-2">
        <Icon name="shield-check" size={20} class="text-muted-foreground" />
        <h1 class="text-2xl font-bold">{fr ? "Panneau d'administration" : "Admin panel"}</h1>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div class="card">
            <div class="text-xs text-muted-foreground">{label}</div>
            <div class="font-mono text-lg">{value}</div>
          </div>
        ))}
      </div>
      <div class="card-primary space-y-2">
        <h2 class="font-semibold">{fr ? "Note interne" : "Internal note"}</h2>
        <p class="text-sm">
          {fr
            ? "Le mot de passe de ce panneau ne devait pas se retrouver dans un fichier .htpasswd accessible. Voici un flag pour la peine :"
            : "This panel's password was never meant to end up in a reachable .htpasswd. Here is a flag for your trouble:"}
        </p>
        <code class="block break-all font-mono text-sm">{FLAGS.admin}</code>
      </div>
    </div>
  );
};

const app = new Hono<Env>();

app.use(
  "/admin/*",
  basicAuth({
    username: ADMIN_USER,
    password: ADMIN_PASSWORD,
    realm: REALM,
    invalidUserMessage: "401 Unauthorized. Credentials are stored in the usual place.",
  }),
);

app.get("/admin", (c: Context<Env>) => {
  c.header("Cache-Control", "no-store");
  return c.render(<AdminPage lang={c.var.lang} />, { title: "Admin" });
});

app.get("/login", (c: Context<Env>) =>
  c.render(<LoginPage lang={c.var.lang} />, { title: "Login" }),
);

app.post("/login", bodyLimit({ maxSize: 4096, onError: (c) => c.text("Payload Too Large", 413) }), async (c: Context<Env>) => {
  const fr = c.var.lang === "fr";
  const form = await c.req.parseBody().catch(() => ({}) as Record<string, unknown>);
  const username = typeof form.username === "string" ? form.username : "";
  const password = typeof form.password === "string" ? form.password : "";
  const pick = SQLI.test(username) || SQLI.test(password)
    ? SQLI_REFUSAL
    : REFUSALS[(username.length + password.length) % REFUSALS.length]!;
  c.status(401);
  return c.render(<LoginPage lang={c.var.lang} error={pick[fr ? 1 : 0]} />, { title: "Login" });
});

app.get("/wp-login.php", (c) => c.redirect("/login", 302));
app.get("/wp-admin", (c) => c.redirect("/login", 302));

export default app;
