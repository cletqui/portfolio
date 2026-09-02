import { jsxRenderer, useRequestContext } from "hono/jsx-renderer";

import { Head } from "../components/head";
import { Header } from "../components/header";
import { Footer } from "../components/footer";

declare module "hono" {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      props?: { title?: string; description?: string },
    ): Response;
  }
}

const SITE = "cybai.re";
const DEFAULT_DESC = {
  en: "Personal portfolio and playground of a cybersecurity engineer & full-stack developer — projects, a CTF, and a few hidden layers.",
  fr: "Portfolio et terrain de jeu d'un ingénieur en cybersécurité et développeur full-stack — projets, un CTF, et quelques couches cachées.",
};

export const renderer = jsxRenderer(
  ({ children, title, description }) => {
    const c = useRequestContext();
    const { lang } = c.var;
    const { path } = c.req;
    const url = new URL(c.req.url);

    const pageTitle = title ? `${title} · ${SITE}` : SITE;
    const desc = description ?? DEFAULT_DESC[lang === "fr" ? "fr" : "en"];
    const canonical = `${url.origin}${url.pathname}`;
    const image = `${url.origin}/static/avatar.png`;

    return (
      <html lang={lang}>
        <Head
          title={pageTitle}
          description={desc}
          canonical={canonical}
          image={image}
          lang={lang}
        />
        <body class="min-h-screen flex flex-col bg-background text-foreground">
          <a href="#main" class="skip-link">
            {lang === "fr" ? "Aller au contenu" : "Skip to content"}
          </a>
          <Header lang={lang} path={path} />
          <main id="main" class="flex-1">
            {children}
          </main>
          <Footer lang={lang} />
        </body>
      </html>
    );
  },
  { stream: true, docType: "<!DOCTYPE html>" },
);
