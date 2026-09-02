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

/* TYPES */
export type Bindings = {
  CTF_FLAGS: KVNamespace;
};

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
app.route("/", home);

export default app;
