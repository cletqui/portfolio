const STATIC: Record<string, string> = {
  "/": "home",
  "/about/me": "about-me",
  "/about/you": "about-you",
  "/projects": "projects",
  "/ctf": "ctf",
  "/contact": "contact",
  "/now": "now",
};

export const ogImage = (path: string) => {
  const clean = path.replace(/\/$/, "") || "/";
  return `/static/og/${STATIC[clean] ?? "home"}.png`;
};
