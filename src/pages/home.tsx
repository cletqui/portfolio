import { Context, Hono } from "hono";
import type { Env } from "..";
import { Avatar } from "../components/layout";
import { Terminal } from "../components/terminal";
import { jsonCard, terminalCard } from "../utils/card";
import { FLAGS } from "../utils/flags";
import { Icon } from "../utils/icons";

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
    desc: "about",
    href: "/about/me",
  },
  {
    icon: "layers",
    title: lang === "fr" ? "projets" : "projects",
    desc: "projects",
    href: "/projects",
  },
  {
    icon: "mail",
    title: "contact",
    desc: "contact",
    href: "/contact",
  },
];

const AvatarWithStatus = ({ size }: { size: number }) => (
  <div class="relative inline-block">
    <Avatar size={size} />
    <a
      href="/teapot"
      class="absolute bottom-5 right-5 h-8 w-8 rounded-full border-2 border-foreground/25 bg-card flex items-center justify-center text-base hover:scale-110 transition-transform no-underline!"
      title="418 I'm a teapot"
      aria-label="418 I'm a teapot"
    >
      <span class="block -translate-y-0.5 leading-none">🫖</span>
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
        {`$ ${desc}`}
      </div>
    </div>
    <Icon
      name="chevron-right"
      size={14}
      class="text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors mt-0.5 shrink-0"
    />
  </a>
);

const StackFootnote = () => (
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
  c.header("X-Flag", FLAGS.header);
  const userAgent = c.req.header("user-agent") ?? "";
  const accept = c.req.header("accept") ?? "";
  if (accept.includes("application/json")) return c.json(jsonCard());
  if (
    /^(curl|wget|httpie|xh)\b/i.test(userAgent) ||
    (accept.includes("text/plain") && !accept.includes("text/html"))
  )
    return c.text(terminalCard(lang, userAgent.startsWith("curl/")));
  return c.render(
    <div class="mx-auto max-w-6xl px-4 py-16 space-y-16">
      <section class="grid items-center gap-10 md:grid-cols-[1fr_auto]">
        <div class="space-y-6">
          <h1 class="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {lang === "fr"
              ? "Ingénieur cybersécurité et développeur full-stack"
              : "Cybersecurity engineer and full-stack developer"}
          </h1>
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
        <Terminal lang={lang} />
      </section>

      <StackFootnote />
    </div>,
  );
});


app.options("/", (c: Context<Env>) => {
  c.header("Allow", "GET, HEAD, OPTIONS");
  c.header("X-Flag", FLAGS.options);
  return c.body(null, 204);
});

export default app;
