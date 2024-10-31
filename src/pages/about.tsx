import { Context, Hono } from "hono";
import { getConnInfo } from "hono/cloudflare-workers";

import { queryIPInfo, IPInfo, queryUserAgent, UserAgent } from "../utils/api";
import { Title } from "../components/layout";

/* COMPONENTS */
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

const IPTable = ({ info }: { info: IPInfo }) => {
  return (
    <ul class="uk-list uk-list-divider">
      <li class="uk-flex uk-flex-middle">
        <uk-icon icon="earth" class="uk-margin-small-right uk-text-muted" />
        <p class="uk-text-muted uk-margin-small-right">Continent:</p>
        {info.continent}
      </li>
      <li class="uk-flex uk-flex-middle">
        <uk-icon icon="map-pin" class="uk-margin-small-right uk-text-muted" />
        <p class="uk-text-muted uk-margin-small-right">Country:</p>
        {info.countryName}
      </li>
      <li class="uk-flex uk-flex-middle">
        <uk-icon
          icon="map-pin-house"
          class="uk-margin-small-right uk-text-muted"
        />
        <p class="uk-text-muted uk-margin-small-right">City:</p>
        {info.cityName}
      </li>
      <li class="uk-flex uk-flex-middle">
        <uk-icon icon="router" class="uk-margin-small-right uk-text-muted" />
        <p class="uk-text-muted uk-margin-small-right">Proxy:</p>
        {new String(info.isProxy)}
      </li>
    </ul>
  );
};

const IP = async ({ address }: { address: string }) => {
  const info = await queryIPInfo(address);
  const { latitude, longitude } = info;
  return (
    <div class="uk-section uk-section-default">
      <div class="uk-panel uk-margin-small uk-margin-left">
        <h3 class="uk-h3 uk-heading-bullet">IP</h3>
        <code class="uk-codespan">{address}</code>

        <div class="uk-child-width-expand@s" uk-grid>
          <div class="uk-padding-medium">
            <IPTable info={info} />
          </div>
          <OpenStreetMap latitude={latitude} longitude={longitude} />
        </div>
      </div>
    </div>
  );
};

const UATable = ({ ua }: { ua: UserAgent }) => {
  return (
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
};

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
app.get("/", (c: Context) => c.redirect("/me"));

app.get("/me", (c: Context) =>
  c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>About me</Title>
      <div>
        I'm a french cybersecurity engineer with a deep love for technology,
        solving problems, and, of course, secure code. My background in Computer
        Science & Cybersecurity and professional experience has been all about
        defending, designing, and optimizing digital experiences.
      </div>
      <div>
        Technical skills I'm proud of: network security, penetration testing,
        Python, JavaScript, HTML/CSS, SQL and a whole toolbox of cybersecurity
        frameworks. Come check my GitHub profile for even more details.
      </div>
      <div>Academic: </div>
      <div>Passions: </div>
    </div>
  )
);

app.get("/you", async (c: Context) => {
  // TODO use Suspense
  const { "user-agent": userAgent } = c.req.header();
  const {
    remote: { address },
  } = getConnInfo(c);
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>About you</Title>
      <div class="uk-text-meta">
        Now here's the fun part: I get to guess who's visiting my site. Here
        goes…
      </div>

      <div class="uk-child-width-expand@s uk-width-2-3@m" uk-grid>
        {address && <IP address={address} />}
        <IP address="162.10.209.81" />
      </div>
      <div class="uk-child-width-expand@s uk-width-2-3@m" uk-grid>
        {userAgent && <UA userAgent={userAgent} />}
      </div>
    </div>
  );
});

export default app;
