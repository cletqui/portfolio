const LoveAndCoffee = () => (
  <div class="uk-flex-middle">
    {"Made with"}
    <a
      href="https://beautifulhandwrittenletters.com"
      class="uk-icon-link uk-icon-button uk-icon-button-small"
    >
      <uk-icon icon="heart" />
    </a>
    {"and"}
    <a
      href="https://www.buymeacoffee.com/cletqui"
      target="_blank"
      rel="noopener noreferrer"
      class="uk-icon-link uk-icon-button uk-icon-button-small"
    >
      <uk-icon icon="coffee" />
    </a>
  </div>
);

const Issues = () => (
  <div class="uk-flex-middle">
    {"Report bugs on"}
    <a
      href="https://github.com/cletqui/portfolio/issues"
      target="_blank"
      rel="noopener noreferrer"
      class="uk-icon-link uk-icon-button uk-icon-button-small"
    >
      <uk-icon icon="github" />
    </a>
  </div>
);

export const Footer = () => (
  <div uk-sticky="position: bottom">
    <div class="uk-flex uk-flex-inline uk-flex-column uk-flex-middle uk-text-muted uk-padding-small uk-padding-small-bottom uk-padding-top">
      <div class=" uk-grid-divider uk-text-small" uk-grid>
        <LoveAndCoffee />
        <Issues />
      </div>
    </div>
  </div>
);
