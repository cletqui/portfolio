import { html } from "hono/html";

export const Head = ({
  title,
  description = "",
}: {
  title: string;
  description?: string;
}) =>
  html`<head>
    <!-- 4lw4y5Ch3ck50urc3C0d3 -->
    <meta charset="UTF-8" />
    <meta name="description" content="${description}" />
    <meta name="viewport" content="width=device-width" />
    <title>${title}</title>
    <link rel="icon" type="image/x-icon" href="/static/favicon.ico" />
    <link rel="manifest" href="/.well-known/manifest.webmanifest" />
    <link rel="text/plain" href="/.well-known/robots.txt" />
    <link rel="preconnect" href="https://rsms.me/" />
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    <link rel="stylesheet" href="/styles.css" />
  </head>`;
