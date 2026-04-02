import { Icon } from "../utils/icons";

const FooterLink = ({
  icon,
  href,
  label,
}: {
  icon: string;
  href: string;
  label: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    class="inline-flex items-center no-underline! hover:text-foreground transition-colors"
    aria-label={label}
  >
    <Icon name={icon} size={14} />
  </a>
);

export const Footer = ({ lang }: { lang: string }) => (
  <footer class="border-t border-border">
    <div class="mx-auto flex h-10 max-w-5xl items-center justify-center gap-1.5 px-4 text-sm text-muted-foreground">
      {lang === "fr" ? "Fait avec" : "Made with"}
      <FooterLink
        icon="heart"
        href="https://beautifulhandwrittenletters.com"
        label="love"
      />
      {lang === "fr" ? "et" : "and"}
      <FooterLink
        icon="coffee"
        href="https://www.buymeacoffee.com/cletqui"
        label="coffee"
      />
      {lang === "fr" ? "· Signaler un " : "· Report a "}
      <FooterLink
        icon="bug"
        href="https://github.com/cletqui/portfolio/issues"
        label="GitHub issues"
      />
    </div>
  </footer>
);
