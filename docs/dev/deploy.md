# Deploying Cairn

The app is a static export: `npm run build` produces `out/` (content and decks are rebuilt first, then Next.js exports every route, then `scripts/fix-export.mjs` writes the flattened RSC prefetch payload files the client requests (Next 16 exports them as nested folders), then `scripts/build-sw.mjs` writes the offline service worker). All learner data stays in the browser; nothing is sent anywhere, so any static host works.

## Local (her laptop, no internet needed after install)

```bash
npm run build
npx serve out
```

Open the printed address. On the laptop itself (`http://localhost:…`) this is the whole app, offline copy included.

On her phone over the home Wi-Fi it is not (corrected 26 Sep 2026). Browsers register a service worker only in a secure context, meaning HTTPS or localhost. At the laptop's plain address (`http://192.168.…:3200`, the IP from `ipconfig`):

- The app runs and keeps her progress, but there is no offline copy and no background update. "Add to Home Screen" gives a bookmark, not an installed app.
- Her progress is stored under that exact address. If the laptop's IP changes, the browser treats it as a different site, and her progress seems to vanish until the old address comes back.

For the phone, use the private HTTPS URL below.

## Vercel (private URL, installable anywhere)

1. Push the repo to a private GitHub repository (never commit `docs/sources/papers/`; it is gitignored).
2. Import the repo on Vercel; `vercel.json` already sets the build command and `out/`; the site is marked `noindex` by headers and by the app's metadata.
3. Set the project to a non-guessable URL (Vercel gives one) and share it only with her.
4. Each content change: push; Vercel rebuilds; the service worker updates on her next visit.

## Backups

Settings → "Export backup" downloads her progress as JSON; "Restore from file" merges or replaces it on another device. Do this before changing phone.

## Checks before handing over

```bash
npm test          # unit tests
npm run e2e       # Playwright smoke tests against out/
```
