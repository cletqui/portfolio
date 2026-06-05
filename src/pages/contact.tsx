import { Context, Hono } from "hono";

import { Title, Button } from "../components/layout";

/* GLOBAL CONSTANTS */
export const contacts = [
  {
    name: "BlueSky",
    href: "https://bsky.app/profile/cybai.re",
    icon: "earth",
    style: "primary",
  },
  {
    name: "GitHub",
    href: "https://github.com/cletqui/",
    icon: "github",
    style: "primary",
  },
  {
    name: "GitLab",
    href: "https://gitlab.com/cletqui/",
    icon: "gitlab",
    style: "primary",
  },
  {
    name: "Keybase",
    href: "https://keybase.io/clet",
    icon: "file-key",
    style: "secondary",
  },
  {
    name: "GPG key",
    href: "https://keybase.io/clet/pgp_keys.asc",
    icon: "key",
    style: "secondary",
  },
  {
    name: "Mail",
    href: "mailto:admin@cybai.re",
    icon: "mail",
    style: "secondary",
  },
  {
    name: "Map",
    href: "https://www.openstreetmap.org/#map=19/48.673657/-3.913592",
    icon: "map-pin",
    style: "secondary",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    style: "secondary",
    tooltip: "❔ ➡️ 📧",
  },
];

/* APP */
const app = new Hono<{}>();

app.get("", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="mx-auto max-w-3xl px-4 py-12 flex flex-col items-center">
      <Title>{lang === "fr" ? "Connectons-nous !" : "Let's connect!"}</Title>

      <p class="text-muted-foreground text-center mb-8 max-w-lg">
        {lang === "fr"
          ? "Si vous souhaitez discuter de quoi que ce soit, si vous avez une question sur un projet ou si vous voulez simplement dire bonjour, n'hésitez pas à me contacter !"
          : "If you're interested in talking about anything, have a question about a project, or just want to say hello, I'd love to hear from you!"}
      </p>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-8">
        {contacts.map(({ name, icon, href, style, tooltip }) => (
          <Button
            text={name}
            href={href}
            icon={icon}
            style={style}
            tooltip={tooltip}
            external
          />
        ))}
      </div>

      <p class="text-sm text-muted-foreground text-center">
        {lang === "fr" ? "Je suis les " : "I follow "}
        <a
          class="text-foreground font-medium"
          href="http://sl4.org/crocker.html"
        >
          {lang === "fr" ? "règles de Crocker" : "Crocker's rules"}
        </a>
        {lang === "fr"
          ? " donc pas besoin de faire des excès de diplomatie."
          : ", so there's no need to be overly diplomatic."}
      </p>
    </div>,
  );
});

export default app;
