import { html } from "hono/html";

interface SiteData {
  title: string;
  description?: string;
}

export const Head = (props: SiteData) =>
  html`<head>
    <meta charset="utf-8" />
    <meta name="description" content="${props.description || ""}" />
    <meta name="viewport" content="width=device-width" />
    <title>${props.title}</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="preconnect" href="https://rsms.me/" />
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />

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

    <link
      rel="stylesheet"
      href="https://unpkg.com/franken-ui/dist/css/core.min.css"
    />

    <script>
      const htmlElement = document.documentElement;

      if (
        localStorage.getItem("mode") === "dark" ||
        (!("mode" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        htmlElement.classList.add("dark");
      } else {
        htmlElement.classList.remove("dark");
      }

      htmlElement.classList.add(
        localStorage.getItem("theme") || "uk-theme-zinc"
      );
    </script>

    <script
      type="module"
      src="https://unpkg.com/franken-ui/dist/js/core.iife.js"
    ></script>
    <script
      type="module"
      src="https://unpkg.com/franken-ui/dist/js/icon.iife.js"
    ></script>
  </head>`;

/* source: https://github.com/franken-ui/template-html/blob/master/index.html */
