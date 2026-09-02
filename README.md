# cybai.re — Portfolio

Personal portfolio and playground deployed on [Cloudflare Pages](https://pages.cloudflare.com/).  
Live at [www.cybai.re](https://www.cybai.re/).

## Stack

- **[Hono](https://hono.dev/)** — routing, middleware, JSX-based SSR
- **[Tailwind CSS v4](https://tailwindcss.com/)** — utility-first CSS compiled via `@tailwindcss/cli`
- **[Cloudflare Pages](https://pages.cloudflare.com/)** — edge deployment
- **[Cloudflare KV](https://developers.cloudflare.com/kv/)** — CTF flag validation (`CTF_FLAGS` binding)

No client-side hydration. All rendering happens at the edge. English/French i18n via URL suffix, cookie, or `Accept-Language`.

## Development

```bash
bun install
bun run dev        # CSS once + Vite dev server
bun run watch:css  # Hot CSS recompilation (second terminal)
bun run build      # Production build
bun run preview    # Local preview via wrangler pages dev (KV available here, not in dev)
bun run deploy     # Build + deploy to Cloudflare Pages
```

> CSS is compiled separately from the JS bundle — run `bun run build:css` if styles don't update after `bun run build`.

> Version control uses [jj (Jujutsu)](https://github.com/jj-vcs/jj). Two bookmarks: `main` (production) and `dev` (development).

> KV is not available in `bun run dev` (Vite). Use `bun run preview` (wrangler) to test flag submission.

## CTF

Flags are hidden throughout the site, its HTTP headers, DNS records, and this repository. Visit [/ctf](https://www.cybai.re/ctf) to track progress — 15 challenges, 1825 pts total.

KV entry format: key = flag string, value = `{"id":"challenge_id","name":"Challenge Name","points":N}`.

Seeding commands and flag values are kept in `FLAGS.md` (gitignored).

<!-- cybai{H1dd3nInPl41n51gh7} -->
