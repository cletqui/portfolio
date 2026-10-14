import { Context, Hono } from "hono";
import { Env } from "..";
import { Button, Epochalypse, Title } from "../components/layout";
import { Error } from "../components/error";
import { Icon } from "../utils/icons";

type Category = "security" | "web" | "tinkering";

const CATEGORIES: { id: Category; label: [string, string] }[] = [
  { id: "security", label: ["Security", "Sécurité"] },
  { id: "web", label: ["Web", "Web"] },
  { id: "tinkering", label: ["Tinkering", "Bidouille"] },
];

interface Project {
  id: string;
  name: string;
  icon: string;
  category: Category;
  featured?: boolean;
  description?: string;
  descriptionFr?: string;
  internal?: string;
  href?: string;
  github?: string;
}

/* GLOBAL CONSTANTS */
export const projects: Project[] = [
  {
    id: "petithub",
    category: "web",
    featured: true,
    name: "PetitHub",
    icon: "github",
    description:
      "A lightweight GitHub profile explorer. Browse repositories, stars, and activity for any user — no login required.",
    descriptionFr:
      "Un explorateur de profil GitHub léger. Parcourez les dépôts, les étoiles et l'activité de n'importe quel utilisateur — sans connexion requise.",
    internal: "/projects/petithub",
    href: "https://petithub.cybai.re/",
    github: "https://github.com/cletqui/petithub",
  },
  {
    id: "portfolio",
    category: "web",
    featured: true,
    name: "Portfolio",
    icon: "book-user",
    description:
      "This very site. Built with Hono, deployed on Cloudflare Pages, with more layers than it appears.",
    descriptionFr:
      "Ce site même. Construit avec Hono, déployé sur Cloudflare Pages, avec plus de couches qu'il n'y paraît.",
    internal: "/projects/portfolio",
    href: "https://www.cybai.re/",
    github: "https://github.com/cletqui/portfolio",
  },
  {
    id: "app",
    category: "security",
    featured: true,
    name: "App",
    icon: "scan-search",
    description:
      "OSINT Swiss-knife — paste a domain, IP, CVE, hash, or JWT for instant cyber intelligence. Backed by api.cybai.re.",
    descriptionFr:
      "Couteau suisse OSINT — collez un domaine, une IP, un CVE, un hash ou un JWT pour une cyber-intelligence instantanée. Propulsé par api.cybai.re.",
    internal: "/projects/app",
    href: "https://app.cybai.re/",
    github: "https://github.com/cletqui/app.cybai.re",
  },
  {
    id: "api",
    category: "security",
    featured: true,
    name: "API",
    icon: "code-xml",
    description:
      "A unified Cloudflare Worker for cyber intelligence — IP geolocation, domain analysis, CVE lookup, User-Agent parsing, and more.",
    descriptionFr:
      "Un Cloudflare Worker unifié pour la cyber-intelligence — géolocalisation IP, analyse de domaine, recherche CVE, analyse User-Agent, et plus encore.",
    internal: "/projects/api",
    href: "https://api.cybai.re/",
    github: "https://github.com/cletqui/api",
  },
  {
    id: "mail",
    category: "security",
    featured: true,
    name: "Mail",
    icon: "mail",
    description:
      "A client-side email analyzer powered by postal-mime. Drag and drop a .eml file and read it entirely offline — no server involved.",
    descriptionFr:
      "Un analyseur d'e-mails côté client propulsé par postal-mime. Glissez-déposez un fichier .eml et lisez-le entièrement hors ligne — aucun serveur impliqué.",
    internal: "/projects/mail",
    href: "https://mail.cybai.re/",
    github: "https://github.com/cletqui/mail",
  },
  {
    id: "callot",
    category: "web",
    featured: true,
    name: "Callot",
    icon: "map-pin",
    description:
      "Tide accessibility tracker for Île Callot, a tidal island in Brittany. Live access windows, cosine-interpolated tide sparkline, and weather.",
    descriptionFr:
      "Suivi d'accessibilité des marées pour l'Île Callot, île tidale en Bretagne. Fenêtres d'accès en direct, sparkline de marée interpolée et météo.",
    internal: "/projects/callot",
    href: "https://callot.pages.dev/",
    github: "https://github.com/cletqui/callot",
  },
  {
    id: "tide",
    category: "web",
    featured: true,
    name: "Tide",
    icon: "waves",
    description:
      "Tide clock for French coastal stations. Serves tide times and heights through a clean UI.",
    descriptionFr:
      "Horloge des marées pour les stations côtières françaises. Affiche les horaires et hauteurs de marée dans une interface épurée.",
    internal: "/projects/tide",
    href: "https://api.cybai.re/data/tide",
    github: "https://github.com/cletqui/tide",
  },
  {
    id: "apero",
    category: "web",
    featured: true,
    name: "Apéro",
    icon: "beer",
    description:
      "The only security tool that truly matters: is it apéro time? Time-zone-aware, serverless, and critical infrastructure.",
    descriptionFr:
      "Le seul outil de sécurité qui compte vraiment : est-ce l'heure de l'apéro ? Conscient des fuseaux horaires, sans serveur, et infrastructure critique.",
    internal: "/projects/apero",
    href: "https://apero.cybai.re/",
    github: "https://github.com/cletqui/apero",
  },
  {
    id: "epochalypse",
    category: "web",
    featured: true,
    name: "Epochalypse",
    icon: "clock",
    description:
      "A countdown to the Unix Year 2038 problem — when 32-bit signed integers overflow and time itself breaks.",
    descriptionFr:
      "Un compte à rebours jusqu'au problème de l'an 2038 Unix — quand les entiers signés 32 bits débordent et que le temps lui-même se brise.",
    internal: "/projects/epochalypse",
    href: "/projects/epochalypse",
  },
  {
    id: "myip",
    category: "security",
    name: "MyIP",
    icon: "globe",
    description: "A tiny page that tells you your public IP address, nothing more.",
    descriptionFr:
      "Une toute petite page qui affiche ton adresse IP publique, rien de plus.",
    internal: "/projects/myip",
    href: "https://myip.cybai.re/",
    github: "https://github.com/cletqui/myip",
  },
  {
    id: "pebble-tide",
    category: "tinkering",
    name: "Pebble Tide",
    icon: "waves",
    description:
      "A minimalist tide-clock watchface for Pebble: a single hand, 12 is high water, 6 is low water.",
    descriptionFr:
      "Un cadran de marées minimaliste pour Pebble : une seule aiguille, 12 heures = marée haute, 6 heures = marée basse.",
    internal: "/projects/pebble-tide",
    github: "https://github.com/cletqui/pebble-tide",
  },
  {
    id: "ticdot",
    category: "tinkering",
    name: "Ticdot",
    icon: "clock",
    description: "A minimal analog watchface for the Pebble Time 2.",
    descriptionFr: "Un cadran analogique minimaliste pour la Pebble Time 2.",
    internal: "/projects/ticdot",
    github: "https://github.com/cletqui/ticdot",
  },
  {
    id: "waybar-cookie-clicker",
    category: "tinkering",
    name: "Waybar Cookie Clicker",
    icon: "cookie",
    description:
      "A Waybar module for the iconic Cookie Clicker game, right in your status bar.",
    descriptionFr:
      "Un module Waybar pour l'iconique jeu Cookie Clicker, directement dans ta barre d'état.",
    internal: "/projects/waybar-cookie-clicker",
    github: "https://github.com/cletqui/waybar_cookie_clicker",
  },
];

/* APP */
const app = new Hono<Env>();

/* COMPONENTS */
const categoryLabel = (id: Category, lang: string) =>
  CATEGORIES.find((c) => c.id === id)?.label[lang === "fr" ? 1 : 0] ?? id;

const TINT: Record<Category, string> = {
  security: "from-emerald-500/15 via-emerald-500/5 text-emerald-600/70",
  web: "from-sky-500/15 via-sky-500/5 text-sky-600/70",
  tinkering: "from-amber-500/15 via-amber-500/5 text-amber-600/70",
};

const Cover = ({ p }: { p: Project }) => (
  <div
    class={`flex h-full w-full items-center justify-center bg-gradient-to-br to-transparent transition-transform duration-300 group-hover:scale-105 ${TINT[p.category]}`}
  >
    <Icon name={p.icon} size={44} />
  </div>
);

const ProjectCard = ({ lang, p }: { lang: string; p: Project }) => (
  <article class="card group flex flex-col gap-0 overflow-hidden p-0">
    <a
      href={p.internal}
      class="block aspect-[5/2] overflow-hidden border-b border-border no-underline!"
      tabindex={-1}
      aria-hidden="true"
    >
      <Cover p={p} />
    </a>
    <div class="flex flex-1 flex-col gap-2 p-4">
      <div class="flex items-center justify-between gap-2">
        <h3 class="flex items-center gap-2 font-semibold">
          <Icon name={p.icon} size={16} class="text-muted-foreground" />
          <a href={p.internal} class="no-underline! hover:underline!">
            {p.name}
          </a>
        </h3>
        <span class="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {categoryLabel(p.category, lang)}
        </span>
      </div>
      <p class="flex-1 text-sm leading-relaxed text-muted-foreground">
        {lang === "fr" && p.descriptionFr ? p.descriptionFr : p.description}
      </p>
      <div class="flex items-center gap-2 pt-2">
        <a
          href={p.internal}
          class="inline-flex items-center gap-1 text-sm font-medium no-underline!"
        >
          {lang === "fr" ? "Détails" : "Details"}
          <Icon name="chevron-right" size={14} />
        </a>
        <span class="ml-auto flex gap-1.5">
          {p.github && (
            <a
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              class="icon-btn"
              title="GitHub"
              aria-label={`${p.name} on GitHub`}
            >
              <Icon name="github" size={15} />
            </a>
          )}
          {p.href && (
            <a
              href={p.href}
              target={p.href.startsWith("/") ? "_self" : "_blank"}
              rel="noopener noreferrer"
              class="icon-btn"
              title={lang === "fr" ? "Ouvrir" : "Open"}
              aria-label={`${lang === "fr" ? "Ouvrir" : "Open"} ${p.name}`}
            >
              <Icon name="external-link" size={15} />
            </a>
          )}
        </span>
      </div>
    </div>
  </article>
);

const ProjectDetail = ({ lang, p }: { lang: string; p: Project }) => (
  <div class="mx-auto max-w-3xl px-4 py-12">
    <a
      href="/projects"
      class="mb-6 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground no-underline! hover:text-foreground"
    >
      <Icon name="chevron-left" size={12} />
      {lang === "fr" ? "tous les projets" : "all projects"}
    </a>
    <div class="space-y-6">
      <div class="space-y-3">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <Icon name={p.icon} size={26} class="text-muted-foreground" />
            {p.name}
          </h1>
          <span class="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {categoryLabel(p.category, lang)}
          </span>
        </div>
        <p class="leading-relaxed text-muted-foreground">
          {lang === "fr" && p.descriptionFr ? p.descriptionFr : p.description}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        {p.href && (
          <Button
            text={lang === "fr" ? "Ouvrir" : "Open"}
            href={p.href}
            icon="external-link"
            style="primary"
            external
          />
        )}
        {p.github && (
          <Button
            text="GitHub"
            href={p.github}
            icon="github"
            style="secondary"
            external
          />
        )}
      </div>
    </div>
  </div>
);

/* ENDPOINTS */
app.get("/epochalypse", (c: Context<Env>) => {
  const { lang } = c.var;
  return c.render(
    <div class="mx-auto max-w-3xl px-4 py-12 flex flex-col items-center">
      <Title>Epochalypse</Title>

      <div class="py-8">
        <Epochalypse lang={lang} />
      </div>

      <div class="flex gap-3">
        <Button
          text={lang === "fr" ? "Explication" : "Explanation"}
          icon="book-a"
          href="https://en.wikipedia.org/wiki/Year_2038_problem"
          external
        />
        <Button
          text={lang === "fr" ? "Visualisation" : "Visualisation"}
          icon="arrow-up-1-0"
          href="https://www.epochalypse.today/"
          style="secondary"
          external
        />
      </div>
    </div>,
    {
      title: "Epochalypse",
      description:
        lang === "fr"
          ? "Un compte à rebours jusqu'au problème de l'an 2038 Unix."
          : "A countdown to the Unix Year 2038 problem.",
    },
  );
});

app.get("/:id", (c: Context<Env>) => {
  const { lang } = c.var;
  const p = projects.find((p) => p.id === c.req.param("id"));
  if (!p) {
    c.status(404);
    return c.render(<Error lang={lang} error={404} />, { title: "404" });
  }
  return c.render(<ProjectDetail lang={lang} p={p} />, {
    title: p.name,
    description:
      lang === "fr" && p.descriptionFr ? p.descriptionFr : p.description,
  });
});

app.get("", (c: Context<Env>) => {
  const { lang } = c.var;
  const active = CATEGORIES.find((cat) => cat.id === c.req.query("cat"))?.id;
  const list = projects.filter((p) => !active || p.category === active);
  const chip = (href: string, on: boolean, label: string) => (
    <a
      href={href}
      class={`rounded px-2.5 py-1 font-mono text-xs no-underline! transition-colors ${
        on
          ? "bg-foreground text-background"
          : "bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </a>
  );
  return c.render(
    <div class="mx-auto max-w-6xl px-4 py-12">
      <div class="flex flex-col items-center mb-6">
        <Title>{lang === "fr" ? "Projets" : "Projects"}</Title>
      </div>

      <div class="mb-8 flex flex-wrap justify-center gap-2">
        {chip("/projects", !active, lang === "fr" ? "tout" : "all")}
        {CATEGORIES.map((cat) =>
          chip(
            `/projects?cat=${cat.id}`,
            active === cat.id,
            cat.label[lang === "fr" ? 1 : 0].toLowerCase(),
          ),
        )}
      </div>

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProjectCard lang={lang} p={p} />
        ))}
      </div>
    </div>,
    { title: lang === "fr" ? "Projets" : "Projects" },
  );
});

export default app;
