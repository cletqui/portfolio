import { Context, Hono } from "hono";
import { Button, Epochalypse, Title } from "../components/layout";
import { Icon } from "../utils/icons";

interface Project {
  id: string;
  name: string;
  icon: string;
  description?: string;
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
    image: "/static/projects/petithub.png",
    internal: "/projects/petithub",
    href: "https://petithub.cybai.re/",
    github: "https://github.com/cletqui/petithub",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    icon: "book-user",
    image: "/static/projects/portfolio.png",
    internal: "/projects/portfolio",
    href: "https://www.cybai.re/",
    github: "https://github.com/cletqui/portfolio",
  },
  {
    id: "api",
    name: "API",
    icon: "code-xml",
    image: "/static/projects/api.png",
    internal: "/projects/api",
    href: "https://api.cybai.re/",
    github: "https://github.com/cletqui/api",
  },
  {
    id: "mail",
    name: "Mail",
    icon: "mail",
    image: "/static/projects/mail.png",
    internal: "/projects/mail",
    href: "https://mail.cybai.re/",
    github: "https://github.com/cletqui/mail",
  },
  {
    id: "tide",
    name: "Tide",
    icon: "waves",
    image: "/static/projects/tide.png",
    internal: "/projects/tide",
    href: "https://api.cybai.re/",
    github: "https://github.com/cletqui/api",
  },
  {
    id: "apero",
    name: "Apéro",
    icon: "beer",
    image: "/static/projects/apéro.png",
    internal: "/projects/apero",
    href: "https://apero.cybai.re/",
    github: "https://github.com/cletqui/apero",
  },
  {
    id: "epochalypse",
    name: "Epochalypse",
    icon: "clock",
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
  image,
  internal,
  href,
  github,
}: {
  lang: string;
  name: string;
  icon: string;
  description?: string;
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
        {description || "Lorem Ipsum"}
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
  image,
  href,
  github,
}: {
  lang: string;
  name: string;
  icon: string;
  description?: string;
  image?: string;
  internal?: string;
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
        {projects.map(({ name, icon, image, internal, href, github }) => (
          <ProjectCard
            lang={lang}
            name={name}
            icon={icon}
            image={image}
            internal={internal}
            href={href}
            github={github}
          />
        ))}
      </div>
    </div>,
  );
});

export default app;
