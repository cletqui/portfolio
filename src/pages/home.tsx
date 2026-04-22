import { Context, Hono } from "hono";

import ctf from "./ctf";
import { Avatar } from "../components/layout";
import { Error } from "../components/error";

/* APP */
const app = new Hono<{}>();

const STACK = [
  ["Hono", "https://hono.dev/"],
  ["Tailwind CSS", "https://tailwindcss.com/"],
  ["Cloudflare Pages", "https://pages.cloudflare.com/"],
  ["TypeScript", "https://www.typescriptlang.org/"],
  ["Wrangler", "https://developers.cloudflare.com/workers/wrangler/"],
] as const;

/* COMPONENTS */
const typewriterScript = `(function(){document.addEventListener('DOMContentLoaded',function(){var el=document.getElementById('typewriter');if(!el)return;var text=el.textContent||'';el.textContent='';var cursor=document.createElement('span');cursor.className='cursor-blink';cursor.style.marginLeft='1px';cursor.textContent='|';el.appendChild(cursor);var i=0;var iv=setInterval(function(){if(i<text.length){el.insertBefore(document.createTextNode(text[i++]),cursor)}else{clearInterval(iv);setTimeout(function(){cursor.remove()},800)}},80)})})();`;

const Welcome = ({ lang }: { lang: string }) => (
  <div class="space-y-4">
    <div class="flex items-baseline gap-2">
      <span class="font-mono text-muted-foreground select-none">~/</span>
      <h2 id="typewriter" class="text-2xl font-bold">
        {lang === "fr" ? "Bienvenue !" : "Welcome!"}
      </h2>
    </div>
    <p class="text-lg text-muted-foreground leading-relaxed">
      {lang === "fr"
        ? "Vous avez trouvé une entrée. Maintenant, oserez-vous explorer ?"
        : "You've found your way in. Now, dare to explore?"}
    </p>
    <script dangerouslySetInnerHTML={{ __html: typewriterScript }} />
  </div>
);

const Description = ({ lang }: { lang: string }) => (
  <div class="card-primary space-y-3">
    <p class="leading-relaxed">
      {lang === "fr"
        ? "Ce portfolio est juste un terrain de jeu pour présenter mes projets, mes passions, moi-même."
        : "This portfolio is just a playground to showcase my projects, my passions, myself."}
    </p>
    <p class="leading-relaxed border-l-2 border-border pl-3 text-muted-foreground">
      {lang === "fr"
        ? "Je construis des projets que vous pouvez voir… et je sécurise des projets que vous ne pouvez pas voir. Ce site… disons qu'il a plus que quelques niveaux. Chaque clic, chaque transition, a été conçu dans un but précis. Vous êtes curieux ? Plongez-y."
        : "I build things you can see… and secure things you can't. This site? Let's just say it has more than a few layers. Every click, every transition — crafted with purpose. Curious? Dive in."}
    </p>
  </div>
);

const Details = ({ lang }: { lang: string }) => (
  <div class="card space-y-3">
    <p class="text-xs font-mono text-muted-foreground">{"// stack"}</p>
    <div class="flex flex-wrap gap-1.5">
      {STACK.map(([name, href]) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono hover:text-foreground transition-colors no-underline!"
        >
          {name}
        </a>
      ))}
    </div>
    <p class="text-xs text-muted-foreground">
      {lang === "fr"
        ? "Aucune dépendance CDN — tout est compilé au moment du build."
        : "No CDN dependencies — everything compiled at build time."}
    </p>
  </div>
);

/* ENDPOINTS */
app.get("/", (c: Context) => {
  const { lang } = c.var;
  c.header("X-Flag", "cybai{X-S3cr3t-H3ad3r}");
  return c.render(
    <div class="mx-auto max-w-5xl px-4 py-12">
      <div class="grid md:grid-cols-3 gap-8 items-center mb-8">
        <div class="md:col-span-2">
          <Welcome lang={lang} />
        </div>
        <div class="flex justify-center">
          <Avatar size={200} />
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-4">
        <div class="md:col-span-2">
          <Description lang={lang} />
        </div>
        <div>
          <Details lang={lang} />
        </div>
      </div>
    </div>,
  );
});

app.get("/robots.txt", (c: Context) =>
  c.redirect("/.well-known/robots.txt", 301),
);

app.get("/keybase.txt", (c: Context) =>
  c.redirect("/.well-known/keybase.txt", 301),
);

/* EASTER EGGS */
app.get("/.well-known", (c: Context) =>
  c.redirect("https://www.rfc-editor.org/rfc/rfc8615"),
);

app
  .get("/teapot", (c: Context) => {
    c.header("X-Flag", "cybai{1mAT34p0t}");
    return c.text("I'm a teapot", 418);
  })
  .post((c: Context) =>
    c.redirect("https://www.rfc-editor.org/rfc/rfc2324#section-2.3.2"),
  );

app.get("/rickroll", (c: Context) =>
  c.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUJcmljayByb2xs"),
);

app.get("/fl@g.txt", (c: Context) => c.text("cybai{D1dY0uR34dTh3M4n1f3St}"));

app.route("/ctf", ctf);

/* DEFAULT */
app.get("*", (c: Context) => {
  const { lang } = c.var;
  const error = 404;
  c.status(error);
  return c.render(<Error lang={lang} error={error} />);
});

export default app;
