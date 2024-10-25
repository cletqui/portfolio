import { Context, Hono } from "hono";
import { Title } from "../components/layout";

/* APP */
const app = new Hono<{}>();

/* COMPONENTS */
const Welcome = () => (
  <div class="uk-section uk-section-small">
    <h2 class="uk-h2">Welcome!</h2>
    <div class="uk-paragraph uk-text-justify">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
    </div>
  </div>
);

const Avatar = () => (
  <div class="uk-overflow-auto uk-flex-middle">
    <img
      class="uk-border-pill"
      src="/static/p.avif"
      width="400"
      height="400"
      alt="Avatar"
    />
  </div>
);

/* ENDPOINTS */
app.get("/", (c: Context) => {
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center uk-margin-large-top">
      <div
        class="uk-child-width-expand@s uk-text-left uk-grid-divider uk-width-2-3@m"
        uk-grid
      >
        <Welcome />
        <Avatar />
      </div>
    </div>
  );
});

app
  .get("/teapot", (c: Context) => c.text("I'm a teapot", 418))
  .post((c: Context) =>
    c.redirect("https://www.rfc-editor.org/rfc/rfc2324#section-2.3.2")
  );

export default app;
