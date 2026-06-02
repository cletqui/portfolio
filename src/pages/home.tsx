import { Context, Hono } from "hono";

import ctf from "./ctf";
import { Avatar } from "../components/layout";
import { Error } from "../components/error";
import { Icon } from "../utils/icons";

/* APP */
const app = new Hono<{}>();

const STACK = [
  ["Hono", "https://hono.dev/"],
  ["Tailwind CSS", "https://tailwindcss.com/"],
  ["Cloudflare Pages", "https://pages.cloudflare.com/"],
  ["TypeScript", "https://www.typescriptlang.org/"],
  ["Wrangler", "https://developers.cloudflare.com/workers/wrangler/"],
] as const;

const NAV_ITEMS = (lang: string) => [
  {
    icon: "user-round",
    title: lang === "fr" ? "à propos" : "about me",
    desc: "whoami",
    href: "/about/me",
  },
  {
    icon: "layers",
    title: lang === "fr" ? "projets" : "projects",
    desc: "cd ~/projects",
    href: "/projects",
  },
  {
    icon: "mail",
    title: "contact",
    desc: "ssh me@cybai.re",
    href: "/contact",
  },
];

/* COMMANDS — edit freely: add, remove, reorder entries */
const COMMANDS: { cmd: string; res: string[] }[] = [
  {
    cmd: "head -n 3 about.md",
    res: ["# About", "cybersecurity engineer", "full-stack developer"],
  },
  {
    cmd: "nmap -sV cybai.re",
    res: [
      "starting nmap 7.99...",
      "PORT     STATE SERVICE  VERSION",
      "80/tcp   open  http     Cloudflare http proxy",
      "443/tcp  open  ssl/http Cloudflare http proxy",
    ],
  },
  {
    cmd: "curl -s cybai.re/ctf.txt",
    res: ["cybai{D1dY0uF1ndWh3r3T05ubm1tM3?}"],
  },
  {
    cmd: "dig TXT cybai.re +short",
    res: ['"v=spf1 include:_spf.mx.cloudflare.net ~all"'],
  },
  {
    cmd: "git log --oneline",
    res: [
      "a3f2b1c (HEAD) deploy: cloudflare pages",
      "b2e1a0d feat: add ctf challenge flags",
    ],
  },
  {
    cmd: "ping -c 2 8.8.8.8",
    res: [
      "PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.",
      "64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=1.337ms",
      "64 bytes from 8.8.8.8: icmp_seq=2 ttl=118 time=1.337ms",
    ],
  },
  {
    cmd: "sudo !!",
    res: ["[sudo] password for user:", "Sorry, try again."],
  },
  {
    cmd: "npm install",
    res: ["added 847 packages (239 vulnerabilities found)"],
  },
];

/* COMPONENTS */
const typewriterScript = `(function(){
  var CMDS=${JSON.stringify(COMMANDS)};
  var ci=0;
  function type(el,text,speed,cb){
    var j=0,t=setInterval(function(){
      if(j<text.length){el.textContent=text.slice(0,++j)}
      else{clearInterval(t);if(cb)cb()}
    },speed);
  }
  function erase(el,speed,cb){
    var t=setInterval(function(){
      if(el.textContent.length){el.textContent=el.textContent.slice(0,-1)}
      else{clearInterval(t);if(cb)cb()}
    },speed);
  }
  function typeLines(container,lines,i,cb){
    if(i>=lines.length){if(cb)cb();return;}
    var p=document.createElement('p');
    container.appendChild(p);
    type(p,lines[i],55,function(){
      setTimeout(function(){typeLines(container,lines,i+1,cb)},120);
    });
  }
  function next(cmd,res){
    var pair=CMDS[ci++%CMDS.length];
    type(cmd,pair.cmd,80,function(){
      setTimeout(function(){
        typeLines(res,pair.res,0,function(){
          setTimeout(function(){
            res.innerHTML='';
            erase(cmd,38,function(){
              setTimeout(function(){next(cmd,res)},300);
            });
          },2800);
        });
      },350);
    });
  }
  document.addEventListener('DOMContentLoaded',function(){
    var cmd=document.getElementById('typewriter');
    var res=document.getElementById('typewriter-responses');
    if(cmd&&res)next(cmd,res);
  });
})();`;

const Welcome = () => (
  <div class="space-y-2">
    <div class="flex items-baseline gap-3">
      <span class="font-mono text-muted-foreground select-none text-3xl">
        ❯
      </span>
      <h2 id="typewriter" class="text-3xl font-bold font-mono" />
      <span class="cursor-blink font-mono text-foreground/50 text-3xl select-none">
        |
      </span>
    </div>
    <div
      id="typewriter-responses"
      class="font-mono text-sm text-muted-foreground pl-10 space-y-0.5 min-h-[2.5rem]"
    />
    <script dangerouslySetInnerHTML={{ __html: typewriterScript }} />
  </div>
);

const AvatarWithStatus = ({ size }: { size: number }) => (
  <div class="relative inline-block">
    <Avatar size={size} />
    <a
      href="https://admin.cybai.re/teapot"
      class="absolute bottom-5 right-5 h-8 w-8 rounded-full border-2 border-foreground/25 bg-card flex items-center justify-center text-base hover:scale-110 transition-transform no-underline!"
      title="418 I'm a teapot"
      aria-label="418 I'm a teapot"
    >
      🫖
    </a>
  </div>
);

const Description = ({ lang }: { lang: string }) => (
  <div class="card-primary space-y-3">
    <p class="leading-relaxed">
      {lang === "fr"
        ? "Ce portfolio est juste un terrain de jeu pour présenter mes projets, mes passions, moi-même."
        : "This portfolio is just a playground to showcase my projects, my passions, myself."}
    </p>
    <p class="leading-relaxed border-l-2 border-primary-foreground/30 pl-3 text-primary-foreground/70">
      {lang === "fr"
        ? "Je construis des projets que vous pouvez voir… et je sécurise des projets que vous ne pouvez pas voir. Ce site… disons qu'il a plus que quelques niveaux. Chaque clic, chaque transition, a été conçu dans un but précis. Vous êtes curieux ? Plongez-y."
        : "I build things you can see… and secure things you can't. This site? Let's just say it has more than a few layers. Every click, every transition — crafted with purpose. Curious? Dive in."}
    </p>
  </div>
);

const NavCard = ({
  icon,
  title,
  desc,
  href,
}: {
  icon: string;
  title: string;
  desc: string;
  href: string;
}) => (
  <a
    href={href}
    class="card flex items-start gap-3 group no-underline! hover:no-underline!"
  >
    <Icon name={icon} size={18} class="text-muted-foreground mt-0.5 shrink-0" />
    <div class="flex-1 min-w-0">
      <div class="font-semibold text-sm mb-0.5">{title}</div>
      <div class="text-xs font-mono text-muted-foreground leading-relaxed">
        {desc}
      </div>
    </div>
    <Icon
      name="chevron-right"
      size={14}
      class="text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors mt-0.5 shrink-0"
    />
  </a>
);

const StackFootnote = ({ lang }: { lang: string }) => (
  <div class="flex items-center gap-2 flex-wrap justify-center">
    <span class="text-xs font-mono text-muted-foreground">{"// stack"}</span>
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
);

/* ENDPOINTS */
app.get("/", (c: Context) => {
  const { lang } = c.var;
  c.header("X-Flag", "cybai{X-S3cr3t-H3ad3r}");
  if ((c.req.header("user-agent") ?? "").startsWith("curl/")) {
    c.header("X-Curl-Flag", "cybai{T3rm1n4lPuR1st}");
  }
  return c.render(
    <div class="mx-auto max-w-5xl px-4 py-20 space-y-10">
      <div class="grid md:grid-cols-3 gap-8 items-center">
        <div class="md:col-span-2 flex items-center">
          <Welcome />
        </div>
        <div class="flex justify-center order-first md:order-last">
          <AvatarWithStatus size={200} />
        </div>
      </div>

      <Description lang={lang} />

      <div class="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto w-full">
        {NAV_ITEMS(lang).map((item) => (
          <NavCard {...item} />
        ))}
      </div>

      <StackFootnote lang={lang} />
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

app.get("/ctf.txt", (c: Context) =>
  c.text("cybai{D1dY0uF1ndWh3r3T05ubm1tM3?}"),
);

app.options("/", (c: Context) => {
  c.header("Allow", "GET, HEAD, OPTIONS");
  c.header("X-Flag", "cybai{0pT10nSm4tt3r}");
  return c.body(null, 204);
});

app.get("/humans.txt", (c: Context) =>
  c.text(
    "/* TEAM */\nDeveloper: Antoine Q\nSite: https://cybai.re\n\n/* THANKS */\nHono · Tailwind CSS · Cloudflare Pages\n\n/* SITE */\nLast update: 2025\nLanguage: English / French\n\n# cybai{H3ll0Hum4ns}",
  ),
);

app.route("/ctf", ctf);

/* DEFAULT */
app.get("*", (c: Context) => {
  const { lang } = c.var;
  const error = 404;
  c.status(error);
  return c.render(<Error lang={lang} error={error} />);
});

export default app;
