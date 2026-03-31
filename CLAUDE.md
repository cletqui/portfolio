# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Compile CSS once then start Vite dev server
npm run watch:css  # Watch and recompile CSS (run alongside dev in a second terminal for hot CSS)
npm run build      # Build for production (CSS + bundle mode + standard Vite build)
npm run preview    # Preview build locally via Cloudflare Pages (wrangler pages dev dist)
npm run deploy     # Build and deploy to Cloudflare Pages
npm run log        # Tail deployment logs
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

**No CDN dependencies** — all CSS is bundled at build time. Dark mode uses `@media (prefers-color-scheme: dark)` CSS variables only (no JS theme toggle).

### Request lifecycle

```
Request → logger → poweredBy → handleRedirect → handleLanguage → renderer → route handler
```

- `handleRedirect` (`src/utils/redirect.tsx`): normalizes `cybai.re` → `www.cybai.re`
- `handleLanguage` (`src/utils/language.tsx`): detects en/fr from URL path suffix, cookie, or `Accept-Language`; stores in context variable `lang` and a 30-day httpOnly cookie
- `renderer` (`src/utils/renderer.tsx`): wraps JSX output in the full HTML layout (Head + Header + Footer)

### Source layout

- **`src/index.tsx`** — app entry point; defines `Bindings`/`Variables` types, wires middleware and mounts sub-apps
- **`src/pages/`** — each file is a Hono sub-app mounted at a route prefix (`/`, `/about`, `/projects`, `/contact`)
- **`src/components/`** — shared JSX components (`head`, `header`, `footer`, `layout`, `error`, `wip`)
- **`src/utils/`** — middleware and helpers (`api`, `renderer`, `redirect`, `language`)

### i18n

Language is stored in Hono context as `c.var.lang` (set by `handleLanguage` middleware). Pages branch on this value to render English or French content inline within the same component. Use `toggleLanguage(lang)` from `src/utils/language.tsx` to produce the alternate language href.

### API calls

`src/utils/api.tsx` fetches visitor IP geolocation and User-Agent data from `api.cybai.re`. Results are cached in cookies to avoid redundant requests. This is used exclusively by the `/about/you` route.

### Routing pattern

Each page file exports a Hono app. Route handlers return JSX directly (the `renderer` middleware handles wrapping). Example:

```tsx
app.get("/", (c) => {
  return c.render(<HomePage lang={c.var.lang} />)
})
```

Special routes: `/teapot` (HTTP 418), `/rickroll`, `/fl@g.txt`, `/epochalypse`.
