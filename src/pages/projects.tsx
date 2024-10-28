import { Context, Hono } from "hono";
import { Title } from "../components/layout";

/* APP */
const app = new Hono<{}>();

/* ENDPOINTS */
app.get("/", (c: Context) => {
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>Projects</Title>
    </div>
  );
});

app.get("/petithub", (c: Context) => {
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>Projects</Title>
      <h2 class="uk-heading-small uk-margin">PetitHub</h2>
    </div>
  );
});

app.get("/api", (c: Context) => {
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>Projects</Title>
      <h2 class="uk-heading-small uk-margin">API</h2>
    </div>
  );
});

app.get("/tide", (c: Context) => {
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>Projects</Title>
      <h2 class="uk-heading-small uk-margin">Tide</h2>
    </div>
  );
});

app.get("/apero", (c: Context) => {
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>Projects</Title>
      <h2 class="uk-heading-small uk-margin">Apéro</h2>
    </div>
  );
});

app.get("/mail", (c: Context) => {
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>Projects</Title>
      <h2 class="uk-heading-small uk-margin">Mail</h2>
    </div>
  );
});

export default app;
