import { Context, Hono } from "hono";
import { Env } from "..";

import ctf, { CHALLENGE_COUNT, TOTAL_POINTS } from "./ctf";
import { projects } from "./projects";
import { contacts } from "./contact";
import { Avatar } from "../components/layout";
import { Error } from "../components/error";
import { Icon } from "../utils/icons";
import { useNonce } from "../utils/security";
import { FLAGS } from "../utils/flags";
import { FAKE_GIT } from "../utils/fake-git";
import { PGP } from "../utils/pgp";
import { jsonCard, plainCard, terminalCard } from "../utils/card";

/* APP */
const app = new Hono<Env>();

const STACK = [
  ["Hono", "https://hono.dev/"],
  ["Tailwind CSS", "https://tailwindcss.com/"],
  ["Cloudflare Pages", "https://pages.cloudflare.com/"],
  ["TypeScript", "https://www.typescriptlang.org/"],
  ["Wrangler", "https://developers.cloudflare.com/workers/wrangler/"],
] as const;

const NAV_ITEMS = (lang: string) => [
  {
    icon: "user-round",
    title: lang === "fr" ? "à propos" : "about me",
    desc: "whoami",
    href: "/about/me",
  },
  {
    icon: "layers",
    title: lang === "fr" ? "projets" : "projects",
    desc: "cd ~/projects",
    href: "/projects",
  },
  {
    icon: "mail",
    title: "contact",
    desc: "ssh me@cybai.re",
    href: "/contact",
  },
];

const Welcome = ({ lang }: { lang: string }) => {
  const data = JSON.stringify({
    lang,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      desc: lang === "fr" ? p.descriptionFr : p.description,
      url: p.href ?? `https://www.cybai.re${p.internal}`,
      github: p.github,
    })),
    contacts: contacts.map((c) => ({
      name: lang === "fr" && c.nameFr ? c.nameFr : c.name,
      href: c.href,
    })),
    pgp: PGP.fingerprint,
    pgpId: PGP.keyId,
    challenges: CHALLENGE_COUNT,
    points: TOTAL_POINTS,
    card: plainCard(lang),
  }).replace(/</g, "\\u003c");
  return (
    <div class="w-full space-y-3">
      <div
        id="shell"
        class="rounded-lg border border-border bg-muted/40 font-mono text-sm shadow-sm cursor-text"
      >
        <div class="flex items-center gap-1.5 border-b border-border px-3 py-2 opacity-60 select-none">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span class="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span class="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span class="ml-2 text-xs text-muted-foreground">
            visitor@cybai.re
          </span>
        </div>
        <div
          id="shell-screen"
          class="h-[26rem] overflow-y-auto px-4 pt-3 space-y-0.5"
          aria-live="polite"
        >
          <noscript>
            <p class="text-muted-foreground">
              {lang === "fr"
                ? "Ce terminal a besoin de JavaScript. Utilise la navigation en haut de page."
                : "This terminal needs JavaScript. Use the navigation at the top of the page."}
            </p>
          </noscript>
        </div>
        <form id="shell-form" class="flex gap-2 px-4 pb-3 pt-0.5">
          <label for="shell-input" id="shell-prompt" class="text-green-500 shrink-0 select-none">
            visitor@cybai.re:~$
          </label>
          <input
            id="shell-input"
            type="text"
            class="flex-1 min-w-0 bg-transparent outline-none"
            name="shell-input"
            autocomplete="off"
            autocapitalize="off"
            data-bwignore="true"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            spellcheck={false}
            aria-label="terminal"
          />
        </form>
      </div>
      <script
        type="application/json"
        id="shell-data"
        dangerouslySetInnerHTML={{ __html: data }}
      />
      <script src="/static/shell.js" defer nonce={useNonce()} />
    </div>
  );
};

const AvatarWithStatus = ({ size }: { size: number }) => (
  <div class="relative inline-block">
    <Avatar size={size} />
    <a
      href="/teapot"
      class="absolute bottom-5 right-5 h-8 w-8 rounded-full border-2 border-foreground/25 bg-card flex items-center justify-center text-base hover:scale-110 transition-transform no-underline!"
      title="418 I'm a teapot"
      aria-label="418 I'm a teapot"
    >
      🫖
    </a>
  </div>
);

const Description = ({ lang }: { lang: string }) => (
  <div class="space-y-4">
    <p class="text-lg leading-relaxed text-balance">
      {lang === "fr"
        ? "Ce portfolio est juste un terrain de jeu pour présenter mes projets, mes passions, moi-même."
        : "This portfolio is just a playground to showcase my projects, my passions, myself."}
    </p>
    <p class="border-l-2 border-border pl-4 leading-relaxed text-muted-foreground">
      {lang === "fr"
        ? "Je construis des projets que vous pouvez voir… et je sécurise des projets que vous ne pouvez pas voir. Ce site… disons qu'il a plus que quelques niveaux. Chaque clic, chaque transition, a été conçu dans un but précis. Vous êtes curieux ? Plongez-y."
        : "I build things you can see… and secure things you can't. This site? Let's just say it has more than a few layers. Every click, every transition, crafted with purpose. Curious? Dive in."}
    </p>
  </div>
);

const NavCard = ({
  icon,
  title,
  desc,
  href,
}: {
  icon: string;
  title: string;
  desc: string;
  href: string;
}) => (
  <a
    href={href}
    class="card flex items-start gap-3 group no-underline! hover:no-underline!"
  >
    <Icon name={icon} size={18} class="text-muted-foreground mt-0.5 shrink-0" />
    <div class="flex-1 min-w-0">
      <div class="font-semibold text-sm mb-0.5">{title}</div>
      <div class="text-xs font-mono text-muted-foreground leading-relaxed">
        {desc}
      </div>
    </div>
    <Icon
      name="chevron-right"
      size={14}
      class="text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors mt-0.5 shrink-0"
    />
  </a>
);

const StackFootnote = ({ lang }: { lang: string }) => (
  <div class="flex items-center gap-2 flex-wrap justify-center">
    <span class="text-xs font-mono text-muted-foreground">{"// stack"}</span>
    {STACK.map(([name, href]) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        class="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono hover:text-foreground transition-colors no-underline!"
      >
        {name}
      </a>
    ))}
  </div>
);

/* ENDPOINTS */
app.get("/", (c: Context<Env>) => {
  const { lang } = c.var;
  c.header("X-Flag", "cybai{X-S3cr3t-H3ad3r}");
  const userAgent = c.req.header("user-agent") ?? "";
  if (userAgent.startsWith("curl/")) {
    c.header("X-Curl-Flag", "cybai{T3rm1n4lPuR1st}");
  }
  const accept = c.req.header("accept") ?? "";
  if (accept.includes("application/json")) return c.json(jsonCard());
  if (
    /^(curl|wget|httpie|xh)\b/i.test(userAgent) ||
    (accept.includes("text/plain") && !accept.includes("text/html"))
  )
    return c.text(terminalCard(lang));
  return c.render(
    <div class="mx-auto max-w-6xl px-4 py-16 space-y-16">
      <section class="grid items-center gap-10 md:grid-cols-[1fr_auto]">
        <div class="space-y-6">
          <div class="space-y-3">
            <p class="font-mono text-sm text-muted-foreground">
              {"// "}
              {lang === "fr"
                ? "ingénieur cybersécurité · développeur full-stack"
                : "cybersecurity engineer · full-stack developer"}
            </p>
            <h1 class="text-5xl font-bold tracking-tight sm:text-6xl">
              cybai.re
            </h1>
          </div>
          <Description lang={lang} />
        </div>
        <div class="flex justify-center md:order-last">
          <AvatarWithStatus size={220} />
        </div>
      </section>

      <div class="grid sm:grid-cols-3 gap-4">
        {NAV_ITEMS(lang).map((item) => (
          <NavCard {...item} />
        ))}
      </div>

      <section>
        <Welcome lang={lang} />
      </section>

      <StackFootnote lang={lang} />
    </div>,
  );
});

app.get("/robots.txt", (c: Context<Env>) =>
  c.redirect("/.well-known/robots.txt", 301),
);

app.get("/keybase.txt", (c: Context<Env>) =>
  c.redirect("/.well-known/keybase.txt", 301),
);

/* EASTER EGGS */
app.get("/.well-known", (c: Context<Env>) =>
  c.redirect("https://www.rfc-editor.org/rfc/rfc8615"),
);

app
  .get("/teapot", (c: Context<Env>) => {
    c.header("X-Flag", "cybai{1mAT34p0t}");
    return c.text("I'm a teapot", 418);
  })
  .post((c: Context<Env>) =>
    c.redirect("https://www.rfc-editor.org/rfc/rfc2324#section-2.3.2"),
  );

app.get("/rickroll", (c: Context<Env>) =>
  c.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUJcmljayByb2xs"),
);

app.get("/fl@g.txt", (c: Context<Env>) =>
  c.text("cybai{D1dY0uR34dTh3M4n1f3St}"),
);

app.get("/ctf.txt", (c: Context<Env>) =>
  c.text("cybai{D1dY0uF1ndWh3r3T05ubm1tM3?}"),
);

app.get("/.well-known/security.txt", (c: Context<Env>) => {
  const origin = new URL(c.req.url).origin;
  const expires = new Date(Date.now() + 300 * 86_400_000).toISOString();
  return c.text(
    `Contact: ${origin}/contact\nContact: mailto:admin@cybai.re\nExpires: ${expires}\nEncryption: ${origin}/pgp.asc\nPreferred-Languages: en, fr\nCanonical: ${origin}/.well-known/security.txt\n\n# found something? submit it at ${origin}/ctf\n# ${FLAGS["security-txt"]}\n`,
  );
});

app.get("/security.txt", (c: Context<Env>) =>
  c.redirect("/.well-known/security.txt", 301),
);

app.get("/.env", (c: Context<Env>) =>
  c.text(
    `NODE_ENV=production\nDATABASE_URL=postgres://admin:hunter2@db.internal:5432/portfolio\nSTRIPE_SECRET_KEY=sk_live_this_is_not_a_real_key\nCTF_FLAG=${FLAGS.env}\n`,
  ),
);

app.get("/.git/*", (c: Context<Env>, next) => {
  const key = new URL(c.req.url).pathname.replace(/^\/\.git\//, "");
  const encoded = Object.prototype.hasOwnProperty.call(FAKE_GIT, key)
    ? FAKE_GIT[key]
    : undefined;
  if (!encoded) return next();
  const bytes = Uint8Array.from(atob(encoded), (ch) => ch.charCodeAt(0));
  const isObject = key.startsWith("objects/") || key === "index";
  return c.body(bytes, 200, {
    "Content-Type": isObject
      ? "application/octet-stream"
      : "text/plain; charset=utf-8",
  });
});

app.options("/", (c: Context<Env>) => {
  c.header("Allow", "GET, HEAD, OPTIONS");
  c.header("X-Flag", "cybai{0pT10nSm4tt3r}");
  return c.body(null, 204);
});

app.get("/humans.txt", (c: Context<Env>) =>
  c.text(
    `/* TEAM */\nDeveloper: cybai.re\nSite: https://cybai.re\n\n/* THANKS */\nHono · Tailwind CSS · Cloudflare Pages\n\n/* CONTACT */\nEmail: admin@cybai.re\nPGP: ${PGP.fingerprint}\n\n/* SITE */\nLast update: ${new Date().getFullYear()}\nLanguage: English / French\n\n# cybai{H3ll0Hum4ns}`,
  ),
);

app.route("/ctf", ctf);

/* DEFAULT */
app.get("*", (c: Context<Env>) => {
  const { lang } = c.var;
  const error = 404;
  c.status(error);
  return c.render(<Error lang={lang} error={error} />, { title: "404" });
});

export default app;
