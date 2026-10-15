import { projects } from "../pages/projects";
import { contacts } from "../pages/contact";
import { EMAIL_ENC } from "../data/email";
import { PGP } from "./pgp";

export type PaletteItem = {
  label: string;
  group: string;
  hint?: string;
  href?: string;
  action?: "theme" | "lang";
  copy?: string;
  email?: string;
  external?: boolean;
};

export const paletteItems = (lang: string): PaletteItem[] => {
  const fr = lang === "fr";
  const pages = fr ? "Pages" : "Pages";
  return [
    { label: fr ? "Accueil" : "Home", group: pages, href: "/", hint: "~" },
    {
      label: fr ? "À propos" : "About me",
      group: pages,
      href: "/about/me",
      hint: "whoami",
    },
    {
      label: fr ? "De toi ?" : "About you",
      group: pages,
      href: "/about/you",
      hint: "fingerprint",
    },
    {
      label: fr ? "Projets" : "Projects",
      group: pages,
      href: "/projects",
      hint: "cd ~/projects",
    },
    { label: fr ? "En ce moment" : "Now", group: pages, href: "/now", hint: "/now" },
    { label: "CTF", group: pages, href: "/ctf", hint: "flags" },
    { label: "Contact", group: pages, href: "/contact", hint: "cd ~/contact" },
    ...projects
      .filter((p) => p.internal)
      .map((p) => ({
        label: p.name,
        group: fr ? "Projets" : "Projects",
        href: p.internal,
        hint: (p.href ?? "").replace(/^https?:\/\//, "").replace(/\/$/, ""),
      })),
    ...contacts
      .filter((c) => c.href && !c.href.startsWith("mailto:"))
      .map((c) => ({
        label: fr && c.nameFr ? c.nameFr : c.name,
        group: "Contact",
        href: c.href,
        external: true,
      })),
    {
      label: fr ? "Copier mon e-mail" : "Copy my email",
      group: "Actions",
      email: EMAIL_ENC,
    },
    {
      label: fr ? "Copier l'empreinte PGP" : "Copy my PGP fingerprint",
      group: "Actions",
      copy: PGP.fingerprint,
      hint: `0x${PGP.keyId}`,
    },
    {
      label: fr ? "Changer de thème" : "Toggle theme",
      group: "Actions",
      action: "theme" as const,
    },
    {
      label: fr ? "Passer en anglais" : "Switch to French",
      group: "Actions",
      action: "lang" as const,
    },
  ];
};
