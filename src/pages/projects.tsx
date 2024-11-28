import { Context, Hono } from "hono";
import { Epochalypse, Title } from "../components/layout";

/* APP */
const app = new Hono<{}>();

/* ENDPOINTS */
app.get("/petithub", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>{lang === "fr" ? "Projets" : "Projects"}</Title>
      <h2 class="uk-heading-small uk-margin">PetitHub</h2>
    </div>
  );
});

app.get("/api", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>{lang === "fr" ? "Projets" : "Projects"}</Title>
      <h2 class="uk-heading-small uk-margin">API</h2>
    </div>
  );
});

app.get("/tide", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>{lang === "fr" ? "Projets" : "Projects"}</Title>
      <h2 class="uk-heading-small uk-margin">Tide</h2>
    </div>
  );
});

app.get("/apéro", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>{lang === "fr" ? "Projets" : "Projects"}</Title>
      <h2 class="uk-heading-small uk-margin">Apéro</h2>
    </div>
  );
});

app.get("/mail", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>{lang === "fr" ? "Projets" : "Projects"}</Title>
      <h2 class="uk-heading-small uk-margin">Mail</h2>
    </div>
  );
});

app.get("/epochalypse", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>{"Epochalypse"}</Title>
      <Epochalypse lang={lang} />
      <a
        class="uk-link-text"
        href="https://en.wikipedia.org/wiki/Year_2038_problem"
      >
        Explanation
      </a>
      <a class="uk-link-text" href="https://www.epochalypse.today/">
        Visualisation
      </a>
    </div>
  );
});

app.get("", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>{lang === "fr" ? "Projets" : "Projects"}</Title>
    </div>
  );
});

export default app;
