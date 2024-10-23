import { Context, Hono } from "hono";
import { getConnInfo } from "hono/cloudflare-workers";

import { queryUserAgent } from "../utils/api";

/* COMPONENTS */
const IP = ({ address }: { address: string }) => {
  return <div>IP address: {address}</div>;
};

const UserAgent = async ({ userAgent }: { userAgent: string }) => {
  // Use Suspense
  const data = await queryUserAgent(userAgent);
  return (
    <div>
      <div class="uk-section uk-section-default">
        <div class="uk-panel uk-margin-small uk-margin-left">
          <h3>User-Agent</h3>
        </div>

        <div class="uk-card uk-card-body uk-card-default">
          <table class="uk-table uk-table-divider">
            <thead>
              <tr>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Table Data</td>
                <td>Table Data</td>
                <td>Table Data</td>
              </tr>
              <tr>
                <td>Table Data</td>
                <td>Table Data</td>
                <td>Table Data</td>
              </tr>
              <tr>
                <td>Table Data</td>
                <td>Table Data</td>
                <td>Table Data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
      <h1 class="uk-heading-medium uk-heading-divider uk-margin">About</h1>
      <h2 class="uk-heading-small uk-margin">Me</h2>
    </div>
  )
);

app.get("/you", async (c: Context) => {
  const { "user-agent": userAgent } = c.req.header();
  const {
    remote: { address },
  } = getConnInfo(c);
  console.log(userAgent, address);
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <h1 class="uk-heading-medium uk-heading-divider uk-margin">About</h1>
      <h2 class="uk-heading-small uk-margin">you</h2>
      {address && <IP address={address} />}
      {userAgent && <UserAgent userAgent={userAgent} />}
    </div>
  );
});

export default app;
