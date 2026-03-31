import { jsxRenderer, useRequestContext } from "hono/jsx-renderer";

import { Head } from "../components/head";
import { Header } from "../components/header";
import { Footer } from "../components/footer";

export const renderer = jsxRenderer(
  ({ children }) => {
    const c = useRequestContext();
    const { lang } = c.var;
    const { path } = c.req;
    return (
      <html lang={lang}>
        <Head title="Portfolio" />
        <body class="min-h-screen flex flex-col bg-background text-foreground">
          <Header lang={lang} path={path} />
          <main class="flex-1">{children}</main>
          <Footer lang={lang} />
        </body>
      </html>
    );
  },
  { stream: true, docType: "<!DOCTYPE html>" }
);
