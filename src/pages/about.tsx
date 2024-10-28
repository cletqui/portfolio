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
  );
};

const IPTable = ({ info }: { info: IPInfo }) => {
  return (
    <table class="uk-margin uk-table uk-table-small uk-table-divider">
      <thead>
        <th class="uk-table-shrink uk-text-nowrap"></th>
        <th class="uk-text-nowrap"></th>
      </thead>
      <tbody>
        <tr>
          <td>
            <uk-icon icon="network" />
          </td>
          <td>{info.ipAddress}</td>
        </tr>
        <tr>
          <td>
            <uk-icon icon="earth" />
          </td>
          <td>{info.continent}</td>
        </tr>
        <tr>
          <td>
            <uk-icon icon="map-pin" />
          </td>
          <td>{info.countryName}</td>
        </tr>
        <tr>
          <td>
            <uk-icon icon="map-pin-house" />
          </td>
          <td>{info.cityName}</td>
        </tr>
        <tr>
          <td>
            <uk-icon icon="router" />
          </td>
          <td>{info.isProxy ? "proxy" : "not a proxy"}</td>
        </tr>
      </tbody>
    </table>
  );
};

const IP = async ({ address }: { address: string }) => {
  const info = await queryIPInfo(address);
  const { latitude, longitude } = info;
  return (
    <div class="uk-section uk-section-default">
      <div class="uk-panel uk-margin-small uk-margin-left">
        <h3 class="uk-h3">IP</h3>
        <p class="uk-text-muted">{address}</p>

        <div class="uk-child-width-expand@s" uk-grid>
          <IPTable info={info} />
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
        <h3 class="uk-h3">User-Agent</h3>
        <p class="uk-text-muted">{ua.ua}</p>
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
    </div>
  )
);

app.get("/you", async (c: Context) => {
  // TODO use Suspense
  const { "user-agent": userAgent } = c.req.header();
  const {
    remote: { address },
  } = getConnInfo(c);
  console.log(userAgent, address);
  const ip = "162.10.209.81";
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>About you</Title>

      {ip && <IP address={ip} />}
      {userAgent && <UA userAgent={userAgent} />}
    </div>
  );
});

export default app;
