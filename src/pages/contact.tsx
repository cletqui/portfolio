import { Context, Hono } from "hono";
import { Env } from "..";

import { Title } from "../components/layout";
import { Icon } from "../utils/icons";
import { EMAIL_ENC, EMAIL_MASKED, emailAddress } from "../data/email";
import { PGP } from "../utils/pgp";
import { PHONE, PHONE_TEL } from "../data/phone";

/* GLOBAL CONSTANTS */
type ContactGroup = "reach" | "code" | "secure";

export const contacts: {
  name: string;
  nameFr?: string;
  href?: string;
  email?: boolean;
  icon: string;
  style: string;
  handle?: string;
  group: ContactGroup;
  tooltip?: string;
}[] = [
  {
    name: "BlueSky",
    href: "https://bsky.app/profile/cybai.re",
    icon: "earth",
    style: "primary",
    handle: "@cybai.re",
    group: "reach",
  },
  {
    name: "Mail",
    email: true,
    icon: "mail",
    style: "secondary",
    handle: EMAIL_MASKED,
    group: "reach",
  },
  {
    name: "Phone",
    nameFr: "Téléphone",
    href: PHONE_TEL,
    icon: "phone",
    style: "secondary",
    handle: PHONE,
    group: "reach",
    tooltip: "Have you tried turning it off and on again?",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    style: "secondary",
    handle: "❔ ➡️ 📧",
    group: "reach",
    tooltip: "❔ ➡️ 📧",
  },
  {
    name: "GitHub",
    href: "https://github.com/cletqui/",
    icon: "github",
    style: "primary",
    handle: "github.com",
    group: "code",
  },
  {
    name: "GitLab",
    href: "https://gitlab.com/cletqui/",
    icon: "gitlab",
    style: "primary",
    handle: "gitlab.com",
    group: "code",
  },
  {
    name: "Keybase",
    href: "https://keybase.io/clet",
    icon: "file-key",
    style: "secondary",
    handle: "keybase.io",
    group: "secure",
  },
  {
    name: "GPG key",
    nameFr: "Clé GPG",
    href: "/pgp.asc",
    icon: "key",
    style: "secondary",
    handle: `0x${PGP.keyId}`,
    group: "secure",
  },
  {
    name: "Map",
    nameFr: "Carte",
    href: "https://www.openstreetmap.org/#map=19/48.673657/-3.913592",
    icon: "map-pin",
    style: "secondary",
    handle: "OpenStreetMap",
    group: "code",
  },
];

const GROUPS: { id: ContactGroup; icon: string; label: [string, string] }[] = [
  { id: "reach", icon: "mail", label: ["Say hello", "Dire bonjour"] },
  { id: "code", icon: "code-xml", label: ["Code & places", "Code & lieux"] },
  { id: "secure", icon: "shield-check", label: ["Secure contact", "Contact sécurisé"] },
];

const VCARD = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  "FN:cybai.re",
  "TITLE:Cybersecurity engineer & full-stack developer",
  `EMAIL;TYPE=INTERNET:${emailAddress()}`,
  `TEL;TYPE=VOICE:${PHONE}`,
  "URL:https://www.cybai.re",
  "URL;TYPE=GitHub:https://github.com/cletqui",
  "END:VCARD",
  "",
].join("\r\n");

const ContactRow = ({
  name,
  nameFr,
  href,
  email,
  icon,
  handle,
  tooltip,
  lang,
}: (typeof contacts)[number] & { lang: string }) => {
  const inner = (
    <>
      <Icon name={icon} size={16} class="text-muted-foreground" />
      <span class="min-w-0 flex-1">
        <span class="block text-sm font-medium">
          {lang === "fr" && nameFr ? nameFr : name}
        </span>
        {handle && (
          <span
            class="block truncate font-mono text-xs text-muted-foreground"
            {...(email ? { "data-email": EMAIL_ENC, "data-email-text": "{}" } : {})}
          >
            {handle}
          </span>
        )}
      </span>
      {(href || email) && (
        <Icon
          name={email ? "mail" : "external-link"}
          size={13}
          class="text-muted-foreground/50 transition-colors group-hover:text-foreground"
        />
      )}
    </>
  );
  if (email)
    return (
      <a
        href="/contact"
        data-email={EMAIL_ENC}
        title={tooltip}
        class="group flex items-center gap-3 rounded-md px-3 py-2.5 no-underline! transition-colors hover:bg-accent hover:no-underline!"
      >
        {inner}
      </a>
    );
  return href ? (
    <a
      href={href}
      {...(href.startsWith("tel:")
        ? {}
        : { target: "_blank", rel: "noopener noreferrer" })}
      title={tooltip}
      class="group flex items-center gap-3 rounded-md px-3 py-2.5 no-underline! transition-colors hover:bg-accent hover:no-underline!"
    >
      {inner}
    </a>
  ) : (
    <div
      title={tooltip}
      class="flex items-center gap-3 rounded-md px-3 py-2.5 opacity-60"
    >
      {inner}
    </div>
  );
};

/* APP */
const app = new Hono<Env>();

app.get("/contact.vcf", (c: Context<Env>) =>
  c.body(VCARD, 200, {
    "Content-Type": "text/vcard; charset=utf-8",
    "Content-Disposition": 'attachment; filename="cybai.vcf"',
  }),
);

app.get("", (c: Context<Env>) => {
  const { lang } = c.var;
  const fr = lang === "fr";
  return c.render(
    <div class="mx-auto max-w-5xl px-4 py-12">
      <div class="flex flex-col items-center mb-8">
        <Title>{fr ? "Connectons-nous !" : "Let's connect!"}</Title>
        <p class="max-w-lg text-center text-muted-foreground">
          {fr
            ? "Si vous souhaitez discuter de quoi que ce soit, si vous avez une question sur un projet ou si vous voulez simplement dire bonjour, n'hésitez pas à me contacter !"
            : "If you're interested in talking about anything, have a question about a project, or just want to say hello, I'd love to hear from you!"}
        </p>
      </div>

      <div class="card-primary mb-8 flex flex-wrap items-center gap-4">
        <Icon name="mail" size={22} />
        <div class="min-w-0 flex-1">
          <div class="text-xs opacity-60">
            {fr ? "La voie la plus directe" : "The most direct way"}
          </div>
          <a
            href="/contact"
            data-email={EMAIL_ENC}
            data-email-text="{}"
            class="font-mono text-lg no-underline! hover:underline!"
          >
            {EMAIL_MASKED}
          </a>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="btn btn-secondary"
            data-copy-email={EMAIL_ENC}
            data-copied={fr ? "Copié !" : "Copied!"}
          >
            <Icon name="link" size={14} />
            <span>{fr ? "Copier" : "Copy"}</span>
          </button>
          <a href="/contact/contact.vcf" class="btn btn-secondary" download>
            <Icon name="book-user" size={14} />
            <span>vCard</span>
          </a>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3 items-start">
        {GROUPS.map((g) => (
          <div class="card space-y-1 p-3">
            <h3 class="flex items-center gap-2 px-3 pb-2 pt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <Icon name={g.icon} size={12} />
              {g.label[fr ? 1 : 0]}
            </h3>
            {contacts
              .filter((ct) => ct.group === g.id)
              .map((ct) => (
                <ContactRow {...ct} lang={lang} />
              ))}
            {g.id === "secure" && (
              <>
                <a
                  href="/.well-known/security.txt"
                  class="group flex items-center gap-3 rounded-md px-3 py-2.5 no-underline! transition-colors hover:bg-accent hover:no-underline!"
                >
                  <Icon
                    name="bug"
                    size={16}
                    class="text-muted-foreground"
                  />
                  <span class="min-w-0 flex-1">
                    <span class="block text-sm font-medium">security.txt</span>
                    <span class="block truncate font-mono text-xs text-muted-foreground">
                      {fr ? "signaler une faille" : "report a vulnerability"}
                    </span>
                  </span>
                </a>
              </>
            )}
          </div>
        ))}
      </div>

      <div class="card mt-4 space-y-4">
        <h3 class="flex items-center gap-2 text-sm font-semibold">
          <Icon name="key" size={14} class="text-muted-foreground" />
          <a
            href="https://chiffrer.info"
            target="_blank"
            rel="noopener noreferrer"
            title={fr ? "On dit chiffrer, pas crypter" : "Chiffrer, not crypter"}
            class="no-underline! hover:no-underline!"
          >
            {fr ? "Chiffrer ton message" : "Encrypt your message"}
          </a>
        </h3>
        <div class="space-y-1">
          <div class="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {fr ? "Empreinte PGP" : "PGP fingerprint"}
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <code class="break-all font-mono text-sm tracking-wide">
              {PGP.fingerprint.replace(/(.{4})/g, "$1 ").trim()}
            </code>
            <button
              type="button"
              class="btn btn-secondary"
              data-copy={PGP.fingerprint}
              data-copied={fr ? "Copié !" : "Copied!"}
            >
              <Icon name="link" size={14} />
              <span>{fr ? "Copier" : "Copy"}</span>
            </button>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <a href="/pgp.asc" class="btn btn-secondary" download>
            <Icon name="key" size={14} />
            <span>{fr ? "Télécharger la clé" : "Download the key"}</span>
          </a>
          <a
            href={PGP.keybase.replace("/pgp_keys.asc", "")}
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-secondary"
          >
            <Icon name="file-key" size={14} />
            <span>Keybase</span>
          </a>
        </div>
        <p class="text-xs text-muted-foreground">
          {fr
            ? "Ou laisse GnuPG la trouver (WKD) : "
            : "Or let GnuPG find it (WKD): "}
          <code class="font-mono text-foreground">
            gpg --locate-keys{" "}
            <span data-email={EMAIL_ENC} data-email-text="{}">
              {EMAIL_MASKED}
            </span>
          </code>
        </p>
      </div>

      <p class="mt-8 text-center text-sm text-muted-foreground">
        {fr ? "Je suis les " : "I follow "}
        <a
          class="font-medium text-foreground"
          href="http://sl4.org/crocker.html"
        >
          {fr ? "règles de Crocker" : "Crocker's rules"}
        </a>
        {fr
          ? " donc pas besoin de faire des excès de diplomatie."
          : ", so there's no need to be overly diplomatic."}
      </p>
    </div>,
    {
      title: "Contact",
      description: fr
        ? "Me contacter — BlueSky, GitHub, GitLab, Keybase, e-mail, GPG."
        : "Get in touch — BlueSky, GitHub, GitLab, Keybase, email, GPG.",
    },
  );
});

export default app;
