import type { Child } from "hono/jsx";

import { IPInfo } from "../utils/api";
import { UserAgent } from "../utils/ua";
import { ServerSignals } from "../utils/signals";
import { Icon } from "../utils/icons";
import { useNonce } from "../utils/security";

const languageName = (tag: string, lang: string) => {
  try {
    return (
      new Intl.DisplayNames([lang === "fr" ? "fr" : "en"], {
        type: "language",
      }).of(tag) ?? tag
    );
  } catch {
    return tag;
  }
};

const Strong = ({ children }: { children?: Child }) => (
  <strong class="font-semibold text-foreground">{children}</strong>
);

/* PRIVACY */
export const PrivacyChip = ({ lang }: { lang: string }) => (
  <details class="relative group mx-auto w-fit">
    <summary class="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors [&::-webkit-details-marker]:hidden">
      <Icon name="shield-check" size={12} class="text-green-500" />
      {lang === "fr"
        ? "Calculé dans ton navigateur · rien n'est stocké ni partagé"
        : "Computed in your browser · nothing stored or shared"}
      <Icon
        name="chevron-right"
        size={12}
        class="transition-transform group-open:rotate-90"
      />
    </summary>
    <div class="absolute left-1/2 z-20 mt-2 w-[min(24rem,90vw)] -translate-x-1/2 rounded-lg border border-border bg-card p-4 text-xs leading-relaxed text-card-foreground shadow-lg space-y-2">
      <p>
        {lang === "fr"
          ? "Tout ce qui est affiché est calculé dans ton navigateur et visible par toi seul. Rien n'est enregistré, journalisé ni partagé : pas de cookie de suivi, pas d'analytics, pas de base de données. Cette page est à but éducatif : montrer ce qu'un site peut apprendre sans rien demander."
          : "Everything shown here is computed in your browser and visible to you alone. Nothing is stored, logged or shared: no tracking cookies, no analytics, no database. This page is educational: it shows how much a site can learn without asking."}
      </p>
      <p class="text-muted-foreground">
        {lang === "fr"
          ? "Vérifie-le dans l'onglet Réseau des DevTools. Seules exceptions : deux boutons optionnels (test WebRTC vers le STUN public de Google, carte OpenStreetMap)."
          : "Check the DevTools Network tab. The only exceptions are two optional buttons (WebRTC test to Google's public STUN, OpenStreetMap map)."}
      </p>
    </div>
  </details>
);

/* SNAPSHOT */
const Tile = ({
  icon,
  label,
  value,
  sub,
  dot,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  dot?: string;
}) => (
  <div class="card flex items-start gap-3">
    <div class="rounded-md bg-muted p-2 text-muted-foreground">
      <Icon name={icon} size={16} />
    </div>
    <div class="min-w-0">
      <div class="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div class="flex items-center gap-1.5 font-semibold">
        {dot && <span class={`h-2 w-2 shrink-0 rounded-full ${dot}`} />}
        <span class="truncate">{value}</span>
      </div>
      {sub && (
        <div class="truncate text-xs text-muted-foreground" title={sub}>
          {sub}
        </div>
      )}
    </div>
  </div>
);

export const Snapshot = ({
  lang,
  ipInfo,
  ua,
  signals,
}: {
  lang: string;
  ipInfo: IPInfo;
  ua: UserAgent;
  signals: ServerSignals;
}) => {
  const fr = lang === "fr";
  const connection = ipInfo.proxy
    ? {
        value: fr ? "VPN / proxy probable" : "VPN / proxy likely",
        dot: "bg-amber-500",
      }
    : ipInfo.hosting
      ? {
          value: fr ? "Hébergeur / cloud" : "Hosting / cloud",
          dot: "bg-amber-500",
        }
      : {
          value: fr ? "Connexion directe" : "Direct connection",
          dot: "bg-green-500",
        };
  const topLanguage = signals.languages[0]?.tag;
  const place = [ipInfo.city, ipInfo.country].filter(Boolean).join(", ");

  return (
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Tile
        icon="map-pin"
        label={fr ? "Position" : "Location"}
        value={place || "?"}
        sub={[ipInfo.regionName, `${ipInfo.lat}, ${ipInfo.lon}`]
          .filter(Boolean)
          .join(" · ")}
      />
      <Tile
        icon="ethernet-port"
        label={fr ? "Réseau" : "Network"}
        value={ipInfo.isp || "?"}
        sub={[ipInfo.address, ipInfo.as && `AS${ipInfo.as}`]
          .filter(Boolean)
          .join(" · ")}
      />
      <Tile
        icon="router"
        label={fr ? "Connexion" : "Connection"}
        value={connection.value}
        dot={connection.dot}
        sub={fr ? "estimé d'après le nom de l'AS" : "guessed from the AS name"}
      />
      <Tile
        icon="globe"
        label={fr ? "Navigateur" : "Browser"}
        value={
          [ua.browser.name, ua.browser.major].filter(Boolean).join(" ") || "?"
        }
        sub={ua.engine.name}
      />
      <Tile
        icon="monitor-cog"
        label={fr ? "Système" : "System"}
        value={[ua.os.name, ua.os.version].filter(Boolean).join(" ") || "?"}
        sub={[
          ua.device.type ?? (fr ? "ordinateur" : "desktop"),
          ua.cpu.architecture,
        ]
          .filter(Boolean)
          .join(" · ")}
      />
      <Tile
        icon="languages"
        label={fr ? "Langue & heure" : "Language & time"}
        value={topLanguage ? languageName(topLanguage, lang) : "?"}
        sub={ipInfo.timezone || undefined}
      />
    </div>
  );
};

/* NARRATIVE */
const Section = ({ label, children }: { label: string; children?: Child }) => (
  <div class="space-y-1.5">
    <div class="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
      {`// ${label}`}
    </div>
    <p class="text-sm leading-relaxed">{children}</p>
  </div>
);

export const Narrative = ({
  lang,
  ipInfo,
  ua,
}: {
  lang: string;
  ipInfo: IPInfo;
  ua: UserAgent;
}) => {
  const fr = lang === "fr";
  const { continent, country, regionName, city, lat, lon, isp, mobile } =
    ipInfo;
  const proxy = !!ipInfo.proxy;
  const hosting = !!ipInfo.hosting;
  const {
    browser: { name: browserName, major },
    cpu: { architecture },
    engine: { name: engineName },
    os: { name: osName, version },
  } = ua;

  return (
    <div class="card space-y-5">
      <p class="text-sm text-muted-foreground">
        {fr
          ? "Voici la partie la plus amusante : je peux deviner qui visite mon site."
          : "Now the fun part: I get to guess who's visiting my site."}
      </p>

      <Section label={fr ? "qui" : "who"}>
        {fr
          ? "Tu es une personne géniale à l'esprit curieux "
          : "You're a great person with a curious mind "}
        <i class="text-muted-foreground">
          {fr
            ? "(probablement à propos de cybersécurité, n'est-ce pas ?)"
            : "(probably interested in cybersecurity, right?)"}
        </i>
        {fr
          ? ". Si tu es ici, c'est que tu t'intéresses au web, son design ou sa sécurité. Je suppose que tu as aussi un intérêt à te connecter : j'ai facilité les choses sur la page "
          : ". If you're here it's because you're curious about the web, its design or security. I'm guessing you also have an interest in connecting, so I've made it easy on the "}
        <a class="font-semibold underline underline-offset-4" href="/contact">
          Contact
        </a>
        {fr ? "." : " page."}
      </Section>

      <Section label={fr ? "où" : "where"}>
        {(proxy || hosting) && (
          <>
            {proxy &&
              (fr
                ? "À en juger par ta connexion, l'anonymat te tient à cœur. "
                : "Judging by your connection, you value anonymity. ")}
            {hosting &&
              (fr
                ? "Tout laisse à penser que tu as un profil technique. "
                : "Everything suggests a technical profile. ")}
            {fr
              ? "Même si ton empreinte est altérée par ta connexion depuis "
              : "Even if your fingerprint is altered by your connection from "}
            {proxy && (
              <>
                {fr ? "un " : "a "}
                <Strong>{fr ? "VPN" : "proxy"}</Strong>
              </>
            )}
            {proxy && hosting && (fr ? " et " : " and ")}
            {hosting && (
              <>
                {fr ? "un " : "a "}
                <Strong>{fr ? "hébergeur cloud" : "hosting provider"}</Strong>
              </>
            )}
            {fr ? ", on en apprend sur toi : " : ", we still learn: "}
          </>
        )}
        {proxy || hosting
          ? fr
            ? "tu sembles être de "
            : "you seem to be from "
          : fr
            ? "Tu sembles être de "
            : "You seem to be from "}
        <Strong>{city}</Strong>
        {" ("}
        <span class="font-mono text-xs text-green-500">{`${lat}, ${lon}`}</span>
        {") "}
        {fr ? "dans la région " : "in the region "}
        <Strong>{regionName}</Strong>
        {fr ? " en " : " in "}
        <Strong>{country}</Strong>
        {", "}
        <Strong>{continent}</Strong>
        {fr
          ? " (mais avais-je besoin de le préciser…). Les coordonnées sont approximatives, pas de panique. "
          : " (but did I even need to specify…). The coordinates are approximate, don't panic. "}
        {country === "France" && fr
          ? `Nos chemins se sont peut-être déjà croisés. cybai{C0c0r1c0} voilà un petit drapeau, si tu sais quoi en faire…`
          : "Maybe our paths have crossed before. Did you know there's a French version of this website?"}
      </Section>

      <Section label={fr ? "quoi" : "what"}>
        {mobile &&
          (fr
            ? "Tu explores mon site en déplacement. Globe-trotter, multitâche, ou simplement connecté en permanence via ton "
            : "You're exploring my site on the go. A traveler, a multitasker, or just always connected through your ")}
        {mobile && <Strong>mobile</Strong>}
        {mobile && (fr ? " ? " : "? ")}
        {fr ? "Ta connexion passe par " : "Your connection is routed through "}
        <Strong>{isp}</Strong>
        {fr
          ? " : as-tu vérifié s'ils proposent du DNS chiffré ? "
          : ": have you checked if they offer encrypted DNS? "}
        {fr ? "Tu utilises " : "You're using "}
        <Strong>{[browserName, major].filter(Boolean).join(" ")}</Strong>
        {fr ? " avec " : " with "}
        <Strong>{engineName}</Strong>
        {fr ? ", sur " : ", running on "}
        <Strong>{[osName, version].filter(Boolean).join(" ")}</Strong>
        {architecture && (
          <>
            {fr ? " avec un CPU " : " with a "}
            <Strong>{architecture.toUpperCase()}</Strong>
            {fr ? " comme cœur" : " CPU at its core"}
          </>
        )}
        {". "}
        {osName === "Linux" &&
          (fr
            ? "Comme utilisateur de Linux, tu valorises clairement la liberté et le contrôle. Respect !"
            : "As a Linux user you clearly value freedom and control. Respect!")}
      </Section>

      <p class="border-t border-border pt-3 text-xs text-muted-foreground">
        {fr
          ? "Ce n'est pas de la magie : ton IP et ton User-Agent t'ont trahi. N'hésite pas à valider ou compléter cette description en me contactant !"
          : "It's not magic: your IP and User-Agent gave you away. Don't hesitate to validate or complete this description by contacting me!"}
      </p>
    </div>
  );
};

/* DEEP SCAN */
export const DeepScan = ({
  lang,
  signals,
}: {
  lang: string;
  signals: ServerSignals;
}) => {
  const nonce = useNonce();
  const json = JSON.stringify(signals).replace(/</g, "\\u003c");
  return (
    <section id="scan" data-lang={lang} class="space-y-6">
      <div class="space-y-2">
        <h2 class="flex items-center gap-2 text-lg font-semibold">
          <Icon name="scan-search" size={18} class="text-muted-foreground" />
          {lang === "fr" ? "Scan approfondi" : "Deep scan"}
        </h2>
        <div
          id="scan-log"
          class="h-32 space-y-0.5 overflow-y-auto rounded-md border border-border bg-muted p-3 font-mono text-xs"
        />
        <noscript>
          <p class="text-sm text-muted-foreground">
            {lang === "fr"
              ? "Le scan approfondi nécessite JavaScript, ce qui est précisément le point : sans lui, je n'apprends presque rien."
              : "The deep scan needs JavaScript, which is rather the point: without it, I learn almost nothing."}
          </p>
        </noscript>
      </div>
      <div id="scan-results" class="hidden space-y-6" />
      <div id="scan-behavior" class="card hidden space-y-3" />
      <script
        type="application/json"
        id="server-signals"
        dangerouslySetInnerHTML={{ __html: json }}
      />
      <script src="/static/scan.js" defer nonce={nonce} />
    </section>
  );
};

/* EXTRAS */
export const MapCard = ({
  lang,
  ipInfo,
}: {
  lang: string;
  ipInfo: IPInfo;
}) => {
  const { lat, lon } = ipInfo;
  return (
    <div class="card space-y-3 overflow-hidden">
      <h3 class="flex items-center gap-2 text-sm font-semibold">
        <Icon name="map-pinned" size={14} class="text-muted-foreground" />
        {lang === "fr" ? "Où ton IP te place" : "Where your IP puts you"}
        <code class="ml-auto font-mono text-xs font-normal text-muted-foreground">
          {ipInfo.address}
        </code>
      </h3>
      <div
        id="osm-holder"
        data-src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.02}%2C${lat - 0.02}%2C${lon + 0.02}%2C${lat + 0.02}&layer=mapnik`}
        class="space-y-2 rounded-md border border-dashed border-border p-6 text-center"
      >
        <p class="text-xs text-muted-foreground">
          {lang === "fr"
            ? "La carte est chargée depuis OpenStreetMap, qui verra ton IP."
            : "The map loads from OpenStreetMap, which will see your IP."}
        </p>
        <button type="button" class="btn btn-secondary" data-load-frame="osm-holder">
          {lang === "fr" ? "Afficher la carte" : "Show map"}
        </button>
      </div>
    </div>
  );
};

export const RequestHeaders = ({
  lang,
  headers,
}: {
  lang: string;
  headers: [string, string][];
}) => (
  <details class="card" open>
    <summary class="flex cursor-pointer items-center gap-2 text-sm font-semibold">
      <Icon name="database" size={14} class="text-muted-foreground" />
      {lang === "fr"
        ? `Les ${headers.length} en-têtes reçus avec cette requête`
        : `The ${headers.length} headers sent with this request`}
    </summary>
    <ul class="mt-3 space-y-1.5 font-mono text-xs">
      {headers.map(([name, value]) => (
        <li class="grid grid-cols-[10rem_1fr] gap-2">
          <span class="truncate text-muted-foreground">{name}</span>
          <span class="break-all">{value}</span>
        </li>
      ))}
    </ul>
  </details>
);

export const HideTips = ({ lang }: { lang: string }) => {
  const fr = lang === "fr";
  const tips: [string, Child, Child][] = [
    [
      "users",
      fr ? "Se fondre dans la masse bat l'aléatoire" : "Blend in, don't randomize",
      fr
        ? "Tor Browser et Mullvad Browser uniformisent tout (polices, écran, fuseau, timers) : des milliers de personnes partagent la même empreinte."
        : "Tor Browser and Mullvad Browser flatten everything (fonts, screen, timezone, timers) so thousands of people share one fingerprint.",
    ],
    [
      "shield-check",
      "Brave & Firefox",
      fr ? (
        <>
          Brave « farble » canvas, audio et WebGL avec un bruit par session.
          Firefox propose{" "}
          <code class="font-mono">privacy.resistFingerprinting</code> et la
          protection renforcée.
        </>
      ) : (
        <>
          Brave farbles canvas, audio and WebGL with per-session noise. Firefox
          offers <code class="font-mono">privacy.resistFingerprinting</code> and
          strict protection.
        </>
      ),
    ],
    [
      "router",
      fr ? "Un VPN ne suffit pas" : "A VPN isn't enough",
      fr
        ? "Il change ton IP mais pas le reste : le détecteur de mensonges montre ce qui fuit encore (fuseau, langues, WebRTC)."
        : "It changes your IP but nothing else: the lie detector shows what still leaks (timezone, languages, WebRTC).",
    ],
    [
      "bug",
      fr ? "Les protections se voient" : "Protections are detectable",
      fr
        ? "Chaque extension anti-fingerprinting est elle-même détectable, et peut rendre ton empreinte plus rare."
        : "Every anti-fingerprinting extension is itself detectable, and can make your fingerprint rarer.",
    ],
  ];
  return (
    <div class="card space-y-4">
      <h3 class="flex items-center gap-2 text-sm font-semibold">
        <Icon name="shield-check" size={14} class="text-muted-foreground" />
        {fr ? "Comment s'en protéger" : "How to hide"}
      </h3>
      <div class="grid gap-4 sm:grid-cols-2">
        {tips.map(([icon, title, body]) => (
          <div class="flex gap-3">
            <Icon
              name={icon}
              size={14}
              class="mt-0.5 text-muted-foreground"
            />
            <div class="space-y-0.5">
              <div class="text-sm font-medium">{title}</div>
              <p class="text-xs leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
