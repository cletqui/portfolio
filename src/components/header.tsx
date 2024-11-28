import { toggleLanguage } from "../utils/language";

const Logo = ({ lang }: { lang: string }) => (
  <a
    class="uk-navbar-item uk-logo"
    href="/"
    aria-label={lang === "fr" ? "Retour à l'accueil" : "Back to Home"}
  >
    🕳️
  </a>
);

const AboutMe = ({ lang }: { lang: string }) => {
  return <a href="/about/me">{lang === "fr" ? "A propos" : "About me"}</a>;
};

const AboutYou = ({ lang }: { lang: string }) => {
  return <a href="/about/you">{lang === "fr" ? "de toi ?" : "About you"}</a>;
};

const Dropdown = ({
  icon,
  text,
  href,
  tooltip,
}: {
  icon: string;
  text: string;
  href?: string;
  tooltip?: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    uk-tooltip={tooltip && `pos:bottom;title:${tooltip}`}
  >
    <button disabled={!href} class="uk-icon-button uk-icon-button-xsmall w-40">
      <uk-icon disablied={!href} class="uk-padding-small-right" icon={icon} />
    </button>
    <p class={`uk-text${!href && "-muted"}`}>{text}</p>
  </a>
);

const Projects = ({ lang }: { lang: string }) => {
  return (
    <>
      <a href="/projects">
        <div>{lang === "fr" ? "Projets" : "Projects"}</div>
      </a>

      <div class="uk-navbar-dropdown">
        <ul class="uk-nav uk-navbar-dropdown-nav">
          <li>
            <Dropdown icon="github" text="PetitHub" href="/projects/petithub" />
          </li>

          <li>
            <Dropdown icon="code-xml" text="API" href="/projects/api" />
          </li>

          <li>
            <Dropdown icon="waves" text="Tide" href="/projects/tide" />
          </li>

          <li>
            <Dropdown icon="beer" text="Apéro" href="/projects/apero" />
          </li>

          <li>
            <Dropdown icon="mail" text="Mail" href="/projects/mail" />
          </li>

          <li>
            <Dropdown
              icon="clock"
              text="Epochalypse"
              href="/projects/epochalypse"
            />
          </li>
        </ul>
      </div>
    </>
  );
};

const Contact = ({ lang }: { lang: string }) => {
  return (
    <>
      <a href="/contact">
        <div>Contact</div>
      </a>

      <div class="uk-navbar-dropdown">
        <ul class="uk-nav uk-navbar-dropdown-nav">
          <li>
            <Dropdown
              text="Twitter"
              href="https://x.com/cletqui"
              icon="twitter"
            />
          </li>

          <li>
            <Dropdown
              text="BlueSky"
              href="https://bsky.app/profile/cybai.re"
              icon="earth"
            />
          </li>

          <li>
            <Dropdown
              text="GitHub"
              href="https://github.com/cletqui"
              icon="github"
            />
          </li>

          <li>
            <Dropdown
              text="GitLab"
              href="https://gitlab.com/cletqui"
              icon="gitlab"
            />
          </li>

          <li>
            <Dropdown
              text="Keybase"
              href="https://keybase.io/clet"
              icon="file-key"
            />
          </li>

          <li>
            <Dropdown text="Mail" href="mailto:admin@cybai.re" icon="mail" />
          </li>

          <li>
            <Dropdown
              text={lang === "fr" ? "Carte" : "Map"}
              href="https://www.openstreetmap.org/#map=19/48.673657/-3.913592"
              icon="map-pin"
            />
          </li>

          <li>
            <Dropdown
              icon="linkedin"
              text="LinkedIn"
              tooltip={
                lang === "fr" ? "PM moi si intéressé !" : "DM me if interested!"
              }
            />
          </li>
        </ul>
      </div>
    </>
  );
};

const Search = ({ lang }: { lang: string }) => {
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

        <a href="https://bsky.app/profile/cybai.re" data-group="Contact">
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="earth"
          />
          <span>BlueSky</span>
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

        <a href="https://keybase.io/clet" data-group="Contact">
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="file-key"
          />
          <span>Keybase</span>
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

const Palette = ({ lang }: { lang: string }) => {
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

const Translate = ({ lang, path }: { lang: string; path: string }) => {
  return (
    <a
      href={`${path === "/" ? "" : path}/${toggleLanguage(lang)}`}
      class="uk-icon-button uk-icon-button-small uk-icon-button-outline"
      uk-tooltip={`title: ${
        lang === "fr" ? "Traduire en anglais" : "Translate to French"
      }; pos: bottom`}
    >
      <uk-icon icon="languages" />
    </a>
  );
};

const Navbar = ({ lang, path }: { lang: string; path: string }) => {
  return (
    <div uk-navbar>
      <div class="uk-navbar-left">
        <Logo lang={lang} />

        <ul
          id="navbar"
          class="uk-navbar-nav uk-flex-left uk-dropnav navbar-toggle"
        >
          <li class={path.startsWith("/about/me") ? "uk-active" : ""}>
            <AboutMe lang={lang} />
          </li>

          <li class={path.startsWith("/about/you") ? "uk-active" : ""}>
            <AboutYou lang={lang} />
          </li>

          <li class={path.startsWith("/projects") ? "uk-active" : ""}>
            <Projects lang={lang} />
          </li>

          <li class={path.startsWith("/contact") ? "uk-active" : ""}>
            <Contact lang={lang} />
          </li>
        </ul>
      </div>

      <div class="uk-navbar-right">
        <ul class="uk-iconnav uk-flex-right uk-iconnav-small navbar-toggle uk-margin-medium-left">
          <li>
            <Search lang={lang} />
          </li>

          <li>
            <Palette lang={lang} />
          </li>

          <li>
            <Translate lang={lang} path={path} />
          </li>
        </ul>
      </div>
    </div>
  );
};

export const Header = ({ lang, path }: { lang: string; path: string }) => {
  return (
    <div uk-sticky="sel-target: .uk-navbar-container; cls-active: uk-navbar-sticky">
      <nav class="uk-navbar-container">
        <div class="uk-container">
          <Navbar lang={lang} path={path} />
        </div>
      </nav>
    </div>
  );
};
