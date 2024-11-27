import { Context, Hono } from "hono";

import ctf from "./ctf";
import { Error } from "../components/error";

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

const Welcome = ({ lang }: { lang: string }) => (
  <div class="uk-section uk-section-small">
    <h2 class="uk-h2 uk-heading-bullet">
      {lang === "fr" ? "Bienvenue !" : "Welcome!"}
    </h2>
    <p class="uk-paragraph uk-text-lead uk-text-justify">
      {lang === "fr"
        ? "Vous avez trouvé une entrée. Maintenant, oserez-vous explorer ?"
        : "You've found your way in. Now, dare to explore?"}
    </p>
  </div>
);

const Description = ({ lang }: { lang: string }) => (
  <div class="uk-card uk-card-body uk-card-secondary">
    <p class="uk-paragraph uk-text-justify">
      {lang === "fr"
        ? "Ce portfolio est juste un terrain de jeu pour présenter mes projets, mes passions, moi-même."
        : "This portfolio is just a playground to showcase my projects, my passions, myself."}
    </p>
    <p class="uk-paragraph uk-text-justify">
      {lang === "fr"
        ? "Je construis des projets que vous pouvez voir... et je sécurise des projets que vous ne pouvez pas voir. Ce site... disons qu'il a plus que quelques niveaux. Chaque clic, chaque transition, a été conçu dans un but précis. Vous êtes curieux ? Plongez-y."
        : "I build things you can see... and secure things you can't. This site? Let's just say it has more than a few layers. Every click, every transition — crafted with purpose. Curious? Dive in."}
    </p>
  </div>
);

const Details = ({ lang }: { lang: string }) => (
  <div class="uk-card uk-card-body uk-card-primary">
    <p class="uk-paragraph uk-text-break">
      {lang === "fr" ? "Il est construit en utilisant " : "It is built using "}
      <a class="uk-link" href="https://hono.dev/">
        Hono
      </a>
      {lang === "fr" ? " comme noyau " : " as the core, "}
      <a class="uk-link" href="https://franken-ui.dev/">
        Franken UI
      </a>
      {lang === "fr" ? " pour le design " : " for design, "}
      <a class="uk-link" href="https://pages.cloudflare.com/">
        Cloudflare
      </a>
      {" & "}
      <a class="uk-link" href="https://pages.github.com/">
        GitHub
      </a>
      {lang === "fr" ? " pages pour l'hébergement." : " pages for hosting."}
    </p>
  </div>
);

/* ENDPOINTS */
app.get("/", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center uk-margin-large-top">
      <div class="uk-child-width-expand@s uk-width-2-3@m" uk-grid>
        <div class="uk-width-2-3@m uk-flex-first">
          <Welcome lang={lang} />
        </div>

        <div class="uk-width-1-3@m uk-flex uk-flex-center">
          <Avatar />
        </div>
      </div>

      <div class="uk-child-width-expand@s uk-width-2-3@m" uk-grid>
        <div class="uk-width-2-3@m">
          <Description lang={lang} />
        </div>

        <div class="uk-width-1-3@m uk-flex-first">
          <Details lang={lang} />
        </div>
      </div>
    </div>
  );
});

app.get("/robots.txt", (c: Context) => c.redirect("/static/robots.txt", 301));

app.get("/keybase.txt", (c: Context) =>
  c.text(`==================================================================
https://keybase.io/clet
--------------------------------------------------------------------

I hereby claim:

  * I am an admin of https://www.cybai.re
  * I am clet (https://keybase.io/clet) on keybase.
  * I have a public key ASBfK3R5KM5qwcfXCyf7Xy2e1jzzckPWfhhMw2bHz2lZogo

To do so, I am signing this object:

{
  "body": {
    "key": {
      "eldest_kid": "01205f2b747928ce6ac1c7d70b27fb5f2d9ed63cf37243d67e184cc366c7cf6959a20a",
      "host": "keybase.io",
      "kid": "01205f2b747928ce6ac1c7d70b27fb5f2d9ed63cf37243d67e184cc366c7cf6959a20a",
      "uid": "98d190f85d2448e2debf90fa68841319",
      "username": "clet"
    },
    "merkle_root": {
      "ctime": 1731659085,
      "hash": "fa2bef9b80954c27d50b6add8998670845a69b7c1e6cdf6439d5bc423efa34d08df3fa145fc25861efce15d7ce69420c3c39a6cc7ba1e1820329b9a0d10d2f54",
      "hash_meta": "99732069e07e1c4c05a2a53ad20adf5bd7565805f0a2d99ef6fb7238caaa8750",
      "seqno": 26299188
    },
    "service": {
      "entropy": "8Lyzr7mw0DX2ejgAWNj3M3dV",
      "hostname": "www.cybai.re",
      "protocol": "https:"
    },
    "type": "web_service_binding",
    "version": 2
  },
  "client": {
    "name": "keybase.io go client",
    "version": "6.4.0"
  },
  "ctime": 1731659096,
  "expire_in": 504576000,
  "prev": "5a08017aafa1cad577db1c633ebfa5b414b9bdbc5a827bc3e356ffd611d3ea48",
  "seqno": 6,
  "tag": "signature"
}

which yields the signature:

hKRib2R5hqhkZXRhY2hlZMOpaGFzaF90eXBlCqNrZXnEIwEgXyt0eSjOasHH1wsn+18tntY883JD1n4YTMNmx89pWaIKp3BheWxvYWTESpcCBsQgWggBeq+hytV32xxjPr+ltBS5vbxagnvD41b/1hHT6kjEIIhDPU2wsPNF93e2GjZcYctB19Y/SC1nVw6GcwBW3wEvAgHCo3NpZ8RAD1fVeLnYK/KHsUF9CW7JayCvHxr9S+NJTk/a8rIrSza1LGLLFFnS633NaFPaRE2Ogd+dy3hrVKHGEokv3T3MDqhzaWdfdHlwZSCkaGFzaIKkdHlwZQildmFsdWXEICxZt8SqS7L0i4f9hB8IlUp9Hrc3moqGhUXljP7V6ikqo3RhZ80CAqd2ZXJzaW9uAQ==

And finally, I am proving ownership of this host by posting or
appending to this document.

View my publicly-auditable identity here: https://keybase.io/clet

==================================================================`)
);

/* EASTER EGGS */
app
  .get("/teapot", (c: Context) => c.text("I'm a teapot", 418))
  .post((c: Context) =>
    c.redirect("https://www.rfc-editor.org/rfc/rfc2324#section-2.3.2")
  );

app.get("/rickroll", (c: Context) =>
  c.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUJcmljayByb2xs")
);

app.route("/ctf", ctf);

/* DEFAULT */
app.get("*", (c: Context) => {
  const error = 404;
  c.status(error);
  return c.render(<Error error={error} />);
});

export default app;
