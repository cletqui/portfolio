# cybai.re — Portfolio

Personal portfolio and playground deployed on [Cloudflare Pages](https://pages.cloudflare.com/).  
Live at [www.cybai.re](https://www.cybai.re/).

## Stack

- **[Hono](https://hono.dev/)** — routing, middleware, JSX-based SSR
- **[Tailwind CSS v4](https://tailwindcss.com/)** — utility-first CSS compiled via `@tailwindcss/cli`
- **[Cloudflare Pages](https://pages.cloudflare.com/)** — edge deployment

No client-side hydration. All rendering happens at the edge. English/French i18n via URL suffix, cookie, or `Accept-Language`.

## Development

```bash
bun install
bun run dev        # CSS once + Vite dev server
bun run watch:css  # Hot CSS recompilation (second terminal)
bun run build      # Production build
bun run preview    # Local preview via wrangler pages dev
bun run deploy     # Build + deploy to Cloudflare Pages
```

> CSS is compiled separately from the JS bundle — run `bun run build:css` if styles don't update after `bun run build`.

> Version control uses [jj (Jujutsu)](https://github.com/jj-vcs/jj). Two bookmarks: `main` (production) and `dev` (development).

## CTF

Flags are hidden throughout the site, its HTTP headers, DNS records, and this repository. Visit [/ctf](https://www.cybai.re/ctf) to track progress — 35 challenges, 4275 pts total.

<!-- cybai{H1dd3nInPl41n51gh7} -->
