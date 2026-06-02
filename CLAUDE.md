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

### `/about/you` — IP & UA resolution

The `/about/you` route resolves visitor geo and User-Agent data through two separate paths:

**IP geolocation (two-stage):**
1. `getCFGeo(c, address, lang)` — extracts geo from Cloudflare's built-in CF properties (`c.req.raw.cf`). Always succeeds in production (CF properties are always set). Returns `null` for `mobile`, `proxy`, and `hosting` because Cloudflare does not expose these fields.
2. Falls back to `getIPInfo` → `api.cybai.re/ip/info` only when CF properties are absent (local dev). This path returns real `mobile/proxy/hosting` booleans.

**User-Agent parsing (two-stage):**
1. `getUserAgent` → `api.cybai.re/user-agent` (full UA-Parser.js parsing).
2. Falls back to `parseUABasic(uaString)` (local regex) on any fetch failure, so the page always renders something.

**`IPInfo` type note:** `mobile`, `proxy`, `hosting` are `boolean | null`. `null` means the CF geo path was used and the field is unavailable — not that the visitor is definitely not on a proxy. The `IPTable` component and `You` component both skip/ignore `null` values correctly.

### Routing pattern

Each page file exports a Hono app. Route handlers return JSX directly (the `renderer` middleware handles wrapping). Example:

```tsx
app.get("/", (c) => {
  return c.render(<HomePage lang={c.var.lang} />)
})
```

Special routes: `/teapot` (HTTP 418), `/rickroll`, `/fl@g.txt`, `/ctf` (CTF challenges).

## Version control

This project uses **jj (Jujutsu)** — not plain git. Use `jj` commands; don't run `git commit`, `git rebase`, etc. directly. Key workflow:

```bash
jj status               # working copy status
jj log                  # commit graph
jj describe -m "..."    # set message for current commit (@)
jj new                  # create a new empty commit on top of @
jj squash               # fold working copy changes into parent
jj rebase -d <target>   # rebase @ onto target
jj bookmark set <name>  # move a bookmark to @
jj git push --bookmark <name>  # push to origin
jj git fetch            # fetch from origin
```

The repo has two main bookmarks: `main` (production) and `dev` (development). PRs go `dev` → `main` on GitHub.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
