import { Context, Hono } from "hono";
import { Button, Epochalypse, Title } from "../components/layout";

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
const Thumbnail = ({
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
  <div>
    <div class="uk-card">
      <div class="uk-card-header">
        <div class="uk-flex">
          <uk-icon icon={icon} class="uk-margin-right" height="25" width="25" />
          <h3 class="uk-h3 uk-card-title">{name}</h3>
        </div>
        <p class="uk-margin-xsmall-top uk-text-small text-muted-foreground">
          {description || "Lorem Ipsum"}
        </p>
      </div>

      <div class="uk-card-body">
        {image && (
          <div class="uk-flex uk-overflow-hide">
            <img
              class="uk-margin-right uk-border-rounded"
              src={image}
              alt="Border rounded"
            />
          </div>
        )}
      </div>

      <div class="uk-card-footer uk-flex uk-flex-between uk-flex-middle uk-flex-row@m uk-flex-column">
        {internal && (
          <Button
            text={lang === "fr" ? "Détails" : "Details"}
            href={internal}
            icon="eye"
            style="secondary"
          />
        )}
        {github && (
          <Button text="GitHub" href={github} icon="github" style="primary" />
        )}
        {href && (
          <Button
            text={lang === "fr" ? "Ouvrir" : "Open"}
            href={href}
            icon="external-link"
            style="primary"
          />
        )}
      </div>
    </div>
  </div>
);

const Project = ({
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
  <div class="uk-flex uk-flex-column uk-flex-middle">
    <Title>{name}</Title>
    <div
      class="uk-child-width-expand@s uk-width-2-3@m uk-child-width-1-1"
      uk-grid
    >
      <Thumbnail
        lang={lang}
        name={name}
        description={description}
        icon={icon}
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
  const petithub = projects.find((project) => project.id === "petithub");
  return c.render(<Project lang={lang} {...petithub} />);
});

app.get("/portfolio", (c: Context) => {
  const { lang } = c.var;
  const portfolio = projects.find((project) => project.id === "portfolio");
  return c.render(<Project lang={lang} {...portfolio} />);
})

app.get("/api", (c: Context) => {
  const { lang } = c.var;
  const api = projects.find((project) => project.id === "api");
  return c.render(<Project lang={lang} {...api} />);
});

app.get("/mail", (c: Context) => {
  const { lang } = c.var;
  const mail = projects.find((project) => project.id === "mail");
  return c.render(<Project lang={lang} {...mail} />);
});

app.get("/tide", (c: Context) => {
  const { lang } = c.var;
  const tide = projects.find((project) => project.id === "tide");
  return c.render(<Project lang={lang} {...tide} />);
});

app.get("/apero", (c: Context) => {
  const { lang } = c.var;
  const apero = projects.find((project) => project.id === "apero");
  return c.render(<Project lang={lang} {...apero} />);
});

app.get("/epochalypse", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle">
      <Title>{"Epochalypse"}</Title>

      <div class="uk-padding-large-top uk-padding-large-bottom">
        <Epochalypse lang={lang} />
      </div>

      <div class="uk-padding">
        <Button
          text={lang === "fr" ? "Explication" : "Explanation"}
          icon="book-a"
          href="https://en.wikipedia.org/wiki/Year_2038_problem"
        />
      </div>
      <div class="uk-padding">
        <Button
          text={lang === "fr" ? "Visualisation" : "Visualisation"}
          icon="arrow-up-1-0"
          href="https://www.epochalypse.today/"
        />
      </div>
    </div>
  );
});

app.get("", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle">
      <Title>{lang === "fr" ? "Projets" : "Projects"}</Title>

      <div
        class="uk-child-width-expand@s uk-width-3-4@l uk-child-width-1-2@s uk-flex-middle uk-grid-small"
        uk-grid
      >
        {projects.map(({ name, icon, image, internal, href, github }) => (
          <Thumbnail
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
    </div>
  );
});

export default app;
