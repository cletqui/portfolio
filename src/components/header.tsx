import { useRequestContext } from "hono/jsx-renderer";
import { toggleLanguage } from "../utils/language";

const Logo = () => (
  <a class="uk-navbar-item uk-logo" href="/" aria-label="Back to Home">
    🕳️
  </a>
);

const AboutMe = () => {
  const c = useRequestContext();
  const { lang } = c.var;
  return <a href="/about/me">{lang === "fr" ? "A propos" : "About me"}</a>;
};

const AboutYou = () => {
  const c = useRequestContext();
  const { lang } = c.var;
  return <a href="/about/you">{lang === "fr" ? "de toi ?" : "About you"}</a>;
};

const Project = ({
  name,
  githubLink,
  externalLink,
}: {
  name: string;
  githubLink: string;
  externalLink: string;
}) => {
  return (
    <div class="uk-flex uk-flex-middle uk-margin-left">
      <a href={`/projects/${name.toLowerCase()}`}>
        {name}
        <a
          class="uk-icon-button uk-icon-button-small uk-margin-small-left"
          href={githubLink}
        >
          <uk-icon icon="github" />
        </a>
        <a
          class="uk-icon-button uk-icon-button-small uk-margin-small-right"
          href={externalLink}
        >
          <uk-icon icon="external-link" />
        </a>
      </a>
    </div>
  );
};

const Projects = () => {
  const c = useRequestContext();
  const { lang } = c.var;
  return (
    <>
      <a href="/projects">
        <div>{lang === "fr" ? "Projets" : "Projects"}</div>
      </a>

      <div class="uk-navbar-dropdown">
        <ul class="uk-nav uk-navbar-dropdown-nav">
          <li>
            <Project
              name="PetitHub"
              githubLink="https://github.com/cletqui/petithub/"
              externalLink="https://petithub.cybai.re/"
            />
          </li>

          <Project
            name="API"
            githubLink="https://github.com/cletqui/api/"
            externalLink="https://api.cybai.re/"
          />

          <li>
            <Project
              name="Tide"
              githubLink="https://github.com/cletqui/tide/"
              externalLink="https://tide.cybai.re/"
            />
          </li>

          <li>
            <Project
              name="Apéro"
              githubLink="https://github.com/cletqui/apero/"
              externalLink="https://apero.cybai.re/"
            />
          </li>

          <li>
            <Project
              name="Mail"
              githubLink="https://github.com/cletqui/mail/"
              externalLink="https://mail.cybai.re/"
            />
          </li>
        </ul>
      </div>
    </>
  );
};

const Contact = () => {
  const c = useRequestContext();
  const { lang } = c.var;
  return (
    <>
      <a href="/contact">
        <div>Contact</div>
      </a>

      <div class="uk-navbar-dropdown">
        <ul class="uk-nav uk-navbar-dropdown-nav">
          <li>
            <a
              href="https://x.com/cletqui"
              target="_blank"
              rel="noopener noreferrer"
            >
              <uk-icon class="uk-padding-small-right" icon="twitter" />
              Twitter
            </a>
          </li>

          <li>
            <a
              href="https://github.com/cletqui"
              target="_blank"
              rel="noopener noreferrer"
            >
              <uk-icon class="uk-padding-small-right" icon="github" />
              GitHub
            </a>
          </li>

          <li>
            <a
              href="https://gitlab.com/cletqui"
              target="_blank"
              rel="noopener noreferrer"
            >
              <uk-icon class="uk-padding-small-right" icon="gitlab" />
              GitLab
            </a>
          </li>

          <li>
            <a
              href="mailto:admin@cybai.re"
              target="_blank"
              rel="noopener noreferrer"
            >
              <uk-icon class="uk-padding-small-right" icon="mail" />
              Mail
            </a>
          </li>

          <li>
            <a
              href="https://www.openstreetmap.org/#map=19/48.673657/-3.913592"
              target="_blank"
              rel="noopener noreferrer"
            >
              <uk-icon class="uk-padding-small-right" icon="map-pin" />
              {lang === "fr" ? "Carte" : "Map"}
            </a>
          </li>

          <li>
            <a
              uk-tooltip={
                lang === "fr" ? "PM moi si intéressé !" : "DM me if interested!"
              }
            >
              <button
                disabled
                class="uk-icon-button uk-icon-button-xsmall w-40"
              >
                <uk-icon disabled icon="linkedin" />
              </button>
              <p class="uk-text-muted">LinkedIn</p>
            </a>
          </li>
        </ul>
      </div>
    </>
  );
};

const Search = () => {
  const c = useRequestContext();
  const { lang } = c.var;
  return (
    <>
      <button
        class="uk-icon-button uk-icon-button-small uk-icon-button-outline"
        uk-toggle="target: #search"
      >
        <a class="uk-search-toggle" href="#" uk-search-icon />
      </button>

      <uk-command toggle="search" uk-cloak>
        <a href="/">
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="home"
          />
          <span>{lang === "fr" ? "Accueil" : "Home"}</span>
        </a>

        <a href="/about" data-group={lang === "fr" ? "A propos" : "About"}>
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="user-round"
          />
          <span>{lang === "fr" ? "A propos" : "About me"}</span>
        </a>

        <a href="#" data-group={lang === "fr" ? "A propos" : "About"}>
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="user-round-search"
          />
          <span>{lang === "fr" ? "de toi ?" : "About you"}</span>
        </a>

        <a
          href="/projects/petithub"
          data-group={lang === "fr" ? "Projets" : "Projects"}
        >
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="github"
          />
          <span>PetitHub</span>
        </a>

        <a
          href="/projects/api"
          data-group={lang === "fr" ? "Projets" : "Projects"}
        >
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="webhook"
          />
          <span>API</span>
        </a>

        <a
          href="/projects/tide"
          data-group={lang === "fr" ? "Projets" : "Projects"}
        >
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="waves"
          />
          <span>Tide</span>
        </a>

        <a
          href="/projects/apero"
          data-group={lang === "fr" ? "Projets" : "Projects"}
        >
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="beer"
          />
          <span>Apéro</span>
        </a>

        <a
          href="/projects/mail"
          data-group={lang === "fr" ? "Projets" : "Projects"}
        >
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="mail"
          />
          <span>Mail</span>
        </a>

        <a href="https://x.com/cletqui" data-group="Contact">
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="twitter"
          />
          <span>Twitter</span>
        </a>

        <a href="https://github.com/cletqui" data-group="Contact">
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="github"
          />
          <span>GitHub</span>
        </a>

        <a href="https://gitlab.com/cletqui" data-group="Contact">
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="gitlab"
          />
          <span>GitLab</span>
        </a>

        <a href="mailto:admin@cybai.re" data-group="Contact">
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="mail"
          />
          <span>Mail</span>
        </a>

        <a
          href="https://www.openstreetmap.org/#map=19/48.673657/-3.913592"
          data-group="Contact"
        >
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="map-pin"
          />
          <span>{lang === "fr" ? "Carte" : "Map"}</span>
        </a>
      </uk-command>
    </>
  );
};

const Palette = () => {
  const c = useRequestContext();
  const { lang } = c.var;
  return (
    <div class="uk-inline">
      <button class="uk-icon-button uk-icon-button-small uk-icon-button-outline">
        <uk-icon icon="palette" uk-cloak />
      </button>
      <div
        class="uk-card uk-card-body uk-card-default uk-drop uk-width-large"
        uk-drop="mode: click; offset: 8; pos: bottom-center"
      >
        <div class="uk-card-title uk-margin-medium-bottom">
          {lang === "fr" ? "Personnalise" : "Customize"}
        </div>
        <uk-theme-switcher />
      </div>
    </div>
  );
};
const Translate = () => {
  const c = useRequestContext();
  return (
    <a
      href={`${c.req.path === "/" ? "" : c.req.path}/${toggleLanguage(
        c.var.lang
      )}`}
      class="uk-icon-button uk-icon-button-small uk-icon-button-outline"
    >
      <uk-icon icon="languages" />
    </a>
  );
};
const Navbar = () => {
  const c = useRequestContext();
  const { path } = c.req;
  return (
    <div uk-navbar>
      <div class="uk-navbar-left">
        <Logo />

        <ul
          id="navbar"
          class="uk-navbar-nav uk-flex-left uk-dropnav navbar-toggle"
        >
          <li class={path.startsWith("/about/me") ? "uk-active" : ""}>
            <AboutMe />
          </li>

          <li class={path.startsWith("/about/you") ? "uk-active" : ""}>
            <AboutYou />
          </li>

          <li class={path.startsWith("/projects") ? "uk-active" : ""}>
            <Projects />
          </li>

          <li class={path.startsWith("/contact") ? "uk-active" : ""}>
            <Contact />
          </li>
        </ul>
      </div>

      <div class="uk-navbar-right">
        <ul class="uk-iconnav uk-flex-right uk-iconnav-small navbar-toggle uk-margin-medium-left">
          <li>
            <Search />
          </li>

          <li>
            <Palette />
          </li>

          <li>
            <Translate />
          </li>
        </ul>
      </div>
    </div>
  );
};

export const Header = () => {
  return (
    <div uk-sticky="sel-target: .uk-navbar-container; cls-active: uk-navbar-sticky">
      <nav class="uk-navbar-container">
        <div class="uk-container">
          <Navbar />
        </div>
      </nav>
    </div>
  );
};
