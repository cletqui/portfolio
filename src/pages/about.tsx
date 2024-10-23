import { Context, Hono } from "hono";
import { getConnInfo } from "hono/cloudflare-workers";

/* APP */
const app = new Hono<{}>();

/* ENDPOINTS */
app.get("/", (c: Context) => c.redirect("/me"));

app.get("/me", (c: Context) =>
  c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <h1 class="uk-heading-small uk-margin">About</h1>
      <h2 class="uk-heading-small uk-margin">Me</h2>
    </div>
  )
);

app.get("/you", (c: Context) => {
  const { "user-agent": userAgent } = c.req.header();
  const {
    remote: { address },
  } = getConnInfo(c);
  console.log(userAgent, address);
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <h1 class="uk-heading-small uk-margin">About</h1>
      <h2 class="uk-heading-small uk-margin">you</h2>
    </div>
  );
});

export default app;
