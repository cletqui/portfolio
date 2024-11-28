import { jsxRenderer, useRequestContext } from "hono/jsx-renderer";

import { Head } from "../components/head";
import { Header } from "../components/header";
import { Footer } from "../components/footer";

// TODO use Nested Layouts (https://hono.dev/docs/middleware/builtin/jsx-renderer#nested-layouts)
export const renderer = jsxRenderer(
  ({ children }) => {
    const c = useRequestContext();
    const { lang } = c.var;
    const { path } = c.req;
    return (
      <html lang={lang}>
        <Head title="Portfolio" />

        <body class="bg-background text-foreground">
          <div uk-height-viewport>
            <Header lang={lang} path={path} />
            {children}
            <Footer lang={lang} />
          </div>
        </body>
      </html>
    );
  },
  { stream: true, docType: "<!DOCTYPE HTML5>" }
);
