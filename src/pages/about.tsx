import { Context, Hono } from "hono";
import { getConnInfo } from "hono/cloudflare-workers";

import { Bindings, Variables } from "..";
import { getIPInfo, IPInfo, getUserAgent, UserAgent } from "../utils/api";
import { Avatar, Spinner, Title } from "../components/layout";
import { Icon } from "../utils/icons";
import { setCookie } from "hono/cookie";

/* COMPONENTS */
const Me = ({ lang }: { lang: string }) => (
  <div class="card-primary space-y-2">
    <p class="leading-relaxed">
      {lang === "fr" ? "Je suis un " : "I'm a French "}
      <strong>
        {lang === "fr"
          ? "ingénieur en cybersécurité et développeur full-stack"
          : "cybersecurity engineer and full-stack developer"}
      </strong>
      {lang === "fr"
        ? ", avec une expérience dans les plateformes de threat intelligence et les SIEM."
        : ", with a background in threat intelligence platforms and SIEM."}
    </p>
    <p class="leading-relaxed text-primary-foreground/70">
      {lang === "fr"
        ? "Je construis des outils ciblés à l'intersection de la sécurité et du web — tout en sécurisant des systèmes que vous ne verrez jamais. Ma stack couvre TypeScript, Python, et un homelab qui dort rarement."
        : "I build focused tools at the intersection of security and the web — while securing systems you'll never see. My stack spans TypeScript, Python, and a homelab that rarely sleeps."}
    </p>
  </div>
);

const SkillCard = ({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: unknown;
}) => (
  <div class="card-secondary">
    <h3 class="font-semibold text-center mb-3 flex items-center justify-center gap-1.5">
      <Icon name={icon} size={14} class="text-muted-foreground shrink-0" />
      {title}
    </h3>
    <div class="text-sm leading-relaxed">{children}</div>
  </div>
);

const SKILLS = [
  "TypeScript",
  "Python",
  "Bash",
  "SOC/SIEM",
  "Splunk",
  "Pentest",
  "Docker",
  "Linux",
];

const TechnicalSkills = ({ lang }: { lang: string }) => (
  <SkillCard
    icon="laptop-minimal-check"
    title={lang === "fr" ? "Compétences techniques" : "Technical skills"}
  >
    <p class="mb-3">
      {lang === "fr"
        ? "Les compétences techniques dont je suis fier : détection et réaction, sécurité des réseaux, tests de pénétration, Python, JavaScript, HTML/CSS, SQL et toute une gamme de référentiels de cybersécurité. Venez voir mon profil "
        : "Technical skills I'm proud of: detection & response, network security, penetration testing, Python, JavaScript, HTML/CSS, SQL and a whole toolbox of cybersecurity frameworks. Come check my "}
      <a class="font-medium text-foreground" href="https://github.com/cletqui/">
        GitHub
      </a>
      {lang === "fr"
        ? " pour plus de détails."
        : " profile for even more details."}
    </p>
    <div class="flex flex-wrap gap-1">
      {SKILLS.map((s) => (
        <span class="text-xs px-1.5 py-0.5 rounded bg-background text-muted-foreground font-mono">
          {s}
        </span>
      ))}
    </div>
  </SkillCard>
);

const Academic = ({ lang }: { lang: string }) => (
  <SkillCard
    icon="graduation-cap"
    title={lang === "fr" ? "Parcours académique" : "Academic"}
  >
    {lang === "fr"
      ? "J'ai étudié l'informatique et la cybersécurité en école d'ingénieur. Professionnellement, j'ai travaillé sur des plateformes de threat intelligence et des SIEM, comme analyste SOC et consultant, spécialisé dans la surveillance, la détection des menaces et la mise en place de défenses sécurisées."
      : "I studied Computer Science & Cybersecurity in Engineering School. Professionally, I've worked on threat intelligence platforms and SIEM systems as a SOC Analyst and Cybersecurity Consultant, specializing in monitoring, threat detection, and building secure defenses."}
  </SkillCard>
);

const Passions = ({ lang }: { lang: string }) => (
  <SkillCard icon="heart" title="Passions">
    {lang === "fr"
      ? "Je suis passionné par tout ce qui touche à l'informatique : le développement web (comme ce site ou mes "
      : "I'm passionate about all things IT — whether it's web development (like this very website or my "}
    <a class="font-medium text-foreground" href="/projects">
      {lang === "fr" ? "projets" : "projects"}
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
  const {
    continent,
    country,
    regionName,
    city,
    lat,
    lon,
    isp,
    mobile,
    hosting,
    proxy,
  } = ipInfo;
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
              <strong>
                {lang === "fr" ? "hébergement cloud" : "hosting solution"}
              </strong>
            </>
          )}
          {(proxy || hosting) &&
            (lang === "fr"
              ? ", on en apprend sur toi : "
              : ", we learn about you: ")}
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
          {lang === "fr"
            ? " (mais avais-je même besoin de préciser…)."
            : " (but did I even need to specify…)."}
          {lang === "fr"
            ? "Ne panique pas pour les coordonnées GPS, c'est approximatif ! "
            : "Don't panic about the GPS coordinates, it's approximative! "}
          {country === "France" && lang === "fr"
            ? `Nos chemins se sont peut-être déjà croisés, numériquement ou autrement. cybai{C0c0r1c0} voilà un petit drapeau, si tu sais quoi en faire…`
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
          <strong>{[browserName, major].filter(Boolean).join(" ")}</strong>
          {lang === "fr" ? " avec " : " with "}
          <strong>{engineName}</strong>
          {lang === "fr" ? ", sur " : ", running on "}
          <strong>{[osName, version].filter(Boolean).join(" ")}</strong>
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
      {
        icon: "map-pin",
        label: lang === "fr" ? "Pays" : "Country",
        value: info.country,
      },
      {
        icon: "map-pinned",
        label: lang === "fr" ? "Région" : "Region",
        value: info.regionName,
      },
      {
        icon: "map-pin-house",
        label: lang === "fr" ? "Ville" : "City",
        value: info.city,
      },
      { icon: "ethernet-port", label: "ISP", value: info.isp },
      { icon: "building2", label: "AS", value: info.asname },
      ...(info.reverse
        ? [
            {
              icon: "database",
              label: lang === "fr" ? "DNS inversé" : "Reverse DNS",
              value: info.reverse,
            },
          ]
        : []),
      ...(info.mobile !== null
        ? [
            {
              icon: "tablet-smartphone",
              label: "Mobile",
              value: String(info.mobile),
            },
          ]
        : []),
      ...(info.proxy !== null
        ? [{ icon: "router", label: "Proxy", value: String(info.proxy) }]
        : []),
      ...(info.hosting !== null
        ? [
            {
              icon: "server",
              label: lang === "fr" ? "Hébergement" : "Hosting",
              value: String(info.hosting),
            },
          ]
        : []),
    ].map(({ icon, label, value }) => (
      <li class="flex items-center gap-2 border-b border-border pb-2 last:border-0 last:pb-0">
        <Icon name={icon} size={14} class="text-muted-foreground shrink-0" />
        <span class="text-muted-foreground min-w-20 shrink-0">{label}:</span>
        <span class="font-mono text-xs">{value}</span>
      </li>
    ))}
  </ul>
);

const IP = ({ lang, ipInfo }: { lang: string; ipInfo: IPInfo }) => {
  const { lat, lon, address } = ipInfo;
  return (
    <div class="space-y-4">
      <div>
        <h3 class="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
          {"// ip address"}
        </h3>
        <code class="text-sm bg-muted px-2 py-1 rounded font-mono">
          {address}
        </code>
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
          <Icon
            name={row.icon}
            size={14}
            class="text-muted-foreground shrink-0"
          />
          <span class="text-muted-foreground min-w-20 shrink-0">
            {row.label}:
          </span>
          <span class="font-mono text-xs">{row.name}</span>
          {row.version && (
            <span class="text-muted-foreground font-mono text-xs">
              {row.version}
            </span>
          )}
        </div>
      ))}
  </div>
);

const UA = ({ lang, ua }: { lang: string; ua: UserAgent }) => (
  <div class="space-y-4">
    <div>
      <h3 class="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
        {"// user-agent"}
      </h3>
      <code class="text-xs bg-muted px-2 py-1 rounded font-mono break-all">
        {ua.ua}
      </code>
    </div>
    <UATable lang={lang} ua={ua} />
  </div>
);

/* UTILS */

// Regex UA fallback — used when api.cybai.re is unreachable
const parseUABasic = (uaString: string): UserAgent => {
  const edge = /Edg\/([\d.]+)/.exec(uaString);
  const chrome = /Chrome\/([\d.]+)/.exec(uaString);
  const firefox = /Firefox\/([\d.]+)/.exec(uaString);
  const safari = /Version\/([\d.]+)/.exec(uaString);

  const name = edge
    ? "Edge"
    : chrome && !edge
      ? "Chrome"
      : firefox
        ? "Firefox"
        : safari && /Safari/.test(uaString)
          ? "Safari"
          : undefined;
  const ver = edge?.[1] ?? chrome?.[1] ?? firefox?.[1] ?? safari?.[1];

  const ios = /(?:iPhone|iPad) OS ([\d_]+)/.exec(uaString);
  const android = /Android ([\d.]+)/.exec(uaString);
  const win = /Windows NT ([\d.]+)/.exec(uaString);
  const mac = /Mac OS X ([\d_]+)/.exec(uaString);
  const linux = /Linux/.test(uaString) && !android;

  const osName = ios
    ? "iOS"
    : android
      ? "Android"
      : win
        ? "Windows"
        : mac
          ? "macOS"
          : linux
            ? "Linux"
            : undefined;
  const osVer = (ios?.[1] ?? android?.[1] ?? win?.[1] ?? mac?.[1])?.replace(
    /_/g,
    ".",
  );

  return {
    ua: uaString,
    browser: { name, version: ver, major: ver?.split(".")[0] },
    engine: {
      name: firefox ? "Gecko" : /WebKit/.test(uaString) ? "WebKit" : undefined,
      version: undefined,
    },
    os: { name: osName, version: osVer },
    device: {
      type: ios || android ? "mobile" : undefined,
      model: undefined,
      vendor: undefined,
    },
    cpu: {
      architecture: /x86_64|x64|WOW64|Win64/.test(uaString)
        ? "amd64"
        : /arm64|aarch64/.test(uaString)
          ? "arm64"
          : undefined,
    },
  };
};

// Extract geolocation from Cloudflare's built-in CF properties — no external API needed
const getCFGeo = (
  c: Context,
  address: string | undefined,
  lang: string,
): IPInfo | null => {
  const cf = (c.req.raw as any).cf as Record<string, unknown> | undefined;
  if (!cf?.country) return null;

  const countryCode = String(cf.country);
  const countryName = (() => {
    try {
      return (
        new Intl.DisplayNames([lang === "fr" ? "fr" : "en"], {
          type: "region",
        }).of(countryCode) ?? countryCode
      );
    } catch {
      return countryCode;
    }
  })();

  const continentNames: Record<string, [string, string]> = {
    AF: ["Africa", "Afrique"],
    AN: ["Antarctica", "Antarctique"],
    AS: ["Asia", "Asie"],
    EU: ["Europe", "Europe"],
    NA: ["North America", "Amérique du Nord"],
    OC: ["Oceania", "Océanie"],
    SA: ["South America", "Amérique du Sud"],
  };
  const continentCode = String(cf.continent ?? "");
  const continentName =
    continentNames[continentCode]?.[lang === "fr" ? 1 : 0] ?? continentCode;

  return {
    address,
    status: "success",
    continent: continentName,
    continentCode,
    country: countryName,
    countryCode,
    region: String(cf.regionCode ?? ""),
    regionName: String(cf.region ?? ""),
    city: String(cf.city ?? ""),
    district: "",
    zip: String(cf.postalCode ?? ""),
    lat: parseFloat(String(cf.latitude ?? "0")) || 0,
    lon: parseFloat(String(cf.longitude ?? "0")) || 0,
    timezone: String(cf.timezone ?? ""),
    offset: 0,
    currency: "",
    isp: String(cf.asOrganization ?? ""),
    org: String(cf.asOrganization ?? ""),
    as: String(cf.asn ?? ""),
    asname: String(cf.asOrganization ?? ""),
    reverse: "",
    mobile: null,
    proxy: null,
    hosting: null,
  };
};

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
    </div>,
  );
});

app.get("/you", async (c: Context) => {
  const { lang } = c.var;
  const userAgent = c.req.header("user-agent") ?? "";

  let address: string | undefined = c.req.header("cf-connecting-ip");
  if (!address) {
    try {
      address = getConnInfo(c).remote.address;
    } catch {
      address = undefined;
    }
  }
  if (!address || address === "::1" || address === "::ffff:127.0.0.1")
    address = "127.0.0.1";

  // Geo: Cloudflare built-in properties (always available in production, no external call)
  // Falls back to api.cybai.re only in local dev where CF properties aren't set
  let ipInfo: IPInfo | null = getCFGeo(c, address, lang);
  if (!ipInfo) {
    try {
      ipInfo = await getIPInfo(c, address ?? "");
    } catch (e) {
      console.error("[/about/you] IP lookup failed:", e);
    }
  }

  // UA: try api.cybai.re for full parsing, fall back to built-in regex
  let ua: UserAgent | null = null;
  try {
    ua = await getUserAgent(c, userAgent);
  } catch (e) {
    console.error("[/about/you] UA lookup failed:", e);
    ua = userAgent ? parseUABasic(userAgent) : null;
  }

  const isProduction = !!c.req.header("cf-connecting-ip");

  if (ipInfo && ua) {
    setCookie(
      c,
      "you",
      encodeURIComponent(
        JSON.stringify({ ipInfo: { address, ...ipInfo }, ua }),
      ),
      {
        path: c.req.path,
        secure: true,
        httpOnly: true,
        maxAge: 2628000,
        sameSite: "Strict",
      },
    );
  }

  return c.render(
    <div class="mx-auto max-w-3xl px-4 py-12">
      <div class="flex flex-col items-center mb-8">
        <Title>{lang === "fr" ? "À propos de toi" : "About you"}</Title>
      </div>

      {ipInfo && ua ? (
        <div class="space-y-8">
          <You lang={lang} ipInfo={ipInfo} ua={ua} />
          <hr class="border-border" />
          <IP lang={lang} ipInfo={ipInfo} />
          <UA lang={lang} ua={ua} />
        </div>
      ) : (
        <div class="text-center py-16 space-y-3">
          <Icon
            name="wifi-off"
            size={40}
            class="text-muted-foreground mx-auto"
          />
          <p class="font-mono text-sm text-muted-foreground">
            {"// " +
              (isProduction
                ? lang === "fr"
                  ? "Données temporairement indisponibles."
                  : "Data temporarily unavailable."
                : lang === "fr"
                  ? "Connexion non détectable depuis cet environnement."
                  : "Connection undetectable from this environment.")}
          </p>
          <p class="text-xs text-muted-foreground">
            {isProduction
              ? lang === "fr"
                ? "Réessayez en rafraîchissant la page."
                : "Try refreshing the page."
              : lang === "fr"
                ? "Visitez depuis une connexion publique pour voir vos informations."
                : "Visit from a public connection to see your information."}
          </p>
        </div>
      )}
    </div>,
  );
});

app.get("", (c: Context) => c.redirect("/about/me"));

export default app;
