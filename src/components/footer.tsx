export const Footer = () => (
  <div
    class="uk-container uk-container-expand uk-flex-inline uk-flex-middle uk-text-small uk-text-muted"
    uk-sticky="end: 100%"
  >
    {"made with"}
    <a href="/" class="uk-icon-link uk-icon-button uk-icon-button-xsmall">
      <uk-icon icon="heart"></uk-icon>
    </a>
    {"and"}
    <a
      href="https://www.buymeacoffee.com/cletqui"
      target="_blank"
      rel="noopener noreferrer"
      class="uk-icon-link uk-icon-button uk-icon-button-xsmall"
    >
      <uk-icon icon="coffee"></uk-icon>
    </a>
  </div>
);
