import { Context, Hono } from "hono";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";

import { renderer } from "./utils/renderer";
import { redirect } from "./utils/redirect";

import home from "./pages/home";
import projects from "./pages/projects";
import about from "./pages/about";

/* APP */
const app = new Hono<{}>();

/* MIDDLEWARES */
app.use(logger());
app.use(poweredBy());
app.use(renderer);
app.use(redirect);

/* ROUTES */
app.route("/", home);
app.route("/projects", projects);
app.route("/about", about);

/* ROOT */

/* DEFAULT */
app.get("*", (c: Context) => {
  return c.redirect("/");
});

export default app;
