import { Context, Hono } from "hono";
import { getConnInfo } from "hono/cloudflare-workers";

import { Bindings, Variables } from "..";
import { getIPInfo, IPInfo, getUserAgent, UserAgent } from "../utils/api";
import { Avatar, Spinner, Title } from "../components/layout";
import { Icon } from "../utils/icons";
import { setCookie } from "hono/cookie";

/* COMPONENTS */
const Me = ({ lang }: { lang: string }) => (
  <div class="card-primary">
    <p class="leading-relaxed">
      {lang === "fr" ? "Je suis un " : "I'm a french "}
      <strong>
        {lang === "fr" ? "ingénieur en cybersécurité" : "cybersecurity engineer"}
      </strong>
      {lang === "fr"
        ? " français avec un intérêt prononcé pour la technologie, la résolution de problèmes et, bien sûr, le code sécurisé. Ma formation en informatique et cybersécurité ainsi que mon expérience professionnelle m'ont porté sur la sécurisation, la conception et l'optimisation des expériences numériques."
        : " with a deep love for technology, solving problems, and, of course, secure code. My background in Computer Science & Cybersecurity and professional experience has been all about defending, designing, and optimizing digital experiences."}
    </p>
  </div>
);

const SkillCard = ({
  lang,
  title,
  children,
}: {
  lang: string;
  title: string;
  children: unknown;
}) => (
  <div class="card-secondary">
    <h3 class="font-semibold text-center mb-3">{title}</h3>
    <p class="text-sm leading-relaxed">{children}</p>
  </div>
);

const TechnicalSkills = ({ lang }: { lang: string }) => (
  <SkillCard
    lang={lang}
    title={lang === "fr" ? "🛠️ Compétences techniques 💻" : "🛠️ Technical skills 💻"}
  >
    {lang === "fr"
      ? "Les compétences techniques dont je suis fier : détection et réaction, sécurité des réseaux, tests de pénétration, Python, JavaScript, HTML/CSS, SQL et toute une gamme de référentiels de cybersécurité. Venez voir mon profil "
      : "Technical skills I'm proud of: detection & response, network security, penetration testing, Python, JavaScript, HTML/CSS, SQL and a whole toolbox of cybersecurity frameworks. Come check my "}
    <a class="font-medium text-foreground" href="https://github.com/cletqui/">
      GitHub
    </a>
    {lang === "fr" ? " pour plus de détails." : " profile for even more details."}
  </SkillCard>
);

const Academic = ({ lang }: { lang: string }) => (
  <SkillCard
    lang={lang}
    title={lang === "fr" ? "🎓 Parcours académique 🈺" : "🎓 Academic 🈺"}
  >
    {lang === "fr"
      ? "J'ai étudié l'informatique et la cybersécurité en école d'ingénieur, où j'ai acquis une solide base en sécurisation des systèmes et des réseaux. Professionnellement, j'ai travaillé comme analyste SOC et Consultant en Cybersécurité, spécialisé dans la surveillance, la détection des menaces et la mise en place de défenses sécurisées, affirmant ainsi mon expertise en tant qu'expert blue team."
      : "I studied Computer Science & Cybersecurity in Engineering School where I built a strong foundation in defending systems and networks. Professionally, I've worked as a SOC Analyst and Cybersecurity Consultant, specializing in monitoring, threat detection, and building secure defenses — solidifying my role as a blue team expert."}
  </SkillCard>
);

const Passions = ({ lang }: { lang: string }) => (
  <SkillCard lang={lang} title="🚴 Passions 🎸">
    {lang === "fr"
      ? "Je suis passionné par tout ce qui touche à l'informatique : le développement web (comme ce site ou mes "
      : "I'm passionate about all things IT — whether it's web development (like this very website or my "}
    <a class="font-medium text-foreground" href="/projects">
      projects
    </a>
    {lang === "fr"
      ? "), l'expérimentation dans mon homelab ou encore la résolution de défis lors de "
      : "), setting up and experimenting in my homelab, or solving challenges in "}
    <a class="font-medium text-foreground" href="/ctf">
      CTFs
    </a>
    {lang === "fr"
      ? ". En dehors de la tech, j'aime rester actif en courant, en faisant du vélo ou en pratiquant le bloc. Et quand je ne code pas ou n'escalade pas, je suis plongé dans la musique, que ce soit en jouant ou en découvrant de nouveaux sons pour enrichir mes playlists."
      : ". Outside the tech world, I love staying active with running, cycling, and bouldering. And when I'm not coding or climbing, you'll find me immersed in music, either playing or discovering new sounds to add to my playlist."}
  </SkillCard>
);

const Review = ({
  lang,
  name,
  href,
  date,
  text,
  variant = "default",
}: {
  lang: string;
  name: string;
  href: string;
  date?: string;
  text: string;
  variant?: "default" | "danger";
}) => (
  <div class={variant === "danger" ? "card-danger" : "card"}>
    <div class="flex items-center gap-3 mb-3">
      <img
        src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${name}`}
        alt={name}
        class="h-8 w-8 rounded-full border border-border"
      />
      <div>
        <a href={href} class="text-sm font-medium">
          {name}
        </a>
        <p class="text-xs text-muted-foreground">
          {date || (lang === "fr" ? "À l'instant." : "Just now.")}
        </p>
      </div>
    </div>
    <p class="text-sm leading-relaxed">{text}</p>
  </div>
);

const Reviews = ({ lang }: { lang: string }) => (
  <>
    <Review
      lang={lang}
      name={lang === "fr" ? "Pas du tout moi" : "Totally not me"}
      href="/"
      text={
        lang === "fr"
          ? `Ce site a changé ma vie. Avant de le visiter, je ne savais même pas comment épeler "cybersécurité". Aujourd'hui, je dirige une équipe SOC du Fortune 500. Une coïncidence ? Je ne crois pas.`
          : `This website changed my life. Before visiting, I didn't even know how to spell "cybersecurity". Now, I'm running a Fortune 500 SOC team. Coincidence? I think not.`
      }
    />
    <Review
      lang={lang}
      name="Douglas A."
      href="https://en.wikipedia.org/wiki/The_Hitchhiker%27s_Guide_to_the_Galaxy"
      date={lang === "fr" ? "Il y a 42 jours." : "42 days ago."}
      text="Don't panic."
    />
    <Review
      lang={lang}
      name="Elliot A."
      href="https://www.imdb.com/title/tt4652838/?ref_=ttep_ep1"
      date={lang === "fr" ? "24/05/2015" : "05/24/2015"}
      text="I'm good at reading people. My secret, I look for the worst in them."
    />
    <Review
      lang={lang}
      name="h@ck3rm@n69420"
      href="/foo.php?file=../../../../../../../etc/passwd"
      date="undefined"
      text={"<script>alert('Hello world!')</script>"}
      variant="danger"
    />
  </>
);

const You = ({
  lang,
  ipInfo,
  ua,
}: {
  lang: string;
  ipInfo: IPInfo;
  ua: UserAgent;
}) => {
  const { continent, country, regionName, city, lat, lon, isp, mobile, hosting, proxy } = ipInfo;
  const {
    browser: { name: browserName, major },
    cpu: { architecture },
    engine: { name: engineName },
    os: { name: osName, version },
  } = ua;

  return (
    <div class="space-y-4">
      <p class="text-sm text-muted-foreground text-center">
        {lang === "fr"
          ? "Voici maintenant la partie la plus amusante, je peux deviner qui visite mon site. Ça donne :"
          : "Now here's the fun part, I get to guess who's visiting my site. Here goes:"}
      </p>

      <div class="card-primary space-y-3">
        <p class="leading-relaxed text-sm">
          {lang === "fr"
            ? "Tout d'abord, tu es une personne géniale à l'esprit curieux "
            : "First of all you're a great person with a curious mind "}
          <i>
            {lang === "fr"
              ? "(probablement à propos de cybersécurité, n'est-ce pas ?)"
              : "(probably interested in cybersecurity, right?)"}
          </i>
          {lang === "fr"
            ? " . Si tu es ici, c'est parce que tu t'intéresses au web, son design ou sa sécurité. Je suppose que tu as aussi un intérêt à se contacter - ne t'inquiète pas, j'ai facilité les choses sur la page de "
            : " . If you're here it's because you're curious about the web, its design or security. I'm guessing you also have an interest in connecting — don't worry, I've made it easy on the "}
          <a class="font-semibold underline underline-offset-4" href="/contact">
            Contact
          </a>
          {lang === "fr" ? "." : " page."}
        </p>

        <p class="leading-relaxed text-sm">
          {proxy &&
            (lang === "fr"
              ? "À en juger par ta connexion, l'anonymat te tient à cœur. Que ce soit pour des raisons de confidentialité ou de facilité, je respecte le besoin d'un peu de mystère numérique. Tu es au bon endroit en matière de cybersécurité."
              : "Judging by your connection, you value anonymity. Whether for privacy or practicality, I respect the need for a little digital mystery. You're at the right cybersecurity place!")}
          {hosting &&
            (lang === "fr"
              ? "Tu es à l'aise avec la technologie, tout laisse à penser que tu as un profil technique, notamment sur l'hébergement web par exemple. "
              : "You're comfortable with technology, and everything suggests that you have a technical profile, especially in web hosting for example. ")}
          {(proxy || hosting) &&
            (lang === "fr"
              ? "Même si ton empreinte numérique est altérée par ta connexion depuis "
              : "Even if your digital fingerprint is altered by your connection from")}
          {proxy && (
            <>
              {lang === "fr" ? "un " : "a "}
              <strong>{lang === "fr" ? "VPN" : "proxy"}</strong>
            </>
          )}
          {proxy && hosting && (lang === "fr" ? " et " : " and ")}
          {hosting && (
            <>
              {lang === "fr" ? "un " : "a "}
              <strong>{lang === "fr" ? "hébergement cloud" : "hosting solution"}</strong>
            </>
          )}
          {(proxy || hosting) && (lang === "fr" ? ", on en apprend sur toi : " : ", we learn about you: ")}
          {lang === "fr" ? "Tu sembles être de " : "You seem to be from "}
          <strong>{city}</strong>
          {" ("}
          <span class="text-green-500 font-mono text-xs">{`${lat}, ${lon}`}</span>
          {") "}
          {lang === "fr" ? "dans la région " : "in the region "}
          <strong>{regionName}</strong>
          {lang === "fr" ? " en " : " in "}
          <strong>{country}</strong>
          {", "}
          <strong>{continent}</strong>
          {lang == "fr"
            ? " (mais avais-je même besoin de préciser…)."
            : " (but did I even need to specify…)."}
          {lang === "fr"
            ? "Ne panique pas pour les coordonnées GPS, c'est approximatif ! "
            : "Don't panic about the GPS coordinates, it's approximative! "}
          {country === "France" && lang === "fr"
            ? `Nos chemins se sont peut-être déjà croisés, numériquement ou autrement. "C0c0r1c0" voilà un petit drapeau, si tu sais quoi en faire…`
            : "Maybe our paths have crossed before, digitally or otherwise. Did you know there's a french version of this website?"}
        </p>

        <p class="leading-relaxed text-sm">
          {mobile &&
            (lang === "fr"
              ? `Tu as donc choisi d'explorer mon site en déplacement. Globe-trotter ? Multitâche ? Ou simplement quelqu'un de connecté en permanence via ton `
              : `So, you've chosen to explore my site on the go. A traveler? A multitasker? Or just someone who's always connected via your `)}
          {mobile && <strong>mobile</strong>}
          {mobile && (lang === "fr" ? " ? " : "? ")}
          {lang === "fr"
            ? "Il semble que ta connexion soit routée par "
            : "Looks like your connection is routed through "}
          <strong>{isp}</strong>
          {lang === "fr"
            ? ", as-tu vérifié s'ils offrent des fonctionnalités comme le DNS chiffré ou des options de sécurité supplémentaires ? "
            : ", have you checked if they offer features like encrypted DNS or additional security options? "}
          {lang === "fr" ? "Tu utilises " : "You're using "}
          <strong>{`${browserName} ${major}`}</strong>
          {lang === "fr" ? " avec " : " with "}
          <strong>{engineName}</strong>
          {lang === "fr" ? ", sur " : ", running on "}
          <strong>{`${osName} ${version}`}</strong>
          {lang === "fr" ? " avec un CPU " : " with a "}
          <strong class="uppercase">{architecture}</strong>
          {lang === "fr"
            ? " comme coeur - ta configuration en dit long sur tes préférences. Un choix intéressant ! "
            : " CPU at its core — your setup says a lot about your preferences. Interesting choice! "}
          {osName === "Linux" &&
            (lang === "fr"
              ? "Comme utilisateur de Linux, tu es clairement quelqu'un qui valorise la liberté et le contrôle. Respect !"
              : "As a Linux user you're clearly someone who values freedom and control. Respect!")}
        </p>
      </div>

      <p class="text-xs text-muted-foreground text-center">
        {lang === "fr"
          ? "Ce n'est pas de la magie, ton IP et votre User-Agent t'ont trahi."
          : "It's not magic, your IP and User-Agent gave you away."}
      </p>
      <p class="text-xs text-muted-foreground text-center">
        {lang === "fr"
          ? "N'hésite pas à valider ou compléter cette description en me contactant !"
          : "Don't hesitate to validate or complete this description by contacting me!"}
      </p>
    </div>
  );
};

const OpenStreetMap = ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) => (
  <div class="card overflow-hidden p-0">
    <p class="text-xs text-center text-muted-foreground py-2 font-mono">
      {`(${latitude}, ${longitude})`}
    </p>
    <iframe
      src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.02}%2C${latitude - 0.02}%2C${longitude + 0.02}%2C${latitude + 0.02}&amp;layer=mapnik`}
      width="100%"
      height="300"
      class="block border-t border-border"
    />
  </div>
);

const IPTable = ({ lang, info }: { lang: string; info: IPInfo }) => (
  <ul class="space-y-2 text-sm">
    {[
      { icon: "earth", label: "Continent", value: info.continent },
      { icon: "map-pin", label: lang === "fr" ? "Pays" : "Country", value: info.country },
      { icon: "map-pinned", label: lang === "fr" ? "Région" : "Region", value: info.regionName },
      { icon: "map-pin-house", label: lang === "fr" ? "Ville" : "City", value: info.city },
      { icon: "ethernet-port", label: "ISP", value: info.isp },
      { icon: "building2", label: "AS", value: info.asname },
      ...(info.reverse
        ? [{ icon: "database", label: lang === "fr" ? "DNS inversé" : "Reverse DNS", value: info.reverse }]
        : []),
      { icon: "tablet-smartphone", label: "Mobile", value: String(info.mobile) },
      { icon: "router", label: "Proxy", value: String(info.proxy) },
      { icon: "server", label: lang === "fr" ? "Hébergement" : "Hosting", value: String(info.hosting) },
    ].map(({ icon, label, value }) => (
      <li class="flex items-center gap-2 border-b border-border pb-2 last:border-0 last:pb-0">
        <Icon name={icon} size={14} class="text-muted-foreground shrink-0" />
        <span class="text-muted-foreground min-w-20">{label}:</span>
        <span>{value}</span>
      </li>
    ))}
  </ul>
);

const IP = ({ lang, ipInfo }: { lang: string; ipInfo: IPInfo }) => {
  const { lat, lon, address } = ipInfo;
  return (
    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-semibold border-l-4 border-border pl-3 mb-2">IP</h3>
        <code class="text-xs bg-muted px-2 py-1 rounded font-mono">{address}</code>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <IPTable lang={lang} info={ipInfo} />
        <OpenStreetMap latitude={lat} longitude={lon} />
      </div>
    </div>
  );
};

const UATable = ({ lang, ua }: { lang: string; ua: UserAgent }) => (
  <div class="space-y-2 text-sm">
    {[
      ua.browser.name && {
        icon: "globe",
        label: lang === "fr" ? "Navigateur" : "Browser",
        name: ua.browser.name,
        version: ua.browser.version,
      },
      ua.engine.name && {
        icon: "cog",
        label: lang === "fr" ? "Moteur" : "Engine",
        name: ua.engine.name,
        version: ua.engine.version,
      },
      ua.os.name && {
        icon: "monitor-cog",
        label: "OS",
        name: ua.os.name,
        version: ua.os.version,
      },
      ua.device.type && {
        icon: "tablet-smartphone",
        label: ua.device.type,
        name: ua.device.vendor,
        version: ua.device.model,
      },
      ua.cpu.architecture && {
        icon: "memory-stick",
        label: "CPU",
        name: ua.cpu.architecture,
        version: undefined,
      },
    ]
      .filter(Boolean)
      .map((row: any) => (
        <div class="flex items-center gap-2 border-b border-border pb-2 last:border-0 last:pb-0">
          <Icon name={row.icon} size={14} class="text-muted-foreground shrink-0" />
          <span class="text-muted-foreground min-w-20">{row.label}:</span>
          <span>{row.name}</span>
          {row.version && <span class="text-muted-foreground">{row.version}</span>}
        </div>
      ))}
  </div>
);

const UA = ({ lang, ua }: { lang: string; ua: UserAgent }) => (
  <div class="space-y-4">
    <div>
      <h3 class="text-lg font-semibold border-l-4 border-border pl-3 mb-2">
        User-Agent
      </h3>
      <code class="text-xs bg-muted px-2 py-1 rounded font-mono break-all">
        {ua.ua}
      </code>
    </div>
    <UATable lang={lang} ua={ua} />
  </div>
);

/* APP */
const app = new Hono<{}>();

/* ENDPOINTS */
app.get("/me", (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
  const { lang } = c.var;
  return c.render(
    <div class="mx-auto max-w-4xl px-4 py-12">
      <div class="flex flex-col items-center mb-8">
        <Title>{lang === "fr" ? "À propos" : "About me"}</Title>
      </div>

      <div class="grid md:grid-cols-3 gap-6 items-start mb-6">
        <div class="flex justify-center md:order-last">
          <Avatar size={200} />
        </div>
        <div class="md:col-span-2">
          <Me lang={lang} />
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-4 mb-12">
        <TechnicalSkills lang={lang} />
        <Academic lang={lang} />
        <Passions lang={lang} />
      </div>

      <div class="flex flex-col items-center">
        <h3 class="text-lg font-semibold mb-6 text-center relative w-full max-w-xs">
          <span class="relative z-10 bg-background px-4">
            {lang === "fr" ? "Commentaires" : "Reviews"}
          </span>
          <span class="absolute inset-0 flex items-center">
            <span class="w-full border-t border-border" />
          </span>
        </h3>

        <div class="grid md:grid-cols-2 gap-4 w-full max-w-2xl">
          <Reviews lang={lang} />
        </div>
      </div>
    </div>
  );
});

app.get("/you", async (c: Context) => {
  const { lang } = c.var;
  const { "user-agent": userAgent } = c.req.header();
  const {
    remote: { address },
  } = getConnInfo(c);
  const ipInfo = await getIPInfo(c, address || "1.1.1.1");
  const ua = await getUserAgent(c, userAgent);
  setCookie(
    c,
    "you",
    JSON.stringify({
      ipInfo: { address: address || "1.1.1.1", ...ipInfo },
      ua: ua,
    }),
    {
      path: `${c.req.path}`,
      secure: true,
      httpOnly: true,
      maxAge: 2628000,
      sameSite: "Strict",
    }
  );
  return c.render(
    <div class="mx-auto max-w-3xl px-4 py-12">
      <div class="flex flex-col items-center mb-8">
        <Title>{lang === "fr" ? "À propos de toi" : "About you"}</Title>
      </div>

      <div class="space-y-8">
        <You lang={lang} ipInfo={ipInfo} ua={ua} />

        {(ipInfo || userAgent) && (
          <hr class="border-border" />
        )}

        {ipInfo && <IP lang={lang} ipInfo={ipInfo} />}

        {userAgent && <UA lang={lang} ua={ua} />}
      </div>
    </div>
  );
});

app.get("", (c: Context) => c.redirect("/about/me"));

export default app;
