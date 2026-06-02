# cybai.re — Portfolio

Personal portfolio and playground deployed on [Cloudflare Pages](https://pages.cloudflare.com/).  
Live at [www.cybai.re](https://www.cybai.re/).

## Stack

- **[Hono](https://hono.dev/)** — routing, middleware, JSX-based SSR
- **[Tailwind CSS v4](https://tailwindcss.com/)** — utility-first CSS compiled via `@tailwindcss/cli`
- **[Cloudflare Pages](https://pages.cloudflare.com/)** — edge deployment
- **[Cloudflare KV](https://developers.cloudflare.com/kv/)** — CTF flag validation

No client-side hydration. All rendering happens at the edge.

## Development

```bash
bun install
bun run dev        # CSS once + Vite dev server
bun run watch:css  # Hot CSS recompilation (second terminal)
```

> Version control uses [jj (Jujutsu)](https://github.com/jj-vcs/jj). Two bookmarks: `main` (production) and `dev` (development).

## Deployment

```bash
bun run build      # Production build
bun run preview    # Local preview via wrangler pages dev
bun run deploy     # Build + deploy to Cloudflare Pages
```

## CTF

Flags are hidden throughout the site and repository. Visit [/ctf](https://www.cybai.re/ctf) to track your progress.

Before deploying, create a KV namespace and seed the flags:

```bash
bunx wrangler kv namespace create CTF_FLAGS
# Replace ids in wrangler.toml, then:
bunx wrangler kv key put --namespace-id=<ID> 'cybai{...}' '{"id":"...","name":"...","points":0}'
```

<!-- cybai{H1dd3nInPl41n51gh7} -->
