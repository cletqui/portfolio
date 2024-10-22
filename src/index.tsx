import { Context, Hono } from "hono";
import { logger } from "hono/logger";

import { renderer } from "./utils/renderer";

import home from "./pages/home";
import projects from "./pages/projects";

/* TYPES */

/* APP */
const app = new Hono<{}>();

/* MIDDLEWARES */
app.use(logger());
app.use(renderer);

/* ROUTES */
app.route("/", home);
app.route("/projects", projects);

/* ROOT */
/* app.get("/", (c) => {
  return c.render(home);
}); */

/* DEFAULT */

export default app;
