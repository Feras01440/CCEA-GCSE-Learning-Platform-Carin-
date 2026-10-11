# Deploying Cairn

The app is a static export: `npm run build` produces `out/` (content and decks are rebuilt first, then Next.js exports every route, then `scripts/fix-export.mjs` writes the flattened RSC prefetch payload files the client requests (Next 16 exports them as nested folders), then `scripts/build-sw.mjs` writes the offline service worker). All learner data stays in the browser; nothing is sent anywhere, so any static host works. The export is about 6,100 files and 200 MB on disk (build 10); the largest file is 3.4 MB.

## Which address she uses (read this first)

Her progress lives in the browser, per address. `http://192.168.1.20:3200`, `https://cairn-preview.pages.dev` and a one-commit address such as `https://3f2a9c1e.cairn-preview.pages.dev` are three different places to the browser: progress made at one is not at the others. Give her one address and keep it. Settings → "Export backup" and "Restore from file" move progress between addresses and devices.

| Way | Address | What it needs | Offline and Add to Home Screen | Updated |
|---|---|---|---|---|
| Cloudflare Pages (recommended) | `https://cairn-preview.pages.dev`, from anywhere | the owner's free Cloudflare account and two repository secrets (below), once | yes (https) | on every push to main, by CI |
| This PC, on the home Wi-Fi | `http://<the PC's address>:3200` | the export server running on the PC, and Windows allowing it on private networks | no: a service worker needs https, so it works only while the PC serves it | whenever a build is cut |
| Vercel (configured, not set up) | `https://<project>.vercel.app` | a Vercel account importing the repository | yes | on every push, built by Vercel |

## Recommended: Cloudflare Pages

CI already builds `out/` on every push to main (`.github/workflows/ci.yml`). `.github/workflows/deploy-preview.yml` publishes that build to Cloudflare Pages as soon as two repository secrets exist; until then the CI run's "Preview" job says so and passes. Why this host: it serves the export at the root of its address, as the app expects (no code change); its free plan does not meter static traffic (a full offline copy is about 86 MB per device: the 10 MB shell, then 76 MB on demand, build 11); every build gets its own address as well as the stable one; https, so the service worker installs and the app works offline on her phone. Limits on the free plan: 20,000 files per deployment (the export is about 6,100) and 25 MB per file (the largest is 3.4 MB).

### The owner's five-minute setup (once)

1. Sign up at https://dash.cloudflare.com/sign-up (free plan) and verify the email.
2. Copy the **Account ID**: Cloudflare dashboard → Workers & Pages → the Account ID on the right of the overview (it is also the long hex part of the dashboard's address).
3. Create an **API token**: top-right profile → My Profile → API Tokens → Create Token → "Create Custom Token". Name it `cairn-github`; Permissions: *Account* · *Cloudflare Pages* · *Edit*; Account Resources: *Include* · your account. Continue → Create Token, and copy the token (it is shown once).
4. In GitHub: the repository → Settings → Secrets and variables → Actions → New repository secret, twice: `CLOUDFLARE_API_TOKEN` (the token) and `CLOUDFLARE_ACCOUNT_ID` (the Account ID). Secrets are never shown in logs and are not given to pull requests from forks.
5. Push to main (or Actions → CI → Run workflow with "Also publish this build to the preview" ticked). When the run finishes, its summary page shows "Preview published" with two addresses: the stable one, `https://cairn-preview.pages.dev` (always the latest main; Cloudflare adds a suffix if the name was taken, and the summary shows the exact address), and the address of that build alone. Open the stable one on her phone and use Add to Home Screen.

The first deploy creates the Pages project named in `wrangler.toml` (`cairn-preview`); to choose another address, change the name there before step 5. A pull request from a branch of this repository gets `https://<branch>.cairn-preview.pages.dev`.

What the deploy adds: `out/_headers` with the headers `vercel.json` sets (`X-Robots-Tag: noindex, nofollow` on every page, so search engines never list it; `/sw.js` always revalidated; content and decks cached for five minutes).

### Optional: keep it private

The address is unlisted and never indexed, and the repository itself is public. To require a sign-in as well: Cloudflare dashboard → Zero Trust (free for up to 50 people) → Access → Applications → Add an application → Self-hosted, with the domain `cairn-preview.pages.dev` (and `*.cairn-preview.pages.dev` for the build addresses), and a policy allowing her and the owner's email addresses. She then confirms her email with a one-time code when the session expires (every 24 hours by default; the offline copy keeps working meanwhile). Weigh that against her nights: a code prompt at 22:00 is friction.

### By hand from this PC

`npm run build` (the lead), then once `npx wrangler login` (opens the browser for the owner's Cloudflare sign-in) and `npx wrangler pages deploy` (reads `wrangler.toml`: the project and `out/`). Needs no GitHub secrets.

## This PC on the home Wi-Fi (no account, today)

The export server (`npm run e2e:serve`, or `node scripts/serve-export.mjs 3200`; the lead's builds use `node scripts/serve-export.mjs 3200 ../cairn-build/out`) listens on every network interface of the PC. On her phone, on the same Wi-Fi, open `http://<the PC's address>:3200`, where the address is the IPv4 address `ipconfig` prints for the Wi-Fi adapter. The first time the server starts, Windows may ask whether to allow Node.js on networks: allow private networks only (the owner's choice; nothing here changes firewall settings). Without https the browser does not install the service worker, so there is no offline copy and no Add to Home Screen as an app; everything else works while the PC is on and serving.

The server is started from whatever started it, and it stops when that does (an app restart ends it). For a server that outlives the app, the owner can start it from a terminal of his own: `npm run e2e:serve` in the repository folder.

## Vercel (configured; an alternative)

`vercel.json` sets the build command, `out/` and the `noindex` headers. Import the repository at https://vercel.com/new (Hobby plan, personal use). Differences from Cloudflare Pages: Vercel builds the app itself on every push (on its machines, with its build minutes), so CI's build is not the one served; and its preview deployments are behind Vercel Authentication by default, so a phone must sign in to Vercel to open one unless the protection is switched off. The production address works like the Pages one.

## Evaluated and not recommended

- **GitHub Pages.** A project repository is served under a sub-path (`https://feras01440.github.io/CCEA-GCSE-Learning-Platform-Carin-/`), and Cairn assumes the root of its address: `fetch(\`/content/…\`)` in `src/lib/content/load.ts` (line 38), `fetch(\`/decks/…\`)` in `src/lib/content/decks.ts` (line 21), `register("/sw.js")` in `src/components/shell/ServiceWorker.tsx` (line 19), `"start_url": "/"` and `"scope": "/"` in `public/manifest.webmanifest`, and the root-relative precache list that `scripts/build-sw.mjs` writes; `next.config.ts` sets no `basePath`. Serving it there needs those code changes, so the evaluation stops there. (The root of a GitHub Pages address needs a custom domain, or a second repository named `feras01440.github.io`.) It has no per-commit addresses either.
- **Netlify.** It serves at the root and has deploy previews, and a `netlify.toml` would be three lines. Its free plan for new accounts is metered in credits since its 2025 pricing change (production deploys and bandwidth both cost credits, and a site pauses when the month's credits run out), which a project deploying several times a day can exhaust; check https://www.netlify.com/pricing before choosing it. Cloudflare Pages does not meter static traffic.

## Backups

Settings → "Export backup" downloads her progress as JSON; "Restore from file" merges or replaces it on another device or address. Do this before changing phone, and before moving her from one address to another.

## Checks before handing over

`npm run verify` (docs/dev/README.md, "Verification"): type check, unit tests, the content check, the build, and every Playwright spec file alone against the export. CI runs the same on every push, and the nightly runs it again with the content lints in report mode.
