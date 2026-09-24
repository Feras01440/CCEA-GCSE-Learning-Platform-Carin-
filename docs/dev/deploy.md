# Deploying Cairn

The app is a static export: `npm run build` produces `out/` (content and decks are rebuilt first, then Next.js exports every route, then `scripts/fix-export.mjs` writes the flattened RSC prefetch payload files the client requests (Next 16 exports them as nested folders), then `scripts/build-sw.mjs` writes the offline service worker). All learner data stays in the browser; nothing is sent anywhere, so any static host works.

## Local (her laptop, no internet needed after install)

```bash
npm run build
npx serve out
```

Open the printed address, then on her phone open the same address on the home Wi-Fi (the laptop's IP is shown by `ipconfig`) and use "Add to Home Screen" so it installs as an app. The service worker keeps it working offline afterwards.

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
