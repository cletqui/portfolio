import { toggleLanguage } from "../utils/language";
import { useNonce } from "../utils/security";
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
    <div class="absolute top-full left-0 pt-1 z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity duration-150">
      <div class="flex flex-col gap-0.5 min-w-36 rounded-md border border-border bg-card p-1 shadow-md">
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
  </div>
);

const mobileMenuScript = `(function(){document.addEventListener('DOMContentLoaded',function(){var btn=document.getElementById('mobile-menu-btn');var menu=document.getElementById('mobile-menu');if(!btn||!menu)return;btn.addEventListener('click',function(){var open=menu.classList.toggle('hidden');btn.setAttribute('aria-expanded',String(!open))})})})();`;

const themeScript = `(function(){document.addEventListener('DOMContentLoaded',function(){var b=document.getElementById('theme-toggle');if(!b)return;b.addEventListener('click',function(){var h=document.documentElement;var d=h.classList.contains('dark')||(!h.classList.contains('light')&&window.matchMedia('(prefers-color-scheme: dark)').matches);var n=d?'light':'dark';h.className=n;localStorage.setItem('theme',n)})})})();`;

const ThemeToggle = () => (
  <>
    <button
      id="theme-toggle"
      class="icon-btn"
      title="Toggle theme"
      type="button"
    >
      <span class="theme-sun">
        <Icon name="sun" size={16} />
      </span>
      <span class="theme-moon">
        <Icon name="moon" size={16} />
      </span>
    </button>
    <script
      nonce={useNonce()}
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  </>
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

      {/* Desktop nav */}
      <div class="hidden sm:flex items-center gap-4">
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

      <div class="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Translate lang={lang} path={path} />
        {/* Hamburger — mobile only */}
        <button
          id="mobile-menu-btn"
          class="nav-btn sm:hidden"
          type="button"
          aria-label={lang === "fr" ? "Menu" : "Menu"}
          aria-expanded="false"
          aria-controls="mobile-menu"
        >
          <Icon name="menu" size={18} />
        </button>
      </div>
    </nav>

    {/* Mobile menu */}
    <div
      id="mobile-menu"
      class="hidden sm:hidden border-t border-border bg-background px-4 py-3 space-y-1"
    >
      <a
        href="/about/me"
        class={`px-2 py-1.5 rounded text-sm font-medium no-underline! hover:bg-accent transition-colors ${path.startsWith("/about/me") ? "text-foreground" : "text-muted-foreground"}`}
      >
        {lang === "fr" ? "À propos" : "About me"}
      </a>
      <a
        href="/about/you"
        class={`px-2 py-1.5 rounded text-sm font-medium no-underline! hover:bg-accent transition-colors ${path.startsWith("/about/you") ? "text-foreground" : "text-muted-foreground"}`}
      >
        {lang === "fr" ? "De toi ?" : "About you"}
      </a>
      <a
        href="/projects"
        class={`px-2 py-1.5 rounded text-sm font-medium no-underline! hover:bg-accent transition-colors ${path.startsWith("/projects") ? "text-foreground" : "text-muted-foreground"}`}
      >
        {lang === "fr" ? "Projets" : "Projects"}
      </a>
      <a
        href="/ctf"
        class={`px-2 py-1.5 rounded text-sm font-medium no-underline! hover:bg-accent transition-colors ${path.startsWith("/ctf") ? "text-foreground" : "text-muted-foreground"}`}
      >
        CTF
      </a>
      <a
        href="/contact"
        class={`px-2 py-1.5 rounded text-sm font-medium no-underline! hover:bg-accent transition-colors ${path.startsWith("/contact") ? "text-foreground" : "text-muted-foreground"}`}
      >
        Contact
      </a>
    </div>

    <script
      nonce={useNonce()}
      dangerouslySetInnerHTML={{ __html: mobileMenuScript }}
    />
  </header>
);
