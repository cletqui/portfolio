const Logo = () => (
  <a class="uk-navbar-item uk-logo" href="/" aria-label="Back to Home">
    🕳️
  </a>
);

const AboutMe = () => <a href="/about/me">About me</a>;

const AboutYou = () => <a href="/about/you">About you</a>;

const Project = ({
  name,
  githubLink,
  externalLink,
}: {
  name: string;
  githubLink: string;
  externalLink: string;
}) => (
  <div class="uk-flex uk-flex-middle uk-margin-left">
    <a href="/projects/mail">
      {name}
      <a
        class="uk-icon-button uk-icon-button-small uk-margin-small-left"
        href={githubLink}
      >
        <uk-icon icon="github"></uk-icon>
      </a>
      <a
        class="uk-icon-button uk-icon-button-small uk-margin-small-right"
        href={externalLink}
      >
        <uk-icon icon="external-link"></uk-icon>
      </a>
    </a>
  </div>
);

const Projects = () => (
  <>
    <a href="/projects">
      <div>Projects</div>
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

const Contact = () => (
  <>
    <a>
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
            <uk-icon class="uk-padding-small-right" icon="twitter"></uk-icon>
            Twitter
          </a>
        </li>

        <li>
          <a
            href="https://github.com/cletqui"
            target="_blank"
            rel="noopener noreferrer"
          >
            <uk-icon class="uk-padding-small-right" icon="github"></uk-icon>
            GitHub
          </a>
        </li>

        <li>
          <a
            href="https://gitlab.com/cletqui"
            target="_blank"
            rel="noopener noreferrer"
          >
            <uk-icon class="uk-padding-small-right" icon="gitlab"></uk-icon>
            GitLab
          </a>
        </li>

        <li>
          <a
            href="mailto:admin@cybai.re"
            target="_blank"
            rel="noopener noreferrer"
          >
            <uk-icon class="uk-padding-small-right" icon="mail"></uk-icon>
            Mail
          </a>
        </li>

        <li>
          <a
            href="https://www.openstreetmap.org/#map=19/48.673657/-3.913592"
            target="_blank"
            rel="noopener noreferrer"
          >
            <uk-icon class="uk-padding-small-right" icon="map-pin"></uk-icon>
            Map
          </a>
        </li>

        <li>
          <a uk-tooltip="E-mail me if you're interested!">
            <button disabled class="uk-icon-button uk-icon-button-xsmall w-40">
              <uk-icon disabled icon="linkedin"></uk-icon>
            </button>
            <p class="uk-text-muted">LinkedIn</p>
          </a>
        </li>
      </ul>
    </div>
  </>
);

const Search = () => (
  <>
    <button
      class="uk-icon-button uk-icon-button-small uk-icon-button-outline"
      uk-toggle="target: #search"
    >
      <a class="uk-search-toggle" href="#" uk-search-icon></a>
    </button>
    <uk-command toggle="search" uk-cloak>
      <a href="/">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="home"
        ></uk-icon>
        <span>Home</span>
      </a>

      <a href="/about" data-group="About">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="user-round"
        ></uk-icon>
        <span>About me</span>
      </a>

      <a href="#" data-group="About">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="user-round-search"
        ></uk-icon>
        <span>About you</span>
      </a>

      <a href="/projects/petithub" data-group="Projects">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="github"
        ></uk-icon>
        <span>PetitHub</span>
      </a>

      <a href="/projects/api" data-group="Projects">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="webhook"
        ></uk-icon>
        <span>API</span>
      </a>

      <a href="/projects/tide" data-group="Projects">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="waves"
        ></uk-icon>
        <span>Tide</span>
      </a>

      <a href="/projects/apero" data-group="Projects">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="beer"
        ></uk-icon>
        <span>Apéro</span>
      </a>

      <a href="/projects/mail" data-group="Projects">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="mail"
        ></uk-icon>
        <span>Mail</span>
      </a>

      <a href="https://x.com/cletqui" data-group="Contact">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="twitter"
        ></uk-icon>
        <span>Twitter</span>
      </a>

      <a href="https://github.com/cletqui" data-group="Contact">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="github"
        ></uk-icon>
        <span>GitHub</span>
      </a>

      <a href="https://gitlab.com/cletqui" data-group="Contact">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="gitlab"
        ></uk-icon>
        <span>GitLab</span>
      </a>

      <a href="mailto:admin@cybai.re" data-group="Contact">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="mail"
        ></uk-icon>
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
        ></uk-icon>
        <span>Map</span>
      </a>
    </uk-command>
  </>
);

const Palette = () => (
  <div class="uk-inline">
    <button class="uk-icon-button uk-icon-button-small uk-icon-button-outline">
      <uk-icon icon="palette" uk-cloak></uk-icon>
    </button>
    <div
      class="uk-card uk-card-body uk-card-default uk-drop uk-width-large"
      uk-drop="mode: click; offset: 8; pos: bottom-center"
    >
      <div class="uk-card-title uk-margin-medium-bottom">Customize</div>
      <uk-theme-switcher></uk-theme-switcher>
    </div>
  </div>
);

const Translate = () => (
  <button class="uk-icon-button uk-icon-button-small uk-icon-button-outline">
    <uk-icon icon="languages"></uk-icon>
  </button>
);

const Navbar = () => (
  <div uk-navbar id="navbar" class="uk-visible@m">
    <div class="uk-navbar-left">
      <Logo />

      <ul class="uk-navbar-nav uk-flex-middle uk-dropnav">
        <li>
          <AboutMe />
        </li>

        <li>
          <AboutYou />
        </li>

        <li>
          <Projects />
        </li>

        <li>
          <Contact />
        </li>
      </ul>
    </div>

    <div class="uk-navbar-right">
      <ul class="uk-iconnav uk-flex-middle uk-iconnav-small">
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

export const Header = () => (
  <div uk-sticky="sel-target: .uk-navbar-container; cls-active: uk-navbar-sticky">
    <nav class="uk-navbar-container">
      <div class="uk-container">
        <button
          class="uk-navbar-toggle-animate uk-navbar-toggle uk-hidden@m"
          uk-navbar-toggle-icon
          uk-toggle="target: #navbar; animation: uk-animation-fade"
        />
        <Navbar />
      </div>
    </nav>
  </div>
);
