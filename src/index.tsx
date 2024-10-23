import { Context, Hono } from "hono";
import { logger } from "hono/logger";

import { renderer } from "./utils/renderer";

import home from "./pages/home";
import projects from "./pages/project";
import about from "./pages/about";

/* TYPES */

/* APP */
const app = new Hono<{}>();

/* MIDDLEWARES */
app.use(logger());
app.use(renderer);

/* ROUTES */
app.route("/", home);
app.route("/projects", projects);
app.route("/about", about);

/* ROOT */
/* app.get("/", (c) => {
  return c.render(home);
}); */

/* DEFAULT */

export default app;
