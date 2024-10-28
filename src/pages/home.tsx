import { Context, Hono } from "hono";

/* APP */
const app = new Hono<{}>();

/* COMPONENTS */
const Avatar = () => (
  <div class="uk-overflow-auto uk-flex-middle">
    <img
      class="uk-border-pill"
      style="aspect-ratio: 1 / 1"
      src="/static/avatar.jpg"
      width="400"
      height="400"
      alt="avatar"
    />
  </div>
);

const Welcome = () => (
  <div class="uk-section uk-section-small">
    <h2 class="uk-h2 uk-heading-bullet">Welcome!</h2>
    <p class="uk-paragraph uk-text-lead uk-text-justify">
      You've found your way in. Now, dare to explore?
    </p>
  </div>
);

const Description = () => (
  <div class="uk-card uk-card-body uk-card-primary">
    <p class="uk-paragraph">
      This portfolio is just a playground to showcase my projects, my passions,
      myself.
    </p>
    <p class="uk-paragraph">
      I build things you can see... and secure things you can't. This site?
      Let's just say it has more than a few layers. Every click, every
      transition — crafted with purpose. Curious? Dive in.
    </p>
  </div>
);

const Details = () => (
  <div class="uk-card uk-card-body uk-card-secondary">
    <p class="uk-paragraph uk-text-break">
      {"It is built using"}
      <a class="uk-link" href="https://hono.dev/">
        <code class="uk-codespan">Hono</code>
      </a>
      {"as the core,"}
      <a class="uk-link" href="https://franken-ui.dev/">
        <code class="uk-codespan">Franken UI</code>
      </a>
      {"for design,"}
      <a class="uk-link" href="https://pages.cloudflare.com/">
        <code class="uk-codespan">Cloudflare</code>
      </a>
      {"&"}
      <a class="uk-link" href="https://pages.github.com/">
        <code class="uk-codespan">GitHub</code>
      </a>
      {"pages for hosting."}
    </p>
  </div>
);

/* ENDPOINTS */
app.get("/", (c: Context) => {
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center uk-margin-large-top">
      <div class="uk-child-width-expand@s uk-width-2-3@m" uk-grid>
        <div class="uk-width-2-3@m uk-flex-first">
          <Welcome />
        </div>
        <div class="uk-width-1-3@m uk-flex uk-flex-center">
          <Avatar />
        </div>
      </div>
      <div class="uk-child-width-expand@s uk-width-2-3@m" uk-grid>
        <div class="uk-width-2-3@m">
          <Description />
        </div>
        <div class="uk-width-1-3@m uk-flex-first">
          <Details />
        </div>
      </div>
    </div>
  );
});

/* EASTER EGGS */
app
  .get("/teapot", (c: Context) => c.text("I'm a teapot", 418))
  .post((c: Context) =>
    c.redirect("https://www.rfc-editor.org/rfc/rfc2324#section-2.3.2")
  );

app.get("/rickroll", (c: Context) =>
  c.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUJcmljayByb2xs")
);

export default app;
