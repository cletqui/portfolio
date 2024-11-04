import { Context, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { accepts } from "hono/accepts";

import { Bindings, Variables } from "..";

const setLanguage = (
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  lang: string
) => {
  setCookie(c, "lang", lang, {
    secure: true,
    httpOnly: true,
    sameSite: "Strict",
  });
};

export const toggleLanguage = (lang: string) => {
  return lang === "en" ? "fr" : "en";
};

export const handleLanguage = createMiddleware(
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ) => {
    const { path } = c.req;
    const splitted = path.split("/");
    const end = splitted.pop();
    if (c.env.SUPPORTS.includes(end || "")) {
      setLanguage(c, end || "en");
      return c.redirect(splitted.length > 1 ? splitted.join("/") : "/");
    }
    const cookie = getCookie(c, "lang");
    const { SUPPORTS } = c.env;
    const accept = accepts(c, {
      header: "Accept-Language",
      supports: SUPPORTS,
      default: "en",
    });
    const lang = cookie && SUPPORTS.includes(cookie) ? cookie : accept;
    if (!cookie) {
      setLanguage(c, lang);
    }
    c.set("lang", lang);
    await next();
  }
);
