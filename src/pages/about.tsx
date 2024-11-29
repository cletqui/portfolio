import { Context, Hono } from "hono";
import { Suspense } from "hono/jsx";
import { getConnInfo } from "hono/cloudflare-workers";

import { Bindings, Variables } from "..";
import { getIPInfo, IPInfo, getUserAgent, UserAgent } from "../utils/api";
import { Avatar, Spinner, Title } from "../components/layout";
import { setCookie } from "hono/cookie";

/* COMPONENTS */
const Me = ({ lang }: { lang: string }) => (
  <div class="uk-card uk-card-body uk-card-primary">
    <p class="uk-paragraph uk-text-justify">
      {lang === "fr" ? "Je suis un " : "I'm a french "}
      <span class="uk-text-bold">
        {lang === "fr"
          ? "ingénieur en cybersécurité"
          : "cybersecurity engineer"}
      </span>
      {lang === "fr"
        ? " français avec un intérêt prononcé pour la technologie, la résolution de problèmes et, bien sûr, le code sécurisé. Ma formation en informatique et cybersécurité ainsi que mon expérience professionnelle m'ont porté sur la sécurisation, la conception et l'optimisation des expériences numériques."
        : " with a deep love for technology, solving problems, and, of course, secure code. My background in Computer Science & Cybersecurity and professional experience has been all about defending, designing, and optimizing digital experiences."}
    </p>
  </div>
);

const TechnicalSkills = ({ lang }: { lang: string }) => (
  <div class="uk-card uk-card-body uk-card-secondary">
    <h3 class="uk-card-title uk-text-center">
      {lang === "fr"
        ? "🛠️ Compétences techniques 💻"
        : "🛠️ Technical skills 💻"}
    </h3>
    <p class="uk-paragraph uk-text-justify">
      {lang === "fr"
        ? "Les compétences techniques dont je suis fier : détection et réaction, sécurité des réseaux, tests de pénétration, Python, JavaScript, HTML/CSS, SQL et toute une gamme de référentiels de cybersécurité. Venez voir mon profil "
        : "Technical skills I'm proud of: detection & response, network security, penetration testing, Python, JavaScript, HTML/CSS, SQL and a whole toolbox of cybersecurity frameworks. Come check my "}
      <a class="uk-link" href="https://github.com/cletqui/">
        {"GitHub"}
      </a>
      {lang === "fr"
        ? " pour plus de détails."
        : " profile for even more details."}
    </p>
  </div>
);

const Academic = ({ lang }: { lang: string }) => (
  <div class="uk-card uk-card-body uk-card-secondary">
    <h3 class="uk-card-title uk-text-center">
      {lang === "fr" ? "🎓 Parcours académique 🈺" : "🎓 Academic 🈺"}
    </h3>
    <p class="uk-paragraph uk-text-justify">
      {lang === "fr"
        ? "J'ai étudié l'informatique et la cybersécurité en école d'ingénieur, où j'ai acquis une solide base en sécurisation des systèmes et des réseaux. Professionnellement, j'ai travaillé comme analyste SOC et Consultant en Cybersécurité, spécialisé dans la surveillance, la détection des menaces et la mise en place de défenses sécurisées, affirmant ainsi mon expertise en tant qu'expert blue team."
        : "I studied Computer Science & Cybersecurity in Engineering School where I built a strong foundation in defending systems and networks. Professionally, I've worked as a SOC Analyst and Cybersecurity Consultant, specializing in monitoring, threat detection, and building secure defenses — solidifying my role as a blue team expert."}
    </p>
  </div>
);

const Passions = ({ lang }: { lang: string }) => (
  <div class="uk-card uk-card-body uk-card-secondary">
    <h3 class="uk-card-title uk-text-center">{"🚴 Passions 🎸"}</h3>
    <p class="uk-paragraph uk-text-justify">
      {lang === "fr"
        ? "Je suis passionné par tout ce qui touche à l'informatique : le développement web (comme ce site ou mes "
        : "I'm passionate about all things IT — whether it's web development (like this very website or my "}
      <a class="uk-link" href="/projects">
        {"projects"}
      </a>
      {lang === "fr"
        ? "), l'expérimentation dans mon homelab ou encore la résolution de défis lors de "
        : "), setting up and experimenting in my homelab, or solving challenges in "}
      <a class="uk-link" href="/ctf">
        {"CTFs"}
      </a>
      {lang === "fr"
        ? ". En dehors de la tech, j'aime rester actif en courant, en faisant du vélo ou en pratiquant le bloc. Et quand je ne code pas ou n'escalade pas, je suis plongé dans la musique, que ce soit en jouant ou en découvrant de nouveaux sons pour enrichir mes playlists."
        : ". Outside the tech world, I love staying active with running, cycling, and bouldering. And when I'm not coding or climbing, you'll find me immersed in music, either playing or discovering new sounds to add to my playlist."}
    </p>
  </div>
);

const Review = ({
  lang,
  name,
  href,
  date,
  text,
  style = "primary",
}: {
  lang: string;
  name: string;
  href: string;
  date?: string;
  text: string;
  style?: string;
}) => {
  return (
    <div>
      <div class={`uk-card uk-card-body uk-card-${style} uk-padding-small`}>
        <article
          class={`uk-comment uk-comment-${style}`}
          tabindex={-1}
          role="comment"
        >
          <header class="uk-comment-header">
            <div class="uk-flex uk-flex-middle">
              <div class="uk-comment-avatar uk-margin-small-right">
                <img
                  src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${name}`}
                  alt={name}
                />
              </div>
              <div class="uk-flex-1">
                <div class="uk-comment-title">
                  <a href={href}>{name}</a>
                </div>
                <p class="uk-comment-meta ">
                  {date || (lang === "fr" ? "À l'instant." : "Just now.")}
                </p>
              </div>
            </div>
          </header>
          <div class="uk-comment-body uk-text-justify">
            <p>{text}</p>
          </div>
        </article>
      </div>
    </div>
  );
};

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
      style="danger"
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
    <div>
      <p class="uk-text-meta uk-text-center uk-padding-bottom">
        {lang === "fr"
          ? "Voici maintenant la partie la plus amusante, je peux deviner qui visite mon site. Ça donne :"
          : "Now here's the fun part, I get to guess who's visiting my site. Here goes:"}
      </p>

      <div class="uk-card uk-card-body uk-card-primary">
        <p class="uk-paragraph uk-text-justify">
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
          <a class="uk-link" href="/contact">
            {"Contact"}
          </a>
          {lang === "fr" ? "." : " page."}
        </p>

        <p class="uk-paragraph uk-text-justify">
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
              <span class="uk-text-bold">
                {lang === "fr" ? "VPN" : "proxy"}
              </span>
            </>
          )}
          {proxy && hosting && (lang === "fr" ? " et " : " and ")}
          {hosting && (
            <>
              {lang === "fr" ? "un " : "a "}
              <span class="uk-text-bold">
                {lang === "fr" ? "hébergement cloud" : "hosting solution"}
              </span>
            </>
          )}
          {(proxy || hosting) &&
            (lang === "fr"
              ? ", on en apprend sur toi : "
              : ", we learn about you: ")}

          {lang === "fr" ? "Tu sembles être de " : "You seem to be from "}
          <span class="uk-text-bold">{city}</span>
          {" ("}
          <i class="uk-text-success">{`${lat}, ${lon}`}</i>
          {") "}
          {lang === "fr" ? "dans la région " : "in the region "}
          <span class="uk-text-bold">{regionName}</span>
          {lang === "fr" ? " en " : " in "}
          <span class="uk-text-bold">{country}</span>
          {", "}
          <span class="uk-text-bold">{continent}</span>
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

        <p class="uk-paragraph uk-text-justify">
          {mobile &&
            (lang === "fr"
              ? `Tu as donc choisi d'explorer mon site en déplacement. Globe-trotter ? Multitâche ? Ou simplement quelqu'un de connecté en permanence via ton `
              : `So, you've chosen to explore my site on the go. A traveler? A multitasker? Or just someone who's always connected via your `)}
          {mobile && <span class="uk-text-bold">{"mobile"}</span>}
          {mobile && (lang === "fr" ? " ? " : "? ")}
          {lang === "fr"
            ? "Il semble que ta connexion soit routée par "
            : "Looks like your connection is routed through "}
          <span class="uk-text-bold">{isp}</span>
          {lang === "fr"
            ? ", as-tu vérifié s'ils offrent des fonctionnalités comme le DNS chiffré ou des options de sécurité supplémentaires ? "
            : ", have you checked if they offer features like encrypted DNS or additional security options? "}
          {lang === "fr" ? "Tu utilises " : "You're using "}
          <span class="uk-text-bold">{`${browserName} ${major}`}</span>
          {lang === "fr" ? " avec " : " with "}
          <span class="uk-text-bold">{engineName}</span>
          {lang === "fr" ? ", sur " : ", running on "}
          <span class="uk-text-bold">{`${osName} ${version}`}</span>
          {lang === "fr" ? " avec un CPU " : " with a "}
          <span class="uk-text-bold uk-text-uppercase">{architecture}</span>
          {lang === "fr"
            ? " comme coeur - ta configuration en dit long sur tes préférences. Un choix intéressant ! "
            : " CPU at its core — your setup says a lot about your preferences. Interesting choice! "}
          {osName === "Linux" &&
            (lang === "fr"
              ? "Comme utilisateur de Linux, tu es clairement quelqu'un qui valorise la liberté et le contrôle. Respect !"
              : "As a Linux user you're clearly someone who values freedom and control. Respect!")}
        </p>
      </div>

      <p class="uk-text-meta uk-text-center uk-padding-medium-top">
        {lang === "fr"
          ? "Ce n'est pas de la magie, ton IP et votre User-Agent t'ont trahi."
          : "It's not magic, your IP and User-Agent gave you away."}
      </p>
      <p class="uk-text-meta uk-text-center">
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
}) => {
  return (
    <div>
      <div class="uk-card uk-card-primary uk-padding-small">
        <h3 class="uk-card-title uk-text-center uk-padding-small-bottom">{`(${latitude}, ${longitude})`}</h3>
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${
            longitude - 0.02
          }%2C${latitude - 0.02}%2C${longitude + 0.02}%2C${
            latitude + 0.02
          }&amp;layer=mapnik`}
          width="420"
          height="420"
          class="uk-border-rounded"
          uk-responsive
        ></iframe>
      </div>
    </div>
  );
};

const IPTable = ({ lang, info }: { lang: string; info: IPInfo }) => (
  <ul class="uk-list uk-list-divider">
    <li class="uk-flex uk-flex-middle">
      <uk-icon icon="earth" class="uk-margin-small-right uk-text-muted" />
      <p class="uk-text-muted uk-margin-small-right">{"Continent:"}</p>
      {info.continent}
    </li>

    <li class="uk-flex uk-flex-middle">
      <uk-icon icon="map-pin" class="uk-margin-small-right uk-text-muted" />
      <p class="uk-text-muted uk-margin-small-right">
        {lang === "fr" ? "Pays:" : "Country:"}
      </p>
      {info.country}
    </li>

    <li class="uk-flex uk-flex-middle">
      <uk-icon icon="map-pinned" class="uk-margin-small-right uk-text-muted" />
      <p class="uk-text-muted uk-margin-small-right">
        {lang === "fr" ? "Région:" : "Region:"}
      </p>
      {info.regionName}
    </li>

    <li class="uk-flex uk-flex-middle">
      <uk-icon
        icon="map-pin-house"
        class="uk-margin-small-right uk-text-muted"
      />
      <p class="uk-text-muted uk-margin-small-right">
        {lang === "fr" ? "Ville:" : "City:"}
      </p>
      {info.city}
    </li>

    <li class="uk-flex uk-flex-middle">
      <uk-icon
        icon="ethernet-port"
        class="uk-margin-small-right uk-text-muted"
      />
      <p class="uk-text-muted uk-margin-small-right">{"ISP:"}</p>
      {info.isp}
    </li>

    <li class="uk-flex uk-flex-middle">
      <uk-icon icon="building2" class="uk-margin-small-right uk-text-muted" />
      <p class="uk-text-muted uk-margin-small-right">{"AS:"}</p>
      {info.asname}
    </li>

    {info.reverse && (
      <li class="uk-flex uk-flex-middle">
        <uk-icon icon="database" class="uk-margin-small-right uk-text-muted" />
        <p class="uk-text-muted uk-margin-small-right">
          {lang === "fr" ? "DNS inversé:" : "Reverse DNS:"}
        </p>
        {info.reverse}
      </li>
    )}

    <li class="uk-flex uk-flex-middle">
      <uk-icon
        icon="tablet-smartphone"
        class="uk-margin-small-right uk-text-muted"
      />
      <p class="uk-text-muted uk-margin-small-right">{"Mobile:"}</p>
      {new String(info.mobile)}
    </li>

    <li class="uk-flex uk-flex-middle">
      <uk-icon icon="router" class="uk-margin-small-right uk-text-muted" />
      <p class="uk-text-muted uk-margin-small-right">{"Proxy:"}</p>
      {new String(info.proxy)}
    </li>

    <li class="uk-flex uk-flex-middle">
      <uk-icon icon="server" class="uk-margin-small-right uk-text-muted" />
      <p class="uk-text-muted uk-margin-small-right">
        {lang === "fr" ? "Hébergement:" : "Hosting:"}
      </p>
      {new String(info.hosting)}
    </li>
  </ul>
);

const IP = async ({ lang, ipInfo }: { lang: string; ipInfo: IPInfo }) => {
  const { lat, lon, address } = ipInfo;
  return (
    <div class="uk-section uk-section-default">
      <div class="uk-panel uk-margin-small uk-margin-left">
        <h3 class="uk-h3 uk-heading-bullet">IP</h3>
        <code class="uk-codespan">{address}</code>

        <div class="uk-child-width-expand@s" uk-grid>
          <div class="uk-padding-medium">
            <IPTable lang={lang} info={ipInfo} />
          </div>
          <OpenStreetMap latitude={lat} longitude={lon} />
        </div>
      </div>
    </div>
  );
};

const UATable = ({ lang, ua }: { lang: string; ua: UserAgent }) => (
  <table class="uk-margin uk-table uk-table-small uk-table-divider">
    <thead>
      <th class="uk-table-shrink uk-text-nowrap"></th>
      <th class="uk-text-nowrap"></th>
      <th class="uk-table-shrink uk-text-nowrap"></th>
      <th class="uk-table-shrink uk-text-nowrap"></th>
    </thead>

    <tbody>
      {ua.browser.name && (
        <tr>
          <td class="uk-text-muted">
            <uk-icon icon="globe" />
          </td>
          <td class="uk-text-muted">
            {lang === "fr" ? "Navigateur" : "Browser"}
          </td>
          <td>{ua.browser.name}</td>
          <td>{ua.browser.version || ""}</td>
        </tr>
      )}

      {ua.engine.name && (
        <tr>
          <td class="uk-text-muted">
            <uk-icon icon="cog" />
          </td>
          <td class="uk-text-muted">{lang === "fr" ? "Moteur" : "Engine"}</td>
          <td>{ua.engine.name}</td>
          <td>{ua.engine.version || ""}</td>
        </tr>
      )}

      {ua.os.name && (
        <tr>
          <td class="uk-text-muted">
            <uk-icon icon="monitor-cog" />
          </td>
          <td class="uk-text-muted">{"OS"}</td>
          <td>{ua.os.name}</td>
          <td>{ua.os.version || ""}</td>
        </tr>
      )}

      {ua.device.type && (
        <tr>
          <td class="uk-text-muted">
            <uk-icon icon="tablet-smartphone" />
          </td>
          <td class="uk-text-muted">{ua.device.type}</td>
          <td>{ua.device.vendor || ""}</td>
          <td>{ua.device.model || ""}</td>
        </tr>
      )}

      {ua.cpu.architecture && (
        <tr>
          <td class="uk-text-muted">
            <uk-icon icon="memory-stick" />
          </td>
          <td class="uk-text-muted">{"CPU"}</td>
          <td>{ua.cpu.architecture}</td>
          <td>{""}</td>
        </tr>
      )}
    </tbody>
  </table>
);

const UA = async ({ lang, ua }: { lang: string; ua: UserAgent }) => {
  return (
    <div class="uk-section uk-section-default">
      <div class="uk-panel uk-margin-small">
        <h3 class="uk-h3 uk-heading-bullet">User-Agent</h3>
        <code class="uk-codespan">{ua.ua}</code>
      </div>

      <UATable lang={lang} ua={ua} />
    </div>
  );
};

/* APP */
const app = new Hono<{}>();

/* ENDPOINTS */
app.get("/me", (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle">
      <Title>{lang === "fr" ? "A propos" : "About me"}</Title>

      <div
        class="uk-child-width-expand@s uk-width-2-3@m uk-child-width-1-3 uk-flex-middle"
        uk-grid
      >
        <div class="uk-width-1-3@m uk-flex uk-flex-center">
          <Avatar size={250} />
        </div>

        <div class="uk-width-2-3@m uk-flex-first@m">
          <Me lang={lang} />
        </div>
      </div>

      <div
        class="uk-child-width-expand@s uk-width-2-3@m uk-child-width-1-1"
        uk-grid
      >
        <div>
          <TechnicalSkills lang={lang} />
        </div>

        <div>
          <Academic lang={lang} />
        </div>

        <div>
          <Passions lang={lang} />
        </div>
      </div>

      <div class="uk-flex uk-flex-column uk-flex-middle uk-margin-large-top uk-margin-medium-bottom">
        <h3 class="uk-heading-line uk-h3 uk-width-1-2@m uk-margin uk-text-center">
          <span>{lang === "fr" ? "Commentaires" : "Reviews"}</span>
        </h3>

        <div
          class="uk-width-1-2@m uk-child-width-1-2@m"
          uk-grid="parallax: 120;"
        >
          <Reviews lang={lang} />
        </div>
      </div>
    </div>
  );
});

app.get("/you", async (c: Context) => {
  // TODO use Suspense
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
    <div class="uk-flex uk-flex-column uk-flex-middle">
      <Title>{lang === "fr" ? "A propos de toi" : "About you"}</Title>

      <div class="uk-flex uk-flex-column uk-flex-middle uk-width-2-3@m" uk-grid>
        <You lang={lang} ipInfo={ipInfo} ua={ua} />

        {(ipInfo || userAgent) && (
          <>
            <div class="uk-margin-top"></div>
            <hr class="uk-width-1-2 uk-divider-icon uk-padding-top uk-margin-top" />
          </>
        )}

        {ipInfo && <IP lang={lang} ipInfo={ipInfo} />}

        {userAgent && <UA lang={lang} ua={ua} />}
      </div>
    </div>
  );
});

app.get("", (c: Context) => c.redirect("/about/me"));

export default app;
