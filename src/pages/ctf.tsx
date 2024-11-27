import { Context, Hono } from "hono";

import { WIP } from "../components/wip";

/* APP */
const app = new Hono<{}>();
// TODO

app.get("/", (c: Context) => {
  return c.render(<WIP />);
});

export default app;
