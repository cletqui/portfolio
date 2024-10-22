const Logo = () => (
  <a class="uk-navbar-item uk-logo" href="/" aria-label="Back to Home">
    🕳️
  </a>
);

const Project = () => (
  <>
    <a href="/projects">
      <div>Project</div>
    </a>
    <div class="uk-navbar-dropdown">
      <ul class="uk-nav uk-navbar-dropdown-nav">
        <li>
          <div class="uk-flex uk-flex-middle uk-margin-left">
            <a href="/projects/mail">
              PetitHub
              <a
                class="uk-icon-button uk-margin-small-left"
                href="https://github.com/cletqui/petithub/"
              >
                <uk-icon icon="github"></uk-icon>
              </a>
              <a
                class="uk-icon-button uk-margin-small-right"
                href="https://petithub.cybai.re/"
              >
                <uk-icon icon="external-link"></uk-icon>
              </a>
            </a>
          </div>
        </li>

        <li>
          <div class="uk-flex uk-flex-middle uk-margin-left">
            <a href="/projects/tide">
              Tide
              <a
                class="uk-icon-button uk-margin-small-left"
                href="https://github.com/cletqui/tide/"
              >
                <uk-icon icon="github"></uk-icon>
              </a>
              <a
                class="uk-icon-button uk-margin-small-right"
                href="https://tide.cybai.re/"
              >
                <uk-icon icon="external-link"></uk-icon>
              </a>
            </a>
          </div>
        </li>

        <li>
          <div class="uk-flex uk-flex-middle uk-margin-left">
            <a href="/projects/apero">
              Apéro
              <a
                class="uk-icon-button uk-margin-small-left"
                href="https://github.com/cletqui/apero/"
              >
                <uk-icon icon="github"></uk-icon>
              </a>
              <a
                class="uk-icon-button uk-margin-small-right"
                href="https://apero.cybai.re/"
              >
                <uk-icon icon="external-link"></uk-icon>
              </a>
            </a>
          </div>
        </li>

        <li>
          <div class="uk-flex uk-flex-middle uk-margin-left">
            <a href="/projects/mail">
              Mail
              <a
                class="uk-icon-button uk-margin-small-left"
                href="https://github.com/cletqui/mail/"
              >
                <uk-icon icon="github"></uk-icon>
              </a>
              <a
                class="uk-icon-button uk-margin-small-right"
                href="https://mail.cybai.re/"
              >
                <uk-icon icon="external-link"></uk-icon>
              </a>
            </a>
          </div>
        </li>
      </ul>
    </div>
  </>
);

const AboutMe = () => <a href="/about">About me</a>;

const Contact = () => (
  <ul class="uk-iconnav">
    <li>
      <a href="https://x.com/cletqui" target="_blank" rel="noopener noreferrer">
        <uk-icon icon="twitter"></uk-icon>
      </a>
    </li>
    <li>
      <a
        href="https://github.com/cletqui"
        target="_blank"
        rel="noopener noreferrer"
      >
        <uk-icon icon="github"></uk-icon>
      </a>
    </li>
    <li>
      <a
        href="https://gitlab.com/cletqui"
        target="_blank"
        rel="noopener noreferrer"
      >
        <uk-icon icon="gitlab"></uk-icon>
      </a>
    </li>
  </ul>
);

const SearchBar = () => (
  <div class="uk-margin">
    <form class="uk-search uk-search-default">
      <input
        class="uk-search-input"
        type="search"
        placeholder="Search"
        aria-label="Search"
      />
      <span class="uk-search-icon-flip" uk-search-icon></span>
    </form>
  </div>
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

export const Navbar = () => (
  <div uk-sticky="sel-target: .uk-navbar-container; cls-active: uk-navbar-sticky">
    <nav class="uk-navbar-container ">
      <div class="uk-container ">
        <div uk-navbar>
          <div class="uk-navbar-left ">
            <Logo />

            <ul class="uk-navbar-nav uk-flex-middle">
              <li>
                <Project />
              </li>

              <li>
                <AboutMe />
              </li>

              <li>
                <Contact />
              </li>
            </ul>
          </div>

          <div class="uk-navbar-right ">
            <ul class="uk-navbar-nav uk-flex-middle">
              <li>
                <SearchBar />
              </li>

              <li>
                <Palette />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  </div>
);
