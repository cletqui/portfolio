import { Context, Hono } from "hono";
import { getConnInfo } from "hono/cloudflare-pages";

import { Env } from "..";
import { getIPInfo, IPInfo } from "../utils/api";
import { UserAgent, parseUserAgent } from "../utils/ua";
import { Avatar, Spinner, Title } from "../components/layout";
import { Icon } from "../utils/icons";
import { deleteCookie } from "hono/cookie";
import { collectSignals, guessConnection } from "../utils/signals";
import {
  DeepScan,
  GoFurther,
  HideTips,
  MapCard,
  Narrative,
  PrivacyChip,
  RequestHeaders,
  Snapshot,
} from "../components/you";

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

const SKILL_GROUPS: {
  icon: string;
  title: [string, string];
  items: [string, string][];
}[] = [
  {
    icon: "shield-check",
    title: ["Security", "Sécurité"],
    items: [
      ["SOC / SIEM", "SOC / SIEM"],
      ["Splunk", "Splunk"],
      ["Threat intelligence", "Threat intelligence"],
      ["Detection & response", "Détection & réponse"],
      ["Pentest", "Tests d'intrusion"],
      ["Network security", "Sécurité réseau"],
    ],
  },
  {
    icon: "code-xml",
    title: ["Development", "Développement"],
    items: [
      ["TypeScript", "TypeScript"],
      ["Python", "Python"],
      ["JavaScript", "JavaScript"],
      ["HTML / CSS", "HTML / CSS"],
      ["SQL", "SQL"],
      ["Bash", "Bash"],
    ],
  },
  {
    icon: "server",
    title: ["Infrastructure", "Infrastructure"],
    items: [
      ["Linux", "Linux"],
      ["Docker", "Docker"],
      ["Cloudflare", "Cloudflare"],
      ["Homelab", "Homelab"],
    ],
  },
];

const TechnicalSkills = ({ lang }: { lang: string }) => (
  <div class="card space-y-4">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <h3 class="font-semibold flex items-center gap-1.5">
        <Icon
          name="laptop-minimal-check"
          size={14}
          class="text-muted-foreground shrink-0"
        />
        {lang === "fr" ? "Compétences techniques" : "Technical skills"}
      </h3>
      <p class="text-xs text-muted-foreground">
        {lang === "fr" ? "Plus de détails sur mon " : "More on my "}
        <a
          class="font-medium text-foreground underline underline-offset-4"
          href="https://github.com/cletqui/"
        >
          GitHub
        </a>
        .
      </p>
    </div>
    <div class="grid gap-4 sm:grid-cols-3">
      {SKILL_GROUPS.map((g) => (
        <div class="space-y-2">
          <div class="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <Icon name={g.icon} size={12} />
            {g.title[lang === "fr" ? 1 : 0]}
          </div>
          <div class="flex flex-wrap gap-1.5">
            {g.items.map((s) => (
              <span class="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                {s[lang === "fr" ? 1 : 0]}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
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

const PASSIONS: { icon: string; label: [string, string] }[] = [
  { icon: "code-xml", label: ["Web dev", "Dev web"] },
  { icon: "server", label: ["Homelab", "Homelab"] },
  { icon: "flag", label: ["CTFs", "CTFs"] },
  { icon: "footprints", label: ["Running", "Course"] },
  { icon: "bike", label: ["Cycling", "Vélo"] },
  { icon: "mountain", label: ["Bouldering", "Bloc"] },
  { icon: "music", label: ["Music", "Musique"] },
];

const Passions = ({ lang }: { lang: string }) => (
  <SkillCard icon="heart" title="Passions">
    <div class="mb-3 flex flex-wrap gap-1.5">
      {PASSIONS.map((p) => (
        <span class="inline-flex items-center gap-1 rounded bg-background px-2 py-0.5 text-xs text-muted-foreground">
          <Icon name={p.icon} size={12} />
          {p.label[lang === "fr" ? 1 : 0]}
        </span>
      ))}
    </div>
    {lang === "fr" ? (
      <>
        Tout ce qui touche à l'informatique : le web (comme ce site ou mes{" "}
        <a class="font-medium text-foreground" href="/projects">
          projets
        </a>
        ), l'expérimentation dans mon homelab, les défis de{" "}
        <a class="font-medium text-foreground" href="/ctf">
          CTF
        </a>
        . Et pour rester actif : course, vélo et bloc, avec de la musique, à
        jouer ou à découvrir. Ce que je fais en ce moment :{" "}
        <a class="font-medium text-foreground" href="/now">
          /now
        </a>
        .
      </>
    ) : (
      <>
        Anything IT: web development (like this site or my{" "}
        <a class="font-medium text-foreground" href="/projects">
          projects
        </a>
        ), experimenting in my homelab, solving{" "}
        <a class="font-medium text-foreground" href="/ctf">
          CTF
        </a>{" "}
        challenges. To stay active: running, cycling and bouldering, with music
        to play or discover. What I'm up to right now:{" "}
        <a class="font-medium text-foreground" href="/now">
          /now
        </a>
        .
      </>
    )}
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
        src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(name)}`}
        alt={name}
        loading="lazy"
        decoding="async"
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

/* UTILS */

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

  const org = String(cf.asOrganization ?? "");
  const guess = guessConnection(org);

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
    proxy: guess.proxy,
    hosting: guess.hosting,
  };
};

/* APP */
const app = new Hono<Env>();

/* ENDPOINTS */
app.get("/me", (c: Context<Env>) => {
  const { lang } = c.var;
  return c.render(
    <div class="mx-auto max-w-6xl px-4 py-12">
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

      <div class="space-y-4 mb-12">
        <TechnicalSkills lang={lang} />
        <div class="grid md:grid-cols-2 gap-4">
          <Academic lang={lang} />
          <Passions lang={lang} />
        </div>
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

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <Reviews lang={lang} />
        </div>
      </div>
    </div>,
    { title: lang === "fr" ? "À propos" : "About me" },
  );
});

app.get("/you", async (c: Context<Env>) => {
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

  const ua: UserAgent | null = userAgent ? parseUserAgent(userAgent) : null;
  if (ipInfo && ua)
    ipInfo = {
      ...ipInfo,
      mobile: ua.device.type === "mobile" || ua.device.type === "tablet",
    };

  const isProduction = !!c.req.header("cf-connecting-ip");

  deleteCookie(c, "you", { path: "/about/you", secure: true });

  const signals =
    ipInfo && ua
      ? collectSignals(c, address, ipInfo.timezone, ipInfo.countryCode)
      : null;

  return c.render(
    <div class="mx-auto max-w-6xl px-4 py-12">
      <div class="flex flex-col items-center mb-8">
        <Title>{lang === "fr" ? "À propos de toi" : "About you"}</Title>
        {ipInfo && ua && signals && <PrivacyChip lang={lang} />}
      </div>

      {ipInfo && ua && signals ? (
        <div class="space-y-8">
          <Snapshot lang={lang} ipInfo={ipInfo} ua={ua} signals={signals} />
          <Narrative lang={lang} ipInfo={ipInfo} ua={ua} />
          <DeepScan lang={lang} signals={signals} />
          <GoFurther lang={lang} />
          <div class="grid gap-6 lg:grid-cols-2 items-start">
            <MapCard lang={lang} ipInfo={ipInfo} />
            <RequestHeaders lang={lang} headers={signals.headers} />
          </div>
          <HideTips lang={lang} />
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
    {
      title: lang === "fr" ? "À propos de toi" : "About you",
      description:
        lang === "fr"
          ? "Ce que votre navigateur révèle : IP, géolocalisation, appareil."
          : "What your browser reveals: IP, geolocation, device.",
    },
  );
});

app.get("", (c: Context<Env>) => c.redirect("/about/me"));

export default app;
