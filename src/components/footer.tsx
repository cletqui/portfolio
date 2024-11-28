const FooterIcon = ({ icon, href }: { icon: string; href: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    class="uk-icon-link uk-margin-small-left uk-margin-small-right"
  >
    <uk-icon icon={icon} />
  </a>
);

const LoveAndCoffee = ({ lang }: { lang: string }) => {
  return (
    <div class="uk-flex uk-flex-middle">
      {lang === "fr" ? "Fait avec" : "Made with"}
      <FooterIcon icon="heart" href="https://beautifulhandwrittenletters.com" />
      {lang === "fr" ? "et" : "and"}
      <FooterIcon icon="coffee" href="https://www.buymeacoffee.com/cletqui" />
    </div>
  );
};

const Issues = ({ lang }: { lang: string }) => {
  return (
    <div class="uk-flex uk-flex-middle">
      {lang === "fr" ? "Signale les bugs sur" : "Report bugs on"}
      <FooterIcon
        icon="github"
        href="https://github.com/cletqui/portfolio/issues"
      />
    </div>
  );
};

export const Footer = ({ lang }: { lang: string }) => (
  <div uk-sticky="position: bottom">
    <div
      class="uk-flex uk-flex-column uk-flex-middle uk-text-muted uk-padding-small uk-padding-small-bottom uk-padding-top" /* TODO use Grid */
    >
      <div class="uk-grid-divider uk-text-small" uk-grid>
        <LoveAndCoffee lang={lang} />
        <Issues lang={lang} />
      </div>
    </div>
  </div>
);
