# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev        # Compile CSS once then start Vite dev server
bun run watch:css  # Watch and recompile CSS (run alongside dev in a second terminal for hot CSS)
bun run build      # Build for production (CSS + bundle mode + standard Vite build)
bun run preview    # Preview build locally via Cloudflare Pages (wrangler pages dev dist)
bun run deploy     # Build and deploy to Cloudflare Pages
bun run log        # Tail deployment logs
```

There are no tests in this project.

## Architecture

This is a **server-side rendered personal portfolio** built with [Hono](https://hono.dev/) (JSX-based SSR) deployed on **Cloudflare Pages** (edge workers). There is no client-side hydration — all rendering happens at the edge.

**Stack:**
- **Hono** — routing, middleware, JSX rendering
- **Hono JSX** — React-like JSX configured via `tsconfig.json` (`jsxImportSource: "hono/jsx"`)
- **Tailwind CSS v4** — utility-first CSS, compiled to `public/styles.css` via `@tailwindcss/cli`. shadcn/zinc design tokens defined in `src/styles.css`.
- **lucide-static** — inline SVG icons imported via `?raw` in `src/utils/icons.tsx`
- **Vite** — build tool with `@hono/vite-cloudflare-pages` and `@hono/vite-build` plugins
- **Wrangler** — Cloudflare CLI for deployment/preview
- **Cloudflare KV** (`CTF_FLAGS` binding) — stores CTF flag definitions; required for `/ctf/submit`

**No CDN dependencies** — all CSS is bundled at build time. Dark mode is driven by `@media (prefers-color-scheme: dark)` CSS variables, with a JS theme toggle (`ThemeToggle` in `header.tsx`) that persists the user's choice in `localStorage` and applies a `light`/`dark` class to `<html>`.

### Request lifecycle

```
Request → logger → poweredBy → handleRedirect → handleLanguage → renderer → route handler
```

- `handleRedirect` (`src/utils/redirect.tsx`): normalizes `cybai.re` → `www.cybai.re`
- `handleLanguage` (`src/utils/language.tsx`): detects en/fr from URL path suffix, cookie, or `Accept-Language`; stores in context variable `lang` and a 30-day httpOnly cookie
- `renderer` (`src/utils/renderer.tsx`): wraps JSX output in the full HTML layout (Head + Header + Footer)

### Source layout

- **`src/index.tsx`** — app entry point; defines `Bindings` (`CTF_FLAGS: KVNamespace`) / `Variables` (`lang: string`) types, wires middleware and mounts sub-apps
- **`src/pages/`** — each file is a Hono sub-app mounted at a route prefix (`/`, `/about`, `/projects`, `/contact`, `/ctf`)
- **`src/components/`** — shared JSX components (`head`, `header`, `footer`, `layout`, `error`, `wip`)
- **`src/utils/`** — middleware and helpers (`api`, `renderer`, `redirect`, `language`)

### i18n

Language is stored in Hono context as `c.var.lang` (set by `handleLanguage` middleware). Supported languages are defined in `SUPPORTED` constant in `src/utils/language.tsx`. Pages branch on this value to render English or French content inline within the same component. Use `toggleLanguage(lang)` from `src/utils/language.tsx` to produce the alternate language href.

The translate link appends the target language as a URL suffix (e.g. `/about/me/fr`). The middleware detects it, sets the cookie, and redirects to the clean path.

### CTF

`/ctf` is a capture-the-flag page. 9 challenges are listed, with flags hidden across the site, repository, and DNS. Flag validation uses `POST /ctf/submit` → KV lookup. Scores are tracked client-side in localStorage. KV is not available in `bun run dev` (Vite); use `bun run preview` (wrangler) to test flag submission.

KV entry format: key = flag string (e.g. `cybai{...}`), value = `{"id":"challenge_id","name":"Challenge Name","points":100}`.

### API calls

`src/utils/api.tsx` fetches visitor IP geolocation and User-Agent data from `api.cybai.re`. Results are cached in cookies to avoid redundant requests. This is used exclusively by the `/about/you` route.

### Routing pattern

Each page file exports a Hono app. Route handlers return JSX directly (the `renderer` middleware handles wrapping). Example:

```tsx
app.get("/", (c) => {
  return c.render(<HomePage lang={c.var.lang} />)
})
```

Special routes: `/teapot` (HTTP 418), `/rickroll`, `/fl@g.txt`, `/ctf` (CTF challenges).

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
