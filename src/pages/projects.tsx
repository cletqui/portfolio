import { Context, Hono } from "hono";
import { Button, Epochalypse, Title } from "../components/layout";

/* APP */
const app = new Hono<{}>();

/* ENDPOINTS */
app.get("/petithub", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle">
      <Title>{lang === "fr" ? "Projets" : "Projects"}</Title>
      <h2 class="uk-heading-small uk-margin">PetitHub</h2>
    </div>
  );
});

app.get("/api", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle">
      <Title>{lang === "fr" ? "Projets" : "Projects"}</Title>
      <h2 class="uk-heading-small uk-margin">API</h2>
    </div>
  );
});

app.get("/tide", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle">
      <Title>{lang === "fr" ? "Projets" : "Projects"}</Title>
      <h2 class="uk-heading-small uk-margin">Tide</h2>
    </div>
  );
});

app.get("/apéro", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle">
      <Title>{lang === "fr" ? "Projets" : "Projects"}</Title>
      <h2 class="uk-heading-small uk-margin">Apéro</h2>
    </div>
  );
});

app.get("/mail", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle">
      <Title>{lang === "fr" ? "Projets" : "Projects"}</Title>
      <h2 class="uk-heading-small uk-margin">Mail</h2>
    </div>
  );
});

app.get("/epochalypse", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle">
      <Title>{"Epochalypse"}</Title>

      <div class="uk-padding-large-top uk-padding-large-bottom">
        <Epochalypse lang={lang} />
      </div>

      <div class="uk-padding">
        <Button
          text={lang === "fr" ? "Explication" : "Explanation"}
          icon="book-a"
          href="https://en.wikipedia.org/wiki/Year_2038_problem"
        />
      </div>
      <div class="uk-padding">
        <Button
          text={lang === "fr" ? "Visualisation" : "Visualisation"}
          icon="arrow-up-1-0"
          href="https://www.epochalypse.today/"
        />
      </div>
    </div>
  );
});

app.get("", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle">
      <Title>{lang === "fr" ? "Projets" : "Projects"}</Title>
    </div>
  );
});

export default app;
