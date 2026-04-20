import { toggleLanguage } from "../utils/language";
import { Icon } from "../utils/icons";
import { projects } from "../pages/projects";
import { contacts } from "../pages/contact";

const Logo = ({ lang }: { lang: string }) => (
  <a
    href="/"
    class="text-xl no-underline hover:no-underline!"
    aria-label={lang === "fr" ? "Retour à l'accueil" : "Back to Home"}
  >
    🕳️
  </a>
);

const NavLink = ({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: unknown;
}) => (
  <a
    href={href}
    class={`text-sm font-medium transition-colors hover:text-foreground/80 no-underline! hover:no-underline! ${
      active ? "text-foreground" : "text-muted-foreground"
    }`}
  >
    {children}
  </a>
);

const DropdownNav = ({
  label,
  href,
  active,
  items,
}: {
  label: string;
  href: string;
  active: boolean;
  items: { name: string; href?: string; icon: string }[];
}) => (
  <div class="relative group">
    <a
      href={href}
      class={`text-sm font-medium transition-colors hover:text-foreground/80 no-underline! hover:no-underline! ${
        active ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      {label}
    </a>
    <div
      class="absolute top-full left-0 mt-1 hidden group-hover:flex flex-col gap-0.5 z-50 min-w-36 rounded-md border border-border bg-card p-1 shadow-md"
      style="will-change: transform;"
    >
      {items.map(({ name, href: itemHref, icon }) => (
        <a
          href={itemHref}
          class="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground no-underline! hover:no-underline! transition-colors"
        >
          <Icon name={icon} size={14} />
          {name}
        </a>
      ))}
    </div>
  </div>
);

const Translate = ({ lang, path }: { lang: string; path: string }) => (
  <a
    href={`${path === "/" ? "" : path}/${toggleLanguage(lang)}`}
    class="icon-btn"
    title={lang === "fr" ? "Traduire en anglais" : "Translate to French"}
  >
    <Icon name="languages" size={16} />
  </a>
);

export const Header = ({ lang, path }: { lang: string; path: string }) => (
  <header class="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
    <nav class="mx-auto flex h-12 max-w-5xl items-center gap-6 px-4">
      <Logo lang={lang} />

      <div class="flex items-center gap-4">
        <NavLink href="/about/me" active={path.startsWith("/about/me")}>
          {lang === "fr" ? "À propos" : "About me"}
        </NavLink>

        <NavLink href="/about/you" active={path.startsWith("/about/you")}>
          {lang === "fr" ? "De toi ?" : "About you"}
        </NavLink>

        <DropdownNav
          label={lang === "fr" ? "Projets" : "Projects"}
          href="/projects"
          active={path.startsWith("/projects")}
          items={projects
            .filter((p) => p.internal)
            .map((p) => ({ name: p.name, href: p.internal, icon: p.icon }))}
        />

        <NavLink href="/ctf" active={path.startsWith("/ctf")}>
          CTF
        </NavLink>

        <DropdownNav
          label="Contact"
          href="/contact"
          active={path.startsWith("/contact")}
          items={contacts
            .filter((c) => c.href)
            .map((c) => ({ name: c.name, href: c.href, icon: c.icon }))}
        />
      </div>

      <div class="ml-auto">
        <Translate lang={lang} path={path} />
      </div>
    </nav>
  </header>
);
