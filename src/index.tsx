import { Hono } from "hono";
import { logger } from "hono/logger";

import { securityHeaders } from "./utils/security";
import { handleRedirect } from "./utils/redirect";
import { handleLanguage } from "./utils/language";
import { renderer } from "./utils/renderer";

import home from "./pages/home";
import projects from "./pages/projects";
import about from "./pages/about";
import contact from "./pages/contact";
import ctf from "./pages/ctf";
import eggs from "./pages/eggs";
import wellKnown from "./pages/well-known";
import { Error } from "./components/error";
import now from "./pages/now";

/* TYPES */
export type Bindings = {};

export type Variables = {
  lang: string;
};

export type Env = { Bindings: Bindings; Variables: Variables };

/* APP */
const app = new Hono<Env>();

/* MIDDLEWARES */
app.use(logger());
app.use(securityHeaders);
app.use(handleRedirect);
app.use(handleLanguage);
app.use(renderer);

/* ROUTES */
app.route("/about", about);
app.route("/projects", projects);
app.route("/contact", contact);
app.route("/now", now);
app.route("/ctf", ctf);
app.route("/", wellKnown);
app.route("/", eggs);
app.route("/", home);

app.notFound((c) => {
  c.status(404);
  return c.render(<Error lang={c.var.lang} error={404} />, { title: "404" });
});

export default app;
