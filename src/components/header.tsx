const Logo = () => (
  <a class="uk-navbar-item uk-logo" href="/" aria-label="Back to Home">
    🕳️
  </a>
);

const AboutMe = () => <a href="/about/me">about me</a>;

const AboutYou = () => <a href="/about/you">about you</a>;

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
      <div>projects</div>
    </a>
    <div class="uk-navbar-dropdown">
      <ul class="uk-nav uk-navbar-dropdown-nav">
        <li>
          <Project
            name="petithub"
            githubLink="https://github.com/cletqui/petithub/"
            externalLink="https://petithub.cybai.re/"
          />
        </li>

        <li>
          <Project
            name="tide"
            githubLink="https://github.com/cletqui/tide/"
            externalLink="https://tide.cybai.re/"
          />
        </li>

        <li>
          <Project
            name="apero"
            githubLink="https://github.com/cletqui/apero/"
            externalLink="https://apero.cybai.re/"
          />
        </li>

        <li>
          <Project
            name="mail"
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
    <a href="/projects">
      <div>contact</div>
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
            twitter
          </a>
        </li>

        <li>
          <a
            href="https://github.com/cletqui"
            target="_blank"
            rel="noopener noreferrer"
          >
            <uk-icon class="uk-padding-small-right" icon="github"></uk-icon>
            github
          </a>
        </li>

        <li>
          <a
            href="https://gitlab.com/cletqui"
            target="_blank"
            rel="noopener noreferrer"
          >
            <uk-icon class="uk-padding-small-right" icon="gitlab"></uk-icon>
            gitlab
          </a>
        </li>

        <li>
          <a
            href="mailto:admin@cybai.re"
            target="_blank"
            rel="noopener noreferrer"
          >
            <uk-icon class="uk-padding-small-right" icon="mail"></uk-icon>
            mail
          </a>
        </li>

        <li>
          <a
            href="https://www.openstreetmap.org/#map=19/48.673657/-3.913592"
            target="_blank"
            rel="noopener noreferrer"
          >
            <uk-icon class="uk-padding-small-right" icon="map-pin"></uk-icon>
            map
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
      <a href="/about">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="home"
        ></uk-icon>
        <span>home</span>
      </a>
      <a href="/about" data-group="about">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="user-round"
        ></uk-icon>
        <span>about me</span>
      </a>
      <a href="#" data-group="about">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="user-round-search"
        ></uk-icon>
        <span>about you</span>
      </a>
      <a href="/projects/petithub" data-group="projects">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="github"
        ></uk-icon>
        <span>petithub</span>
      </a>
      <a href="/projects/tide" data-group="projects">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="waves"
        ></uk-icon>
        <span>tide</span>
      </a>
      <a href="/projects/apero" data-group="projects">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="beer"
        ></uk-icon>
        <span>apero</span>
      </a>
      <a href="/projects/mail" data-group="projects">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="mail"
        ></uk-icon>
        <span>mail</span>
      </a>
      <a href="https://x.com/cletqui" data-group="projects">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="twitter"
        ></uk-icon>
        <span>twitter</span>
      </a>
      <a href="https://github.com/cletqui" data-group="contact">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="github"
        ></uk-icon>
        <span>github</span>
      </a>
      <a href="https://gitlab.com/cletqui" data-group="contact">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="gitlab"
        ></uk-icon>
        <span>gitlab</span>
      </a>
      <a href="mailto:admin@cybai.re" data-group="contact">
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="mail"
        ></uk-icon>
        <span>mail</span>
      </a>
      <a
        href="https://www.openstreetmap.org/#map=19/48.673657/-3.913592"
        data-group="contact"
      >
        <uk-icon
          class="uk-padding-small-right"
          custom-class="mr-2"
          icon="map-pin"
        ></uk-icon>
        <span>map</span>
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

export const Header = () => (
  <div uk-sticky="sel-target: .uk-navbar-container; cls-active: uk-navbar-sticky">
    <nav class="uk-navbar-container">
      <div class="uk-container">
        <div uk-navbar>
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

          <div class="uk-navbar-right ">
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
      </div>
    </nav>
  </div>
);
