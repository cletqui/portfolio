import { jsxRenderer } from "hono/jsx-renderer";

import { Head } from "../components/head";
import { Header } from "../components/header";
import { Footer } from "../components/footer";

export const renderer = jsxRenderer(
  ({ children }) => {
    return (
      <html>
        <Head title="Portfolio" />

        <body class="bg-background text-foreground">
          <Header />
          {children}
          <Footer />
        </body>
      </html>
    );
  },
  { docType: "<!DOCTYPE html>" }
);
