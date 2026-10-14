import { html } from "hono/html";
import { useNonce } from "../utils/security";
import { asset } from "../utils/assets";

const themeInitScript = `(function(){var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.className=t})();`;

const speculationRules = JSON.stringify({
  prefetch: [
    {
      where: {
        and: [
          { href_matches: "/*" },
          {
            not: {
              or: [
                { href_matches: ["/en", "/fr", "/*/en", "/*/fr"] },
                { href_matches: ["/teapot", "/rickroll", "/*.txt", "/*.vcf", "/*.ics", "/ctf/submit"] },
                { selector_matches: "[rel~=nofollow]" },
              ],
            },
          },
        ],
      },
      eagerness: "moderate",
    },
  ],
});

export const Head = ({
  title,
  description,
  canonical,
  image,
  lang,
}: {
  title: string;
  description: string;
  canonical: string;
  image: string;
  lang: string;
}) => {
  const nonce = useNonce();
  return (
    <head>
      {html`<!-- cybai{4lw4y5Ch3ck50urc3C0d3} -->`}
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="cybai.re" />
      <meta property="og:locale" content={lang === "fr" ? "fr_FR" : "en_US"} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <meta
        name="theme-color"
        media="(prefers-color-scheme: light)"
        content="#ffffff"
      />
      <meta
        name="theme-color"
        media="(prefers-color-scheme: dark)"
        content="#242424"
      />

      <link rel="icon" type="image/x-icon" href="/static/favicon.ico" />
      <link rel="apple-touch-icon" href="/static/avatar.png" />
      <link rel="manifest" href="/.well-known/manifest.webmanifest" />
      <link
        rel="preload"
        as="font"
        type="font/woff2"
        href="/static/fonts/inter-latin-wght-normal.woff2"
        crossorigin="anonymous"
      />
      <link rel="stylesheet" href={asset("/styles.css")} />
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: themeInitScript }}
      />
      <script src={asset("/static/site.js")} defer nonce={nonce} />
      <script
        type="speculationrules"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: speculationRules }}
      />
    </head>
  );
};
