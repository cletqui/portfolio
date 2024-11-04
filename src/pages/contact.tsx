import { Context, Hono } from "hono";
import { Title } from "../components/layout";

/* APP */
const app = new Hono<{}>();

app.get("", (c: Context) => {
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>Let's connect!</Title>
      <div>
        <button class="uk-button uk-button-primary">Twitter</button>
        <button class="uk-button uk-button-primary">GitHub</button>
        <button class="uk-button uk-button-secondary">GitLab</button>
        <button class="uk-button uk-button-secondary">Mail</button>
        <button class="uk-button uk-button-secondary">Map</button>
        <button class="uk-button uk-button-primary">LinkedIn</button>
      </div>
    </div>
  );
});

export default app;
