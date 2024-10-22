import { jsxRenderer } from "hono/jsx-renderer";

import { Head } from "../components/Head";
import { Navbar } from "../components/navbar";

export const renderer = jsxRenderer(
  ({ children }) => {
    return (
      <html>
        <Head title="Portfolio" />

        <body class="bg-background text-foreground">
          <Navbar />
          {children}
        </body>
      </html>
    );
  },
  { docType: "<!DOCTYPE html>" }
);
