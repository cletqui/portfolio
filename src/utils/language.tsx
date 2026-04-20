import { Context, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { accepts } from "hono/accepts";

import { Bindings, Variables } from "..";

const SUPPORTED = ["en", "fr"] as const;
type Language = (typeof SUPPORTED)[number];

const isLang = (s: string | undefined): s is Language =>
  SUPPORTED.includes(s as Language);

const setLangCookie = (
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  lang: Language,
) =>
  setCookie(c, "lang", lang, {
    secure: true,
    httpOnly: true,
    maxAge: 2628000,
    sameSite: "Strict",
  });

export const toggleLanguage = (lang: string): Language =>
  lang === "en" ? "fr" : "en";

export const handleLanguage = createMiddleware(
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next,
  ) => {
    const parts = c.req.path.split("/");
    const last = parts[parts.length - 1];

    if (isLang(last)) {
      setLangCookie(c, last);
      return c.redirect(parts.slice(0, -1).join("/") || "/");
    }

    const cookie = getCookie(c, "lang");
    const accept = accepts(c, {
      header: "Accept-Language",
      supports: [...SUPPORTED],
      default: "en",
    });

    const lang = (isLang(cookie) ? cookie : accept) as Language;

    if (!isLang(cookie)) setLangCookie(c, lang);

    c.set("lang", lang);
    await next();
  },
);
