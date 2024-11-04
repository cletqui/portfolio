import { Context, Hono } from "hono";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";

import { handleRedirect } from "./utils/redirect";
import { handleLanguage } from "./utils/language";
import { renderer } from "./utils/renderer";

import home from "./pages/home";
import projects from "./pages/projects";
import about from "./pages/about";
import contact from "./pages/contact";

/* TYPES */
export type Bindings = {
  SUPPORTS: string[];
};

export type Variables = {
  lang: string;
};

/* APP */
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/* MIDDLEWARES */
app.use(logger());
app.use(poweredBy());
app.use(handleRedirect);
app.use(handleLanguage);
app.use(renderer);

/* ROUTES */
app.route("", home);
app.route("/about", about);
app.route("/projects", projects);
app.route("/contact", contact);

/* DEFAULT */
/* app.get("*", (c: Context) => {
  return c.redirect("/");
}); */

export default app;
