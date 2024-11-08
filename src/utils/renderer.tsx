import { jsxRenderer } from "hono/jsx-renderer";

import { Head } from "../components/head";
import { Header } from "../components/header";
import { Footer } from "../components/footer";

export const renderer = jsxRenderer(
  ({ children }) => {
    return (
      <html lang="en">
        <Head title="Portfolio" />

        <body class="bg-background text-foreground">
          <div uk-height-viewport>
            <Header />
            {children}
            <Footer />
          </div>
        </body>
      </html>
    );
  },
  { stream: true, docType: "<!DOCTYPE html>" }
);
