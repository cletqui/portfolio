export const Navbar = () => (
  <div uk-sticky="sel-target: .uk-navbar-container; cls-active: uk-navbar-sticky">
    <nav class="uk-navbar-container">
      <div class="uk-container">
        <div uk-navbar>
          <div class="uk-navbar-left">
            <a
              class="uk-navbar-item uk-logo"
              href="/"
              aria-label="Back to Home"
            >
              Logo
            </a>

            <ul class="uk-navbar-nav">
              <li>
                <div class="uk-navbar-item">
                  <a href="/">Home</a>
                </div>
              </li>

              <li>
                <a href="#">
                  <div>Projects</div>
                </a>
                <div class="uk-navbar-dropdown">
                  <ul class="uk-nav uk-navbar-dropdown-nav">
                    <li>
                      <a href="https://petithub.cybai.re/">PetitHub</a>
                    </li>
                    <li>
                      <a href="https://tide.cybai.re/">Tide</a>
                    </li>
                    <li>
                      <a href="https://apero.cybai.re/">Apéro</a>
                    </li>
                    <li>
                      <a href="https://mail.cybai.re/">Mail</a>
                    </li>
                  </ul>
                </div>
              </li>

              <li>
                <div class="uk-navbar-item">
                  <div>Contact</div>
                </div>
              </li>
            </ul>
          </div>

          <div class="uk-navbar-right">
            <ul class="uk-navbar-nav">
              <li>
                <div class="uk-inline">
                  <button class="uk-icon-button uk-icon-button-small uk-icon-button-outline">
                    <uk-icon icon="palette" uk-cloak></uk-icon>
                  </button>
                  <div
                    class="uk-card uk-card-body uk-card-default uk-drop uk-width-large"
                    uk-drop="mode: click; offset: 8; pos: bottom-center"
                  >
                    <div class="uk-card-title uk-margin-medium-bottom">
                      Customize
                    </div>
                    <uk-theme-switcher></uk-theme-switcher>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  </div>
);
