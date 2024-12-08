import { toggleLanguage } from "../utils/language";

import { projects } from "../pages/projects";
import { contacts } from "../pages/contact";

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
  internal = false,
}: {
  icon: string;
  text: string;
  href?: string;
  tooltip?: string;
  internal?: boolean;
}) => (
  <a
    href={href}
    target={internal ? "_self" : "_blank"}
    rel={internal ? "" : "noopener noreferrer"}
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

      <div class="uk-navbar-dropdown" uk-drop="delay-show: 420">
        <ul class="uk-nav uk-navbar-dropdown-nav">
          {projects.map(({ name, icon, internal }) => (
            <li>
              <Dropdown
                icon={icon}
                text={name}
                href={internal}
                internal={true}
              />
            </li>
          ))}
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

      <div class="uk-navbar-dropdown" uk-drop="delay-show: 500">
        <ul class="uk-nav uk-navbar-dropdown-nav">
          {contacts.map(({ name, icon, href, tooltip }) => (
            <li>
              <Dropdown text={name} href={href} icon={icon} tooltip={tooltip} />
            </li>
          ))}
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

        <a href="/about/me" data-group={lang === "fr" ? "A propos" : "About"}>
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="user-round"
          />
          <span>{lang === "fr" ? "A propos" : "About me"}</span>
        </a>

        <a href="/about/you" data-group={lang === "fr" ? "A propos" : "About"}>
          <uk-icon
            class="uk-padding-small-right"
            custom-class="mr-2"
            icon="user-round-search"
          />
          <span>{lang === "fr" ? "de toi ?" : "About you"}</span>
        </a>

        {projects.map(({ name, icon, internal }) => (
          <a
            href={internal}
            data-group={lang === "fr" ? "Projets" : "Projects"}
          >
            <uk-icon
              class="uk-padding-small-right"
              custom-class="mr-2"
              icon={icon}
            />
            <span>{name}</span>
          </a>
        ))}

        {contacts.map(({ name, icon, href }) => (
          <a href={href} data-group="Contact">
            <uk-icon
              class="uk-padding-small-right"
              custom-class="mr-2"
              icon={icon}
            />
            <span>{name}</span>
          </a>
        ))}
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
