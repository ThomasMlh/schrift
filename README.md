# Schrift

Front-end of the Schrift project: guild tracking, characters, score cycles/rotations, and admin tooling for a mobile game. React + TypeScript + Vite, deployed as a static bundle (cPanel via rsync) and consuming the [Schrift API](../schrift-api).

Can also run as a **Discord Activity** (automatic Discord login inside the Discord client's iframe) in addition to the regular web OAuth flow — see `src/activity/`.

## Stack

- React 19 + TypeScript, Vite 7
- Chakra UI (theme + components) + Framer Motion
- React Router (data routing, lazy-loaded pages)
- SWR for data fetching (`src/hooks/api/`)
- i18next (fr/en, `src/locales/`)
- `@discord/embedded-app-sdk` for Discord Activity mode

## Getting started

```bash
pnpm install
cp .env.example .env   # then fill in the values
pnpm dev                # http://localhost:5173
```

### Environment variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the Schrift API |
| `VITE_DISCORD_CLIENT_ID` | Discord application client ID (OAuth + Activity) |
| `VITE_DISCORD_REDIRECT_URI` | Discord OAuth redirect URI |
| `VITE_BUCKET_URL` | Asset bucket URL (character images, banners...) |

The Discord `CLIENT_SECRET` must never be exposed on the front-end — it stays on the API side.

## Scripts

| Script | Effect |
|---|---|
| `pnpm dev` | Vite dev server |
| `pnpm build` | `tsc -b` + Vite build + prerender (`scripts/prerender.js`), preceded by sitemap generation |
| `pnpm lint` | ESLint |
| `pnpm preview` | Serves the production build locally |
| `pnpm sitemap` | Regenerates `sitemap.xml` (`scripts/generate-sitemap.js`) |

## Structure

```
src/
  pages/            # one page per route (lazy-loaded in MainRouter.tsx)
  components/        # shared components + per-domain subfolders (draft, guild, user, ocr, ...)
  hooks/api/          # read hooks with SWR (one file per domain: useGuilds, useUsers, ...)
  hooks/mutations/    # mutation hooks (POST/PATCH/DELETE) per domain
  providers/          # AuthProvider (session/JWT), APIProvider
  activity/           # Discord Activity integration (auto login in iframe)
  interfaces.ts       # shared types (IUser, IGuild, IBbsAccount, ...)
  locales/            # fr/en translations
  utils/              # helpers (fetch, tokens, Discord, ...)
scripts/               # prerender.js, generate-sitemap.js (run at build time)
```

`@/...` import alias configured via `vite-tsconfig-paths` (see `tsconfig.app.json`).

## Key data model: bbs accounts

A Discord user can have several linked in-game accounts (main + alts, `IBbsAccount[]` on `IUser.bbs_accounts`). Guild and role (chef/sous-chef/membre) live **per account**, not per user. As a result, many player lists (guild rosters, the draft pool, rankings) work with "account" rows — the same user can appear multiple times, once per account — identified by `bbs_id` rather than `user._id`. See in particular `src/components/DraftSection.tsx` and `src/pages/UserPage.tsx` (account switcher on the profile page).

## Authentication

- **Web**: Discord OAuth redirect → callback (`DiscordCallback.tsx`) → JWT stored and managed by `AuthProvider`.
- **Discord Activity**: automatic login via the embedded Discord SDK (`src/activity/discordActivity.ts`), bypassing the regular OAuth redirect.
- The JWT carries a `guildRoles` array (one grant per chef/sous-chef account) exposed by `useAuth()` (`managedGuildIds`) to scope access to guild admin pages.

## Deployment

GitHub Actions CI (`.github/workflows/deploy.yml`): on push to `main`, build (`pnpm build`) then deploy the `dist/` folder via rsync to cPanel hosting over SSH.
