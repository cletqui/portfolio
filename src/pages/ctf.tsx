import { Context, Hono } from "hono";

import { WIP } from "../components/wip";

/* APP */
const app = new Hono<{}>();
// TODO

app.get("/", (c: Context) => {
  const { lang } = c.var;
  return c.render(<WIP lang={lang} />);
});

export default app;
