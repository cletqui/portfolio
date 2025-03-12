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

    <noscript><style>body { visibility: visible; }</style></noscript>

    <style>
      :root {
        font-family: Inter, sans-serif;
        font-feature-settings: "liga" 1, "calt" 1; /* fix for Chrome */
      }
      @supports (font-variation-settings: normal) {
        :root {
          font-family: InterVariable, sans-serif;
        }
      }
    </style>

    <!-- For stability in production, it's recommended that you hardcode the latest version in the CDN link. -->

    <link rel="preconnect" href="https://unpkg.com" />
    <link
      rel="stylesheet"
      href="https://unpkg.com/franken-ui@1.1.0/dist/css/core.min.css"
    />

    <script>
      const htmlElement = document.documentElement;

      const __FRANKEN__ = JSON.parse(localStorage.getItem("__FRANKEN__") || "{}");

      if (
        __FRANKEN__.mode === "dark" ||
        (!__FRANKEN__.mode &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        htmlElement.classList.add("dark");
      } else {
        htmlElement.classList.remove("dark");
      }

      htmlElement.classList.add(__FRANKEN__.theme || "uk-theme-zinc");
      htmlElement.classList.add(__FRANKEN__.radii || "uk-radii-md");
      htmlElement.classList.add(__FRANKEN__.shadows || "uk-shadows-sm");
      htmlElement.classList.add(__FRANKEN__.font || "uk-font-sm");
      htmlElement.classList.add(__FRANKEN__.chart || "uk-chart-default");
    </script>

    <script
      type="module"
      src="https://unpkg.com/franken-ui@1.1.0/dist/js/core.iife.js"
    ></script>
    <script
      type="module"
      src="https://unpkg.com/franken-ui@1.1.0/dist/js/icon.iife.js"
    ></script>
  </head>`;

/* source: https://github.com/franken-ui/template-html/blob/master/index.html */
