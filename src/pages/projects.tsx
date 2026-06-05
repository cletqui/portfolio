import { Context, Hono } from "hono";
import { Button, Epochalypse, Title } from "../components/layout";
import { Icon } from "../utils/icons";

interface Project {
  id: string;
  name: string;
  icon: string;
  description?: string;
  descriptionFr?: string;
  image?: string;
  internal?: string;
  href?: string;
  github?: string;
}

/* GLOBAL CONSTANTS */
export const projects: Project[] = [
  {
    id: "petithub",
    name: "PetitHub",
    icon: "github",
    description:
      "A lightweight GitHub profile explorer. Browse repositories, stars, and activity for any user — no login required.",
    descriptionFr:
      "Un explorateur de profil GitHub léger. Parcourez les dépôts, les étoiles et l'activité de n'importe quel utilisateur — sans connexion requise.",
    image: "/static/projects/petithub.png",
    internal: "/projects/petithub",
    href: "https://petithub.cybai.re/",
    github: "https://github.com/cletqui/petithub",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    icon: "book-user",
    description:
      "This very site. Built with Hono, deployed on Cloudflare Pages, with more layers than it appears.",
    descriptionFr:
      "Ce site même. Construit avec Hono, déployé sur Cloudflare Pages, avec plus de couches qu'il n'y paraît.",
    image: "/static/projects/portfolio.png",
    internal: "/projects/portfolio",
    href: "https://www.cybai.re/",
    github: "https://github.com/cletqui/portfolio",
  },
  {
    id: "app",
    name: "App",
    icon: "scan-search",
    description:
      "OSINT Swiss-knife — paste a domain, IP, CVE, hash, or JWT for instant cyber intelligence. Backed by api.cybai.re.",
    descriptionFr:
      "Couteau suisse OSINT — collez un domaine, une IP, un CVE, un hash ou un JWT pour une cyber-intelligence instantanée. Propulsé par api.cybai.re.",
    image: "/static/projects/app.png",
    internal: "/projects/app",
    href: "https://app.cybai.re/",
    github: "https://github.com/cletqui/app.cybai.re",
  },
  {
    id: "api",
    name: "API",
    icon: "code-xml",
    description:
      "A unified Cloudflare Worker for cyber intelligence — IP geolocation, domain analysis, CVE lookup, User-Agent parsing, and more.",
    descriptionFr:
      "Un Cloudflare Worker unifié pour la cyber-intelligence — géolocalisation IP, analyse de domaine, recherche CVE, analyse User-Agent, et plus encore.",
    image: "/static/projects/api.png",
    internal: "/projects/api",
    href: "https://api.cybai.re/",
    github: "https://github.com/cletqui/api",
  },
  {
    id: "mail",
    name: "Mail",
    icon: "mail",
    description:
      "A client-side email analyzer powered by postal-mime. Drag and drop a .eml file and read it entirely offline — no server involved.",
    descriptionFr:
      "Un analyseur d'e-mails côté client propulsé par postal-mime. Glissez-déposez un fichier .eml et lisez-le entièrement hors ligne — aucun serveur impliqué.",
    image: "/static/projects/mail.png",
    internal: "/projects/mail",
    href: "https://mail.cybai.re/",
    github: "https://github.com/cletqui/mail",
  },
  {
    id: "callot",
    name: "Callot",
    icon: "map-pin",
    description:
      "Tide accessibility tracker for Île Callot, a tidal island in Brittany. Live access windows, cosine-interpolated tide sparkline, and weather.",
    descriptionFr:
      "Suivi d'accessibilité des marées pour l'Île Callot, île tidale en Bretagne. Fenêtres d'accès en direct, sparkline de marée interpolée et météo.",
    image: "/static/projects/callot.png",
    internal: "/projects/callot",
    href: "https://callot.pages.dev/",
    github: "https://github.com/cletqui/callot",
  },
  {
    id: "tide",
    name: "Tide",
    icon: "waves",
    description:
      "Tide clock for French coastal stations. Serves tide times and heights through a clean UI.",
    descriptionFr:
      "Horloge des marées pour les stations côtières françaises. Affiche les horaires et hauteurs de marée dans une interface épurée.",
    image: "/static/projects/tide.png",
    internal: "/projects/tide",
    href: "https://api.cybai.re/data/tide",
    github: "https://github.com/cletqui/tide",
  },
  {
    id: "apero",
    name: "Apéro",
    icon: "beer",
    description:
      "The only security tool that truly matters: is it apéro time? Time-zone-aware, serverless, and critical infrastructure.",
    descriptionFr:
      "Le seul outil de sécurité qui compte vraiment : est-ce l'heure de l'apéro ? Conscient des fuseaux horaires, sans serveur, et infrastructure critique.",
    image: "/static/projects/apéro.png",
    internal: "/projects/apero",
    href: "https://apero.cybai.re/",
    github: "https://github.com/cletqui/apero",
  },
  {
    id: "epochalypse",
    name: "Epochalypse",
    icon: "clock",
    description:
      "A countdown to the Unix Year 2038 problem — when 32-bit signed integers overflow and time itself breaks.",
    descriptionFr:
      "Un compte à rebours jusqu'au problème de l'an 2038 Unix — quand les entiers signés 32 bits débordent et que le temps lui-même se brise.",
    image: "/static/projects/epochalypse.png",
    internal: "/projects/epochalypse",
    href: "/projects/epochalypse",
  },
];

/* APP */
const app = new Hono<{}>();

/* COMPONENTS */
const ProjectCard = ({
  lang,
  name,
  icon,
  description,
  descriptionFr,
  image,
  internal,
  href,
  github,
}: {
  lang: string;
  name: string;
  icon: string;
  description?: string;
  descriptionFr?: string;
  image?: string;
  internal?: string;
  href?: string;
  github?: string;
}) => (
  <div class="card flex flex-col gap-3">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <Icon name={icon} size={18} class="text-muted-foreground" />
        <h3 class="font-semibold">{name}</h3>
      </div>
      <p class="text-sm text-muted-foreground">
        {lang === "fr" && descriptionFr ? descriptionFr : description}
      </p>
    </div>

    {image && (
      <div class="overflow-hidden rounded-md border border-border">
        <img src={image} alt={name} class="w-full object-cover" />
      </div>
    )}

    <div class="flex flex-wrap gap-2 pt-1">
      {internal && (
        <Button
          text={lang === "fr" ? "Détails" : "Details"}
          href={internal}
          icon="eye"
          style="secondary"
        />
      )}
      {github && (
        <Button
          text="GitHub"
          href={github}
          icon="github"
          style="secondary"
          external
        />
      )}
      {href && (
        <Button
          text={lang === "fr" ? "Ouvrir" : "Open"}
          href={href}
          icon="external-link"
          style="primary"
          external
        />
      )}
    </div>
  </div>
);

const ProjectDetail = ({
  lang,
  name,
  icon,
  description,
  descriptionFr,
  image,
  href,
  github,
}: {
  lang: string;
  name: string;
  icon: string;
  description?: string;
  descriptionFr?: string;
  image?: string;
  href?: string;
  github?: string;
}) => (
  <div class="mx-auto max-w-3xl px-4 py-12 flex flex-col items-center">
    <Title>{name}</Title>
    <div class="w-full max-w-xl">
      <ProjectCard
        lang={lang}
        name={name}
        icon={icon}
        description={description}
        descriptionFr={descriptionFr}
        image={image}
        href={href}
        github={github}
      />
    </div>
  </div>
);

/* ENDPOINTS */
app.get("/petithub", (c: Context) => {
  const { lang } = c.var;
  const p = projects.find((p) => p.id === "petithub")!;
  return c.render(<ProjectDetail lang={lang} {...p} />);
});

app.get("/portfolio", (c: Context) => {
  const { lang } = c.var;
  const p = projects.find((p) => p.id === "portfolio")!;
  return c.render(<ProjectDetail lang={lang} {...p} />);
});

app.get("/api", (c: Context) => {
  const { lang } = c.var;
  const p = projects.find((p) => p.id === "api")!;
  return c.render(<ProjectDetail lang={lang} {...p} />);
});

app.get("/app", (c: Context) => {
  const { lang } = c.var;
  const p = projects.find((p) => p.id === "app")!;
  return c.render(<ProjectDetail lang={lang} {...p} />);
});

app.get("/mail", (c: Context) => {
  const { lang } = c.var;
  const p = projects.find((p) => p.id === "mail")!;
  return c.render(<ProjectDetail lang={lang} {...p} />);
});

app.get("/tide", (c: Context) => {
  const { lang } = c.var;
  const p = projects.find((p) => p.id === "tide")!;
  return c.render(<ProjectDetail lang={lang} {...p} />);
});

app.get("/callot", (c: Context) => {
  const { lang } = c.var;
  const p = projects.find((p) => p.id === "callot")!;
  return c.render(<ProjectDetail lang={lang} {...p} />);
});

app.get("/apero", (c: Context) => {
  const { lang } = c.var;
  const p = projects.find((p) => p.id === "apero")!;
  return c.render(<ProjectDetail lang={lang} {...p} />);
});

app.get("/epochalypse", (c: Context) => {
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
  );
});

app.get("", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="mx-auto max-w-5xl px-4 py-12">
      <div class="flex flex-col items-center mb-8">
        <Title>{lang === "fr" ? "Projets" : "Projects"}</Title>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(
          ({ name, icon, description, descriptionFr, image, internal, href, github }) => (
            <ProjectCard
              lang={lang}
              name={name}
              icon={icon}
              description={description}
              descriptionFr={descriptionFr}
              image={image}
              internal={internal}
              href={href}
              github={github}
            />
          ),
        )}
      </div>
    </div>,
  );
});

export default app;
