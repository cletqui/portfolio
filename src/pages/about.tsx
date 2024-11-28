import { Context, Hono } from "hono";
import { Suspense } from "hono/jsx";
import { getConnInfo } from "hono/cloudflare-workers";

import { Bindings, Variables } from "..";
import { queryIPInfo, IPInfo, queryUserAgent, UserAgent } from "../utils/api";
import { Avatar, Spinner, Title } from "../components/layout";

/* COMPONENTS */
const Me = ({ lang }: { lang: string }) => (
  <div class="uk-card uk-card-body uk-card-primary">
    <p class="uk-paragraph uk-text-justify">
      {lang === "fr" ? "Je suis un " : "I'm a french "}
      <b>
        {lang === "fr"
          ? "ingénieur en cybersécurité"
          : "cybersecurity engineer"}
      </b>
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
        {"GitHub"} uk-text-center
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
        ? "Je suis passionné par tout ce qui touche à l'informatique : le développement web (comme ce site), l'expérimentation dans mon homelab ou encore la résolution de défis lors de "
        : "I'm passionate about all things IT — whether it's web development (like this very website), setting up and experimenting in my homelab, or solving challenges in "}
      <a class="uk-link" href="/ctf">
        {"CTFs"}
      </a>
      {lang === "fr"
        ? ". En dehors de la tech, j'aime rester actif en courant, en faisant du vélo ou en pratiquant le bloc. Et quand je ne code pas ou n'escalade pas, je suis plongé dans la musique, que ce soit en jouant ou en découvrant de nouveaux sons pour enrichir mes playlists."
        : ". Outside the tech world, I love staying active with running, cycling, and bouldering. And when I'm not coding or climbing, you'll find me immersed in music, either playing or discovering new sounds to add to my playlist."}
    </p>
  </div>
);

const OpenStreetMap = ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) => {
  return (
    <div class="uk-card uk-card-primary uk-padding-medium">
      <h3 class="uk-card-title">{`(${latitude},${longitude})`}</h3>
      <iframe
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${
          longitude - 0.02
        }%2C${latitude - 0.02}%2C${longitude + 0.02}%2C${
          latitude + 0.02
        }&amp;layer=mapnik`}
        width="400"
        height="400"
        class="uk-border-rounded"
        uk-responsive
      ></iframe>
    </div>
  );
};

const IPTable = ({ info }: { info: IPInfo }) => (
  <ul class="uk-list uk-list-divider">
    <li class="uk-flex uk-flex-middle">
      <uk-icon icon="earth" class="uk-margin-small-right uk-text-muted" />
      <p class="uk-text-muted uk-margin-small-right">Continent:</p>
      {info.continent}
    </li>

    <li class="uk-flex uk-flex-middle">
      <uk-icon icon="map-pin" class="uk-margin-small-right uk-text-muted" />
      <p class="uk-text-muted uk-margin-small-right">Country:</p>
      {info.country}
    </li>

    <li class="uk-flex uk-flex-middle">
      <uk-icon icon="map-pinned" class="uk-margin-small-right uk-text-muted" />
      <p class="uk-text-muted uk-margin-small-right">Region:</p>
      {info.regionName}
    </li>

    <li class="uk-flex uk-flex-middle">
      <uk-icon
        icon="map-pin-house"
        class="uk-margin-small-right uk-text-muted"
      />
      <p class="uk-text-muted uk-margin-small-right">City:</p>
      {info.city}
    </li>

    <li class="uk-flex uk-flex-middle">
      <uk-icon
        icon="ethernet-port"
        class="uk-margin-small-right uk-text-muted"
      />
      <p class="uk-text-muted uk-margin-small-right">ISP:</p>
      {info.isp}
    </li>

    <li class="uk-flex uk-flex-middle">
      <uk-icon icon="building2" class="uk-margin-small-right uk-text-muted" />
      <p class="uk-text-muted uk-margin-small-right">AS:</p>
      {info.asname}
    </li>

    {info.reverse && (
      <li class="uk-flex uk-flex-middle">
        <uk-icon icon="database" class="uk-margin-small-right uk-text-muted" />
        <p class="uk-text-muted uk-margin-small-right">Reverse DNS:</p>
        {info.reverse}
      </li>
    )}

    <li class="uk-flex uk-flex-middle">
      <uk-icon
        icon="tablet-smartphone"
        class="uk-margin-small-right uk-text-muted"
      />
      <p class="uk-text-muted uk-margin-small-right">Mobile:</p>
      {new String(info.mobile)}
    </li>

    <li class="uk-flex uk-flex-middle">
      <uk-icon icon="router" class="uk-margin-small-right uk-text-muted" />
      <p class="uk-text-muted uk-margin-small-right">Proxy:</p>
      {new String(info.proxy)}
    </li>

    <li class="uk-flex uk-flex-middle">
      <uk-icon icon="server" class="uk-margin-small-right uk-text-muted" />
      <p class="uk-text-muted uk-margin-small-right">Hosting:</p>
      {new String(info.hosting)}
    </li>
  </ul>
);

const IP = async ({ address }: { address: string }) => {
  const info = await queryIPInfo(address);
  const { lat, lon } = info;
  return (
    <div class="uk-section uk-section-default">
      <div class="uk-panel uk-margin-small uk-margin-left">
        <h3 class="uk-h3 uk-heading-bullet">IP</h3>
        <code class="uk-codespan">{address}</code>

        <div class="uk-child-width-expand@s" uk-grid>
          <div class="uk-padding-medium">
            <IPTable info={info} />
          </div>
          <OpenStreetMap latitude={lat} longitude={lon} />
        </div>
      </div>
    </div>
  );
};

const UATable = ({ ua }: { ua: UserAgent }) => (
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
          <td>
            <uk-icon icon="globe" />
          </td>
          <td>{"browser"}</td>
          <td>{ua.browser.name}</td>
          <td>{ua.browser.version || ""}</td>
        </tr>
      )}

      {ua.engine.name && (
        <tr>
          <td>
            <uk-icon icon="cog" />
          </td>
          <td>{"engine"}</td>
          <td>{ua.engine.name}</td>
          <td>{ua.engine.version || ""}</td>
        </tr>
      )}

      {ua.os.name && (
        <tr>
          <td>
            <uk-icon icon="monitor-cog" />
          </td>
          <td>{"os"}</td>
          <td>{ua.os.name}</td>
          <td>{ua.os.version || ""}</td>
        </tr>
      )}

      {ua.device.type && (
        <tr>
          <td>
            <uk-icon icon="tablet-smartphone" />
          </td>
          <td>{ua.device.type}</td>
          <td>{ua.device.vendor || ""}</td>
          <td>{ua.device.model || ""}</td>
        </tr>
      )}

      {ua.cpu.architecture && (
        <tr>
          <td>
            <uk-icon icon="memory-stick" />
          </td>
          <td>{"cpu"}</td>
          <td>{ua.cpu.architecture}</td>
          <td>{""}</td>
        </tr>
      )}
    </tbody>
  </table>
);

const UA = async ({ userAgent }: { userAgent: string }) => {
  const ua = await queryUserAgent(userAgent);
  return (
    <div class="uk-section uk-section-default">
      <div class="uk-panel uk-margin-small">
        <h3 class="uk-h3 uk-heading-bullet">User-Agent</h3>
        <code class="uk-codespan">{ua.ua}</code>
      </div>

      <UATable ua={ua} />
    </div>
  );
};

/* APP */
const app = new Hono<{}>();

/* ENDPOINTS */
app.get("/me", (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center uk-margin-large-top">
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
    </div>
  );
});

app.get("/you", (c: Context) => {
  // TODO use Suspense
  const { lang } = c.var;
  const { "user-agent": userAgent } = c.req.header();
  const {
    remote: { address },
  } = getConnInfo(c);
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>{lang === "fr" ? "A propos de toi" : "About you"}</Title>

      <div class="uk-text-meta">
        {lang === "fr"
          ? "Voici maintenant la partie la plus amusante : Je dois deviner qui visite mon site. Voici ce que je propose..."
          : "Now here's the fun part: I get to guess who's visiting my site. Here goes…"}
      </div>

      <div class="uk-child-width-expand@s uk-width-2-3@m" uk-grid>
        <Suspense fallback={<Spinner />}>
          <IP address={address || "1.1.1.1"} />
        </Suspense>
      </div>

      <div class="uk-child-width-expand@s uk-width-2-3@m" uk-grid>
        {userAgent && <UA userAgent={userAgent} />}
      </div>
    </div>
  );
});

app.get("", (c: Context) => c.redirect("/about/me"));

export default app;
