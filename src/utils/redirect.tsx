import { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";

export const handleRedirect = createMiddleware(
  async (c: Context, next: Next) => {
    const url = new URL(c.req.url);
    if (url.hostname === "cybai.re") {
      url.hostname = "www." + url.hostname;
      url.protocol = "https:";
      return c.redirect(url.toString(), 301);
    }
    await next();
  },
);
