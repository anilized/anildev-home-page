# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (hot reload)
npm run build      # Type-check with tsc, then build with Vite
npm run preview    # Preview the production build locally
```

There are no tests in this project.

## Architecture

Single-page React app with a minimal flat file structure — everything lives in `src/`:

- **`siteConfig.ts`** — Single source of truth for all personalizable content: `creatorName`, `tagline`, `youtubeChannelId`, and social `links` (tiktok, youtube, instagram, kick). Change this file to repurpose the page for a different creator.
- **`App.tsx`** — The entire UI in one component. Defines `socialCards` (static array mapping social platforms to groups), fetches the latest YouTube long-form video on mount via the `rss2json` API, and renders everything.
- **`analytics.ts`** — Lazy GA4 bootstrap: loads the gtag script dynamically only when `VITE_GA_MEASUREMENT_ID` is set. `initAnalytics()` is called once in `main.tsx`. Use `trackEvent(name, params)` to fire events anywhere.
- **`index.css`** — Tailwind 4 import + hand-written CSS for the neon/cyber theme. Custom classes: `.glass-panel`, `.title-font`, `.neon-text`, `.enter-up`, `.delay-{1-5}`.

## Key Details

**Base path:** Vite is configured without an explicit `base` in `vite.config.ts` (defaults to `/` for dev). The Docker build sets `--base=/links/` via the `APP_BASE_PATH` build arg, so the production app is served at `anildev.io/links/`. When building locally for a non-root path, pass `--base`:
```bash
npx vite build --base=/links/
```

**YouTube feed:** Latest video is fetched from `api.rss2json.com` using the channel's Atom feed. Shorts are filtered by checking for `/shorts/` in the URL or `#shorts` in the title. Only `watch?v=` and `youtu.be/` links are considered long-form.

**GA4 env var:** Create `.env.local` with `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` to enable analytics in dev. Without this var, all `trackEvent` calls are silently no-ops.

**Tracked events:** `page_view`, `outbound_click` (social cards, "Kanala Git" button, latest video link), `latest_video_loaded`, `latest_video_load_failed`.

**Docker:** Multi-stage build — Node 22 Alpine builds the app, Nginx 1.29 Alpine serves it. Static files land in `/usr/share/nginx/html/links`. The nginx config redirects `/links` → `/links/` and falls back to `index.html` for SPA routing.

**Styling:** Tailwind CSS 4 via `@tailwindcss/vite` plugin (no `tailwind.config.js` needed). Fonts: "Oxanium" (body), "Press Start 2P" (`.title-font` headings) — both loaded from Google Fonts. Color palette is neon-green on near-black backgrounds defined via CSS `--bg-*` variables in `:root`.
