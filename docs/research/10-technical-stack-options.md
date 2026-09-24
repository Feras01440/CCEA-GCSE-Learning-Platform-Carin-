# 10 — Technical stack options for the CCEA GCSE interactive study platform

**Research date:** 1 September 2026
**Target environment:** Node.js 24 on Windows 11 (verified locally: `node v24.18.0`, `npm 11.16.0`, Git for Windows 2.55.0), no mandatory backend, runs locally, optional deploy to Vercel / Netlify / GitHub Pages, must work offline (PWA), must be "extremely polished".
**Method:** 30+ web searches and ~55 direct fetches of primary sources (official docs, licence pages, GitHub issues), plus `npm view` against the public registry on this machine for every candidate package (versions, licences, `engines.node`, peer dependencies, publish dates). Every non-obvious claim carries its source URL. Where a page could not be read (JavaScript-rendered legal pages), that is stated explicitly rather than guessed.

---

## 0. Executive summary — the recommended stack

| Layer | Choice | Version (npm, 1 Sep 2026) | Licence | Why |
|---|---|---|---|---|
| Framework | **Next.js App Router, `output: 'export'`** | 16.3.4 (published 2026-08-31) | MIT | Per-route prerendered HTML, RSC runs at build, first-class MDX, Vercel/Netlify/GH Pages templates, largest React ecosystem for the interactive libs below. Lean alternative: Vite 8 + React SPA (see §2). |
| UI runtime | React + React DOM | 19.2.8 | MIT | Required by Mafs, R3F 9, Excalidraw, Motion, shadcn. `<Activity>`, `useEffectEvent`, View Transitions in 19.2. |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) | 4.3.3 | MIT | 4.3.2/4.3.3 specifically fixed Windows watch-mode crashes and added polling for unreliable file systems. |
| Components | shadcn CLI on **Base UI** (`@base-ui/react`) — Radix still supported via `shadcn init -b radix` | shadcn 4.19.1 / @base-ui/react 1.7.0 / radix-ui 1.6.7 | MIT | Base UI became shadcn's default on 3 July 2026; Radix is not deprecated. |
| Icons | lucide-react | 1.39.0 | ISC | |
| Maths rendering | **KaTeX** (+ `mhchem` extension, `output: 'htmlAndMathml'`) via `remark-math` + `rehype-katex` at MDX compile time; `katex.renderToString` at runtime for question banks | 0.18.5 / remark-math 6.0.0 / rehype-katex 7.0.1 | MIT | Fast, synchronous, covers every GCSE construct checked (§3). MathJax 4.1.3 (Apache-2.0) only as optional accessibility mode. |
| Interactive graphs | **Mafs** (declarative React, inside MDX) + **JSXGraph** (geometry / constructions / sliders / 3D-ish) + `d3-scale`/`d3-shape` for data charts | mafs 0.21.0, jsxgraph 1.13.2, d3 7.9.0 | MIT / (MIT OR LGPL-3.0-or-later) / ISC | Desmos API excluded (partner-only self-hosting, API key + separate terms); GeoGebra only as optional self-hosted applets under its non-commercial licence; Plotly excluded (1.2–4.6 MB bundles). |
| Animation | **Motion** (`motion/react`) for UI + **GSAP** (+ `@gsap/react` `useGSAP`) for timelines / ScrollTrigger / SVG morphs | motion 13.1.1 / gsap 3.15.0 | MIT / GSAP Standard "no charge" licence (free incl. commercial & all plugins since 30 Apr 2025) | |
| Smooth scroll | Lenis — landing/marketing pages only, not inside the study workspace | 1.3.26 | MIT | Honours `prefers-reduced-motion` by default. |
| 3D | three + @react-three/fiber 9 + @react-three/drei 10 (lazy-loaded, `ssr:false`) | 0.185.1 / 9.7.0 / 10.7.8 | MIT | R3F 9 peer: `react >=19 <19.3`, `three >=0.156`. R3F 10 is alpha (WebGPU) — stay on 9. |
| Spaced repetition | ts-fsrs (FSRS-6) | 5.4.2 (published 2026-09-01) | MIT | |
| Local data | Dexie 4 + dexie-react-hooks (`useLiveQuery`) | 4.4.5 / 4.4.0 | Apache-2.0 | Cards, attempts, drawings, settings in IndexedDB. |
| UI state | Zustand 5 (+ `persist` to localStorage for small prefs only) | 5.0.15 | MIT | |
| PWA / offline | Serwist 9 — `@serwist/cli build` / `@serwist/build` `injectManifest` as a post-build step over `out/` (bundler-agnostic; works with Turbopack **and** static export). `@serwist/next` needs webpack; `@serwist/turbopack` uses a route handler. | serwist / @serwist/build / @serwist/cli / @serwist/turbopack 9.5.12 | MIT | vite-plugin-pwa 1.3.0 (Vite 8 peer) if the Vite alternative is chosen. |
| Content | MDX 3 via `@next/mdx` (topic pages) + **JSON question banks validated by Zod 4** (Zod schema is the single source of truth, `z.toJSONSchema()` for editor tooling) | @mdx-js/mdx 3.1.1 / @next/mdx 16.3.4 / zod 4.5.4 | MIT | Turbopack requires remark/rehype plugins to be passed **as strings**. |
| Answer checking | Numeric: own tolerance engine (+ mathjs for units/expressions). Algebraic: **@cortex-js/compute-engine** (`isSame` / `isEqual` / `isIdenticallyEqual`) with MathLive `<math-field>` for input | compute-engine 0.120.0 / mathjs 15.2.0 / mathlive 0.110.0 | MIT / Apache-2.0 / MIT | nerdamer (last publish Nov 2021) and Algebrite (Apr 2021) are unmaintained — avoid. |
| Working canvas | **Excalidraw** (`@excalidraw/excalidraw`, dynamic import, self-hosted assets via `window.EXCALIDRAW_ASSET_PATH`) + a tiny Pointer-Events `<canvas>` scratchpad | 0.18.1 | MIT | tldraw 5.3.2 is proprietary: free in development only; production needs a hobby (watermark, discretionary), trial or commercial licence. |
| Video | YouTube **privacy-enhanced** embed (`youtube-nocookie.com`) behind a click-to-load facade; no autoplay; no overlays; ≥ 200×200 (480×270 recommended) | — | YouTube API ToS applies to the embedded player | Video cannot be cached offline (ToS forbids). |
| Simulations | PhET HTML5 sims via iframe (attribution + visible logo); optionally self-host downloaded **pre-29-Mar-2026 versions** (CC BY 4.0) for offline | — | CC BY 4.0 (historical sims); newer versions under separate terms — verify | |
| AI tutor (optional) | Claude API via a **serverless function** (Vercel/Netlify) or local Node proxy; never ship the key in the static bundle | @anthropic-ai/sdk 0.123.0 | MIT | Model `claude-opus-5` default (adaptive thinking, streaming, prompt caching, structured outputs for marking JSON). |
| Testing | Vitest 4 (Browser Mode stable, `@vitest/browser-playwright`) + Playwright | 4.1.11 / 1.62.1 | MIT / Apache-2.0 | |
| Package manager | npm 11 (ships with Node 24). pnpm is fine but its nested virtual store makes `MAX_PATH` overflow more likely on Windows. | — | — | |

Sources for versions/licences: local `npm view` (registry.npmjs.org) run 2026-09-01; see §12 for the full table with publish dates.

---

## 1. Requirements that drive the decision

1. **No backend required.** All content is static; user state lives in IndexedDB. An optional serverless function is only needed for the Claude tutor.
2. **Offline-capable PWA.** Everything except YouTube video and remotely-hosted PhET/GeoGebra must be precached, including KaTeX fonts, Mafs CSS, Excalidraw fonts and three.js chunks.
3. **Heavy interactive React components inside authored content** (graphs, 3D, drawing, animations) → the framework must let MDX embed client components and must not fight the React ecosystem.
4. **Windows 11 + Node 24 developer machine** → path-length, PowerShell and file-watcher pitfalls (§11).
5. **Deploy targets:** Vercel, Netlify, GitHub Pages — all static-file hosts.

---

## 2. Framework comparison

### 2.1 Facts gathered

| | Next.js 16.3.4 (App Router, static export) | Astro 7.2.10 (islands) | SvelteKit 2.70.3 (adapter-static 3.0.10) | Vite 8.2.2 + React (SPA) |
|---|---|---|---|---|
| Node requirement (npm `engines`) | `>=20.9.0` | `>=22.12.0` | `>=18.13` | `^20.19.0 \|\| >=22.12.0` |
| Bundler | Turbopack (default dev+build since 16.0; `--webpack` opt-out) | Vite 8 / Rolldown, Rust `.astro` compiler | Vite 8 | Vite 8 / Rolldown |
| Static output | `output: 'export'` → HTML per route in `out/` | Static by default | `adapter-static` (prerender all, or SPA `fallback`) | SPA `index.html` (no prerender without extra tooling) |
| Static-export limitations | No dynamic routes without `generateStaticParams`, no `dynamicParams: true`, no request-dependent route handlers, no cookies/rewrites/redirects/headers/proxy/ISR/draft mode/Server Actions/intercepting routes, default image loader unsupported | n/a | `ssr` cannot be `false` during prerender; `trailingSlash` must be set consistently | n/a |
| MDX + interactive components | `@next/mdx` (mdx-components.tsx required); under Turbopack remark/rehype plugins **must be strings** with serialisable options (e.g. `['rehype-katex', {strict:true}]`) | `@astrojs/mdx` 8.0.0 on Sätteri (Rust) with built-in GFM, smart punctuation and **math**; React children from `.astro` arrive as strings unless `experimentalReactChildren` | mdsvex (Svelte, not React) | `@mdx-js/rollup` — you assemble the pipeline |
| React ecosystem fit (Mafs, R3F, Excalidraw, Motion, shadcn) | Native | Works in islands; but islands cannot share React context; each island is a separate root | Not React — none of these libraries apply (JSXGraph, Threlte alternatives) | Native |
| PWA tooling | `@serwist/next` (webpack), `@serwist/turbopack` (route handler), or post-build `@serwist/cli build` | `@vite-pwa/astro` 1.2.0 | `@vite-pwa/sveltekit` 1.1.0 | `vite-plugin-pwa` 1.3.0 (Vite 8 peer) |
| Known Windows issues | Turbopack Sass `@use/@forward` path resolution bug on Windows, issue #87243 **open** (irrelevant if Sass is not used); Turbopack breaks `npm link`/symlinks | Rust compiler ships native binaries with WASM fallback | none found | Rolldown-vite beta had a Windows null-byte path bug (#584), fixed before 8.0.0 stable (2026-03-12) |
| Deploy templates | Official GitHub Pages template (`output:'export'`, `basePath: process.env.PAGES_BASE_PATH`) | Static | Docs cover GitHub Pages (`paths.base`, `404.html`, `.nojekyll`) | Any static host |

Sources:
- Next.js static export guide (v16.3.4, updated 2026-08-25): https://nextjs.org/docs/app/guides/static-exports
- Next.js 16 release (Turbopack default, Node 20.9+, React 19.2, `--webpack`): https://nextjs.org/blog/next-16
- Next.js MDX guide (Turbopack string plugins): https://nextjs.org/docs/app/guides/mdx
- Next.js GitHub Pages template config: https://raw.githubusercontent.com/nextjs/deploy-github-pages/main/next.config.ts
- Turbopack Windows Sass issue (open): https://github.com/vercel/next.js/issues/87243
- Turbopack breaks npm link: https://steveharrison.dev/next-js-16s-turbopack-breaks-npm-link/
- `useParams()` under static export discussion: https://github.com/vercel/next.js/discussions/64660
- Astro 7.0 announcement (22 Jun 2026; Rust compiler, Sätteri, Vite 8, built-in math): https://astro.build/blog/astro-7/
- Astro 7 upgrade guide: https://docs.astro.build/en/guides/upgrade-to/v7/
- Astro React integration (children as strings): https://docs.astro.build/en/guides/integrations-guide/react/
- InfoQ on Astro 7 build speed: https://www.infoq.com/news/2026/08/astro-7-release-speed/
- SvelteKit adapter-static: https://svelte.dev/docs/kit/adapter-static and SPA mode: https://svelte.dev/docs/kit/single-page-apps
- Vite PWA SvelteKit notes: https://vite-pwa-org.netlify.app/frameworks/sveltekit
- Vite 8 / Rolldown Windows beta bug: https://github.com/vitejs/rolldown-vite/issues/584 ; migration guide: https://main.vite.dev/guide/migration
- vite-plugin-pwa releases (1.3.0 adds Vite 8 peer): https://github.com/vite-pwa/vite-plugin-pwa/releases

### 2.2 Assessment

- **SvelteKit** is excellent technically but eliminates the React-only libraries the brief asks for (Mafs, R3F, Excalidraw, Motion, shadcn). Rejected on ecosystem fit, not quality.
- **Astro 7** is the best choice for a *content-first* site with little client JS, and its Sätteri pipeline has built-in math. But this product is an *app*: persistent study session state, a drawing canvas, FSRS review queues, timers and animated transitions between topics. Astro's island model (separate React roots, no shared context, page-level navigation) fights that. Rejected as primary; keep as an option for a separate marketing/docs site.
- **Vite 8 + React SPA** is the leanest and has the most mature PWA plugin. Its downside is no per-route HTML: every deep link boots the whole SPA, and there is no build-time rendering of topic pages (KaTeX in MDX still compiles at build time via rehype-katex, so that is not a blocker). This is the recommended **fallback** if Next's static-export constraints or Turbopack bugs become painful.
- **Next.js 16 App Router with `output: 'export'`** gives per-topic prerendered HTML (fast first paint, deep-linkable, crawlable), build-time RSC for content, first-class MDX, incremental client navigation with prefetch, React 19.2 View Transitions, React Compiler support, and the official GitHub Pages template. The constraints (enumerate dynamic routes with `generateStaticParams`, `images.unoptimized`, no server features) are natural for a content platform. **Recommended.**

### 2.3 Next.js configuration skeleton (static export, Windows-safe)

```ts
// next.config.ts
import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,                    // emits /topic/index.html -> works on GH Pages/Netlify without rewrites
  basePath: process.env.PAGES_BASE_PATH,  // '/repo-name' on GitHub Pages, undefined elsewhere
  images: { unoptimized: true },          // default loader unsupported in static export
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  reactCompiler: true,                    // stable in 16; optional
}

const withMDX = createMDX({
  options: {
    // Turbopack: plugins must be strings with serialisable options
    remarkPlugins: ['remark-gfm', 'remark-math'],
    rehypePlugins: [['rehype-katex', { output: 'htmlAndMathml', strict: 'warn' }]],
  },
})
export default withMDX(nextConfig)
```

Dynamic content routes must export `generateStaticParams()` and `export const dynamicParams = false` (source: https://nextjs.org/docs/app/guides/mdx and https://nextjs.org/docs/app/guides/static-exports).

---

## 3. Maths rendering: KaTeX vs MathJax

| | KaTeX 0.18.5 | MathJax 4.1.3 |
|---|---|---|
| Licence | MIT | Apache-2.0 |
| Rendering model | Synchronous, no reflow, `renderToString` on server/build | Async document processing; ES modules, scoped packages (`@mathjax/src`, `@mathjax/mathjax-newcm-font` …) |
| Speed | Its reputation; still smaller bundle/fonts. Independent comparisons say MathJax 3/4 closed much of the gap | Comparable in benchmarks; heavier fonts |
| Accessibility | Emits hidden MathML alongside HTML (`output: 'htmlAndMathml'`) | Expression Explorer on by default, speech in a web worker, best-in-class |
| Line breaking | No | Automatic inline/display line-breaking (new in 4) |
| Chemistry | `mhchem` extension (`\ce`, `\pu`) shipped in the package | mhchem TeX package |
| Notable gaps | `\label`/`\eqref`, `\newenvironment`, `\multicolumn`, `\cline`, `\rotatebox`, `\textsc`, `\fbox` (use `\boxed`) | — |
| Recent breaking change | **0.18.0 (17 Jul 2026) prefixed all CSS classes** — any custom CSS or allow-lists targeting KaTeX internals must be updated | — |

**GCSE notation coverage check (KaTeX "Supported Functions"):** `\cancel`, `\bcancel`, `\xcancel`, `\sout`, `\boxed`, `\colorbox`, `\textcolor`, `\tag`, `\degree`, `\angle`, `\pm`, `\mp`, `\times`, `\div`, `\cdot`, `\therefore`, `\because`, `\implies`, `\iff`, `\leq`, `\geq`, `\neq`, `\approx`, `\equiv`, `\propto`, `\infty`, `\sum`, `\prod`, `\int`, `\lim`, `\overrightarrow`, `\underbrace`, `\overbrace`, `\dfrac`, `\tfrac`, `\sqrt[n]`, `\lvert`, `\lVert`, `\left…\right`, `\big`, `pmatrix`, `cases`, `align`, `aligned`, `array` with `\hline`, `\phantom`, `\mathbb`, `\mathrm`, `\text` — all supported. `\ce`/`\pu` need the bundled mhchem extension. Nothing a GCSE Maths/Science mark scheme needs is missing.

**Recommendation:** KaTeX everywhere. Compile-time rendering via `remark-math` + `rehype-katex` for MDX topic pages; runtime `katex.renderToString(tex, {throwOnError:false, output:'htmlAndMathml'})` for JSON question banks, wrapped in a memoised `<Tex>` component. Self-host `katex.min.css` and its fonts (precached by the service worker). Offer MathJax 4 as an opt-in "accessibility mode" later if screen-reader exploration is required.

Sources:
- KaTeX support table: https://katex.org/docs/support_table
- KaTeX supported functions: https://katex.org/docs/supported
- KaTeX extensions (auto-render, copy-tex, mhchem, math/tex script type): https://katex.org/docs/libs
- KaTeX releases (0.18.0 CSS-prefix breaking change, 0.18.5 on 31 Aug 2026): https://github.com/KaTeX/KaTeX/releases
- MathJax 4 what's new: https://docs.mathjax.org/en/v4.0/upgrading/whats-new-4.0.html ; fonts: https://docs.mathjax.org/en/v4.1/output/fonts.html ; npm packaging: https://docs.mathjax.org/en/v4.1/upgrading/whats-new-4.0/accessing.html
- Comparisons: https://mathstohtml.com/katex-vs-mathjax.html ; https://biggo.com/news/202511040733_KaTeX_MathJax_Web_Rendering_Comparison ; live demo https://www.intmath.com/cg5/katex-mathjax-comparison.php
- Astro built-in math in Sätteri: https://astro.build/blog/astro-7/

---

## 4. Interactive graphs and geometry

| Library | Version / date | Licence | Nature | Verdict |
|---|---|---|---|---|
| **Mafs** | 0.21.0, published **2024-10-20** (no release in 22 months; 19 open issues) | MIT | Declarative React: `Mafs, Coordinates, Plot (OfX/OfY/Parametric/VectorField), Point, Line (PointAngle/PointSlope/ThroughPoints/Segment), Circle, Ellipse, Polygon, Polyline, Vector, Image, Text, LaTeX, Transform, Debug, MovablePoint`, hooks `useMovablePoint, useMovable, useStopwatch, useTransformContext`. Requires `mafs/core.css`; optional `mafs/font.css` (+~220 kB). Peer `react >=18`. | **Use** for authored, animated, draggable graphs inside MDX. Stale maintenance is a risk — pin the version, keep a fork-ready wrapper component. |
| **JSXGraph** | 1.13.2, published 2026-08-17 | `(MIT OR LGPL-3.0-or-later)` | Imperative, framework-agnostic, ships TS types (`src/index.d.ts`), multi-touch, SVG/canvas. 286 documented examples: geometry theorems, constructions, sliders, transformations, function/parametric/polar plotters, calculus (Riemann sums, tangents), statistics, charts, 3D views. `engines.node >=20.19`. | **Use** for constructions, loci, transformations, bearings, circle theorems, 3D solids where Mafs is too limited. Wrap in a `useEffect`-initialised React component. Choose MIT when redistributing. |
| **Desmos API v1.12** | — | Desmos API Terms of Service (JS-rendered page — **could not be read programmatically**; read it manually at https://www.desmos.com/api-terms) | Loaded from `https://www.desmos.com/api/v1.12/calculator.js?apiKey=…`; API key from https://www.desmos.com/my-api. Docs: "Desmos partners have the option to either host the API on their own servers or load it from desmos.com" and self-hosting gives "the option to use the tools without a network connection" — i.e. offline use is a partner arrangement. FAQ: "Please do not frame or mirror the tools without our written consent"; deeper API use → partnerships@desmos.com. | **Exclude** from the core (no offline, key + partner terms, no framing). Link out to Desmos graphs as an online extra only. |
| **GeoGebra** | deployggb.js; offline "GeoGebra Math Apps Bundle" | Source EUPL 1.2; **installers/web services under a non-commercial licence**; language files CC BY-NC-SA 4.0 | Embed via `https://www.geogebra.org/apps/deployggb.js` or self-host the bundle (`https://download.geogebra.org/package/geogebra-math-apps-bundle`, then `applet.setHTML5Codebase(...)`). Free to "use, copy, distribute, modify and transmit" for non-commercial purposes with attribution "Made with GeoGebra®" + link to https://www.geogebra.org. Selling materials or gaining commercial advantage requires a licence from office@geogebra.org. | **Optional**, lazy-loaded, for specific applets (e.g. 3D solids, constructions) while the platform is free and non-commercial. Becomes a licensing problem the day the platform is monetised. |
| **Plotly.js** | 4.0.0 (`plotly.js-dist-min`, 2026-08-24) | MIT | Partial bundles are still 1.18 MB (basic) to 4.64 MB (strict) minified. | **Exclude** — too heavy for a PWA. |
| **D3** | 7.9.0 (2024-03-12) | ISC | Low-level modules. | **Use modules** (`d3-scale`, `d3-shape`, `d3-axis`) inside custom React SVG charts for statistics topics (box plots, cumulative frequency, histograms). |

Sources:
- Mafs repo/licence: https://github.com/stevenpetryk/mafs ; exports: https://raw.githubusercontent.com/stevenpetryk/mafs/main/src/index.tsx ; install: https://mafs.dev/guides/get-started/installation ; releases: https://github.com/stevenpetryk/mafs/releases
- JSXGraph repo (dual licence, multi-touch): https://github.com/jsxgraph/jsxgraph ; MIT text: https://github.com/jsxgraph/jsxgraph/blob/main/LICENSE.MIT ; npm: https://www.npmjs.com/package/jsxgraph ; examples: https://jsxgraph.org/wiki/index.php/Category:Examples
- Desmos API docs v1.12: https://www.desmos.com/api/v1.12/docs/index.html ; API terms (JS-rendered): https://www.desmos.com/api-terms ; policies FAQ: https://github.com/desmosinc/policies/blob/main/faqs.md ; sample CMS: https://github.com/desmosinc/desmos-sample-cms
- GeoGebra licence: https://www.geogebra.org/license ; embedding + offline bundle: https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_Embedding/ ; embedding examples: https://github.com/kovzol/geogebra-embedding-examples ; licence DB entry: https://scancode-licensedb.aboutcode.org/geogebra-ncla-2022.html
- Plotly bundles: https://github.com/plotly/plotly.js/blob/master/dist/README.md ; licence: https://github.com/plotly/plotly.js/blob/main/LICENSE
- D3 licence: `npm view d3 license` → ISC; comparison article https://www.ridhwaan.xyz/blog/choosing-a-charting-library-echarts-d3-recharts-plotly-chartjs-deckgl/

---

## 5. Animation: Motion vs GSAP, plus Lenis

| | Motion 13.1.1 (`motion`, alias `framer-motion` 13.1.1) | GSAP 3.15.0 |
|---|---|---|
| Licence | MIT | "Standard 'no charge' license" (npm field). Webflow made GSAP 100 % free including commercial use and all formerly-Club plugins (SplitText, MorphSVG, ScrollSmoother…) in April 2025; licence effective 30 Apr 2025, last modified 30 May 2025. Only restriction: "Prohibited Uses" — building tools that compete with Webflow's visual animation builders. No attribution required. |
| React integration | `motion/react`; `AnimatePresence`, layout animations, gestures, `LazyMotion` + `m` for ~4.6 kB initial | `@gsap/react` `useGSAP()` (auto `gsap.context()` cleanup, `scope`, `dependencies`, `contextSafe`); add `"use client"` in App Router |
| Recent breaking change | **13.0.0 (5 Aug 2026)** removed the optional `@emotion/is-prop-valid` dependency → pass `<MotionConfig isValidProp={isPropValid}>` explicitly; 13.1.1 guards `window` access for non-browser environments and fixes React 19 strict-mode `AnimatePresence` | 3.15.0 published 2026-04-13 |
| Strength | React state-driven UI transitions, exit animations, shared layout | Timelines, ScrollTrigger, SVG morphing, text splitting, canvas/WebGL syncing; no React reconciler involvement |

**Recommendation:** both, with clear boundaries — Motion for component/page transitions and micro-interactions; GSAP for choreographed diagram explanations (e.g. animating a proof step-by-step, morphing shapes), ScrollTrigger on landing pages. Respect `prefers-reduced-motion` globally (`MotionConfig reducedMotion="user"`; `gsap.matchMedia()`).

**Lenis 1.3.26 (MIT):** zero-dependency smooth scroll; by default disables smoothing when `prefers-reduced-motion: reduce` and makes programmatic scrolls jump. Use only on marketing/landing pages — smooth-scroll hijacking inside a study workspace with a drawing canvas, sticky question panes and keyboard navigation harms usability.

Sources:
- Webflow announcement: https://webflow.com/blog/gsap-becomes-free ; CSS-Tricks: https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/ ; GSAP Standard License: https://gsap.com/community/standard-license/ ; React guide: https://gsap.com/resources/React/ ; frameworks: https://gsap.com/resources/frameworks/
- Motion changelog: https://raw.githubusercontent.com/motiondivision/motion/main/CHANGELOG.md ; comparisons: https://lab.good-fella.com/blog/gsap-vs-framer-motion-vs-react-spring ; https://www.hontran.dev/blog/gsap-vs-framer-motion
- Lenis: https://github.com/darkroomengineering/lenis ; https://www.npmjs.com/package/lenis ; https://lenis.dev/

---

## 6. 3D: three.js + React Three Fiber

- `three` 0.185.1 (MIT, 2026-07-01); `@react-three/fiber` 9.7.0 (MIT, 2026-07-31) — peer `react >=19 <19.3`, `react-dom >=19 <19.3`, `three >=0.156`; the reconciler is bundled because React 19.2 changed internals. `@react-three/drei` 10.7.8 (MIT) — peer `react ^19`, `three >=0.159`, `fiber ^9`.
- R3F **v10 is alpha** (WebGPU, requires `three >= 0.185`) — do not adopt yet.
- Use cases: ionic lattices and molecules (spheres + cylinders with drei `<Instances>`), 3D shapes/nets/cross-sections (Maths), electric/magnetic field lines (Physics), the eye/heart (Biology).
- Load with `next/dynamic(..., { ssr: false })`, code-split per topic, cap device pixel ratio, pause the render loop when off-screen (`frameloop="demand"`), and honour reduced motion. Precache 3D chunks with the service worker but raise `maximumFileSizeToCacheInBytes`.

Sources: https://github.com/pmndrs/react-three-fiber/releases ; https://r3f.docs.pmnd.rs/getting-started/installation ; drei React 19 issue history: https://github.com/pmndrs/drei/issues/2260 and https://github.com/pmndrs/drei/discussions/2213 ; peer deps via `npm view`.

---

## 7. UI foundation: Tailwind v4, shadcn/ui, Base UI vs Radix, Lucide

- **Tailwind CSS 4.3.3** (MIT, 2026-07-16). Relevant Windows notes from the release stream: 4.3.2 "Windows watch mode crash prevention"; 4.3.3 "watch mode polling support for unreliable filesystems". Use `@tailwindcss/postcss` 4.3.3 with Next; `@tailwindcss/vite` 4.3.3 with Vite. `@tailwindcss/typography` 0.5.20 for MDX prose.
- **shadcn/ui** (CLI `shadcn` 4.19.1): on **3 July 2026 Base UI became the default primitive library**; "Radix is not being deprecated. We still support it, and every update and new component will ship for both libraries." Choose Radix explicitly with `shadcn init -b radix`. In Feb 2026 the Radix packages were consolidated into the single `radix-ui` package (1.6.7) with a `shadcn migrate radix` codemod.
- **Base UI** (`@base-ui/react` 1.7.0, MIT, maintained by MUI): tree-shakable; requires `isolation: isolate` on the app root for popups and `body { position: relative }` for iOS 26 Safari. (The older `@base-ui-components/react` package is frozen at 1.0.0-rc.0 — do not install it.)
- **Lucide** (`lucide-react` 1.39.0, ISC; some icons derived from Feather under MIT — keep the licence notice).

Sources: https://github.com/tailwindlabs/tailwindcss/releases ; https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default ; https://ui.shadcn.com/docs/changelog ; https://ui.shadcn.com/docs/tailwind-v4 ; https://base-ui.com/react/overview/quick-start ; https://www.shadcndeck.com/blog/radix-vs-base-ui ; https://lucide.dev/license

---

## 8. Client data, state, spaced repetition, PWA

### 8.1 Storage and state
- **Dexie 4.4.5** (Apache-2.0) + **dexie-react-hooks 4.4.0** (`useLiveQuery`) for all durable data: FSRS cards, attempts, drawings (Excalidraw JSON), settings. Dexie 4 "lets your components mirror the database in real time".
- **Zustand 5.0.15** (MIT) for ephemeral UI state (current question, timer, panel layout). Its `persist` middleware "is designed to best fit with localStorage"; official discussions show IndexedDB persistence via `idb-keyval` (6.3.0, Apache-2.0) works but has rehydration caveats — keep persisted Zustand state tiny and put real data in Dexie.

Sources: https://github.com/dexie/Dexie.js ; https://dexie.org/product ; https://blog.logrocket.com/dexie-js-indexeddb-react-apps-offline-data-storage/ ; https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md ; https://github.com/pmndrs/zustand/discussions/1721 ; https://github.com/pmndrs/zustand/discussions/2475

### 8.2 Spaced repetition
- **ts-fsrs 5.4.2** (MIT, published 2026-09-01, `engines.node >=20`) implements **FSRS-6**: `createEmptyCard()`, `fsrs(params)`, `repeat(card, now)` (preview all four outcomes), `next(card, now, Rating.Good)`, `Rating.{Again,Hard,Good,Easy}`, card fields `due, stability, difficulty, last_review, state`. A Rust optimiser (`@open-spaced-repetition/binding`) exists for server-side parameter fitting — not needed client-side.
- Store one FSRS card per (question or flashcard); store review logs to allow later optimisation; schedule with `desired_retention` ≈ 0.9 and let students raise it near exams.

Sources: https://www.npmjs.com/package/ts-fsrs ; https://open-spaced-repetition.github.io/ts-fsrs/ ; https://github.com/open-spaced-repetition/ts-fsrs ; https://deepwiki.com/open-spaced-repetition/ts-fsrs

### 8.3 PWA / service worker
| Option | Fit with Next 16 static export | Notes |
|---|---|---|
| `@serwist/next` 9.5.12 | Requires **webpack** (`next build --webpack`); writes `public/sw.js`; options `swSrc, swDest, disable, register, scope, cacheOnNavigation, reloadOnOnline, additionalPrecacheEntries, exclude, maximumFileSizeToCacheInBytes, manifestTransforms` … | Loses Turbopack build speed. In dev, `defaultCache` becomes network-only — copy it and adjust if you need offline in dev. |
| `@serwist/turbopack` 9.5.12 | `withSerwist()` + `app/serwist/[path]/route.ts` (`createSerwistRoute()`) + `app/sw.ts` + `SerwistProvider` | Route-handler based; with `output:'export'` route handlers must be `force-static` GET — verify the precache manifest is complete in `out/` before relying on it. |
| **`@serwist/cli build` / `@serwist/build` `injectManifest` (post-build)** 9.5.12 | Bundler-agnostic: `next build` → `serwist build` with `serwist.config.js` (`globDirectory: 'out'`, `swSrc: 'src/sw.ts'`, `swDest: 'out/sw.js'`, `globPatterns`, `injectionPoint`, `maximumFileSizeToCacheInBytes`). Bundles the SW with esbuild and injects the precache manifest. | **Recommended** — works identically on Vercel/Netlify/GH Pages and with Turbopack. |
| `vite-plugin-pwa` 1.3.0 | Vite alternative only (peer `vite ^3…^8`, Workbox 7.4.x) | generateSW/injectManifest; frameworks: React, Svelte, SvelteKit, Astro, etc. |

Caching plan: precache app shell + all `out/**/*.{html,js,css,woff2,json,svg,png}`; runtime `CacheFirst` for KaTeX fonts and 3D assets; `StaleWhileRevalidate` for content JSON; **never** attempt to cache YouTube (ToS) or GeoGebra/PhET remote assets unless self-hosted.

Sources: https://serwist.pages.dev/docs/next/getting-started ; https://serwist.pages.dev/docs/next/turbo ; https://serwist.pages.dev/docs/next/configuring ; https://serwist.pages.dev/docs/cli ; https://serwist.pages.dev/docs/build/inject-manifest ; https://blog.logrocket.com/nextjs-16-pwa-offline-support/ ; https://vite-pwa-org.netlify.app/guide/ ; https://github.com/vite-pwa/vite-plugin-pwa/releases

---

## 9. Content authoring and schema

### 9.1 Decision
- **MDX 3** (`@mdx-js/mdx` 3.1.1 via `@next/mdx` 16.3.4) for *explanatory topic pages* — prose + KaTeX + embedded `<Graph>`, `<Molecule3D>`, `<Sim>`, `<Video>`, `<Try>` components mapped in `mdx-components.tsx`. Frontmatter via `remark-frontmatter` + `remark-mdx-frontmatter` or `export const metadata = {...}` (supported natively).
- **JSON question banks validated by Zod 4.5.4** for everything a marking engine consumes. Zod 4 is the source of truth (14× faster string parsing than v3, 57 % smaller core, `z.toJSONSchema()` for editor validation/AI generation). Prefer explicit `.json` files per topic over MDX exports so questions can be linted, deduplicated and fed to FSRS without executing JSX.
- Under Turbopack, custom remark/rehype plugins **must be strings with serialisable options** — a custom plugin (e.g. auto-numbering examples) means either `--webpack` or a pre-build content step. Alternative typed-content pipelines exist: `@content-collections/core` 0.15.2 (MIT), `velite` 0.4.0 (MIT), `contentlayer2` 0.5.8 (MIT).

### 9.2 Proposed schema (TypeScript / Zod 4, abbreviated)

```ts
import * as z from 'zod'

export const SpecRef = z.object({ subject: z.enum(['maths','physics','chemistry','biology']), unit: z.string(), ref: z.string() }) // e.g. CCEA GCSE Maths M4 §4.2

export const Topic = z.object({
  id: z.string(), slug: z.string(), title: z.string(),
  spec: z.array(SpecRef), prerequisites: z.array(z.string()),
  objectives: z.array(z.string()), mdx: z.string(),           // path to topic.mdx
  estimatedMinutes: z.number().int(), tier: z.enum(['foundation','higher','both']),
})

const Tolerance = z.object({
  type: z.enum(['absolute','relative','sigfigs','dp']), value: z.number(),
})
const NumericAnswer = z.object({
  kind: z.literal('numeric'), value: z.number(), tolerance: Tolerance,
  unit: z.string().optional(), acceptUnitless: z.boolean().default(false),
  acceptForms: z.array(z.enum(['decimal','fraction','surd','percent','standardForm'])).default(['decimal']),
})
const AlgebraicAnswer = z.object({
  kind: z.literal('algebraic'), latex: z.string(),            // canonical form, e.g. "2x^2+3x-5"
  equivalence: z.enum(['identical','equal','simplifiedOnly']).default('equal'),
  variables: z.array(z.string()), domain: z.string().optional(),
  mustBeSimplified: z.boolean().default(false), mustBeFactorised: z.boolean().default(false),
})
const McqAnswer = z.object({ kind: z.literal('mcq'), options: z.array(z.object({ id: z.string(), latex: z.string(), correct: z.boolean(), feedback: z.string().optional() })) })
const ShortText = z.object({ kind: z.literal('text'), accepted: z.array(z.string()), keywords: z.array(z.object({ any: z.array(z.string()), marks: z.number() })) })
const Drawing = z.object({ kind: z.literal('drawing'), rubric: z.string() })  // self-/AI-marked

export const MarkPoint = z.object({
  code: z.enum(['M','A','B','C','QWC']),      // method / accuracy / independent / communication
  marks: z.number().int().min(1),
  description: z.string(),                   // "Correct expansion of brackets"
  followThrough: z.boolean().default(false), // ft from earlier error
  requires: z.array(z.string()).default([]), // ids of earlier mark points
})

export const Part = z.object({
  id: z.string(), stem: z.string(),                 // MDX/LaTeX string
  answer: z.discriminatedUnion('kind', [NumericAnswer, AlgebraicAnswer, McqAnswer, ShortText, Drawing]),
  marks: z.number().int(), scheme: z.array(MarkPoint),
  hints: z.array(z.string()), workedSolution: z.string(), // MDX
  commonErrors: z.array(z.object({ pattern: z.string(), feedback: z.string() })).default([]),
})

export const Question = z.object({
  id: z.string(), topicId: z.string(), spec: z.array(SpecRef),
  source: z.enum(['original','pastPaperStyle']), year: z.number().optional(),
  difficulty: z.number().min(1).max(5), calculator: z.boolean(),
  context: z.string().optional(), figures: z.array(z.object({ kind: z.enum(['image','mafs','jsxgraph']), src: z.string() })).default([]),
  parts: z.array(Part), tags: z.array(z.string()),
})
export type Question = z.infer<typeof Question>
```

Design notes: mark points mirror CCEA's M/A/B convention so the engine can award method marks from intermediate steps in multi-step questions; `followThrough` lets a later accuracy mark be awarded on an earlier wrong value; every answer type carries a discriminant so the marking engine is a `switch` over `answer.kind`; JSON Schema exported with `z.toJSONSchema()` gives authors validation in VS Code and gives the Claude tutor a strict output format.

Sources: https://nextjs.org/docs/app/guides/mdx ; https://zod.dev/v4 ; https://zod.dev/v4/changelog ; https://dev.to/pockit_tools/migrating-to-zod-4-the-complete-guide-to-breaking-changes-performance-gains-and-new-features-3ll0

---

## 10. Answer checking

### 10.1 Numeric with tolerance (own code, ~150 lines)
1. Parse input: strip spaces/thousand separators, accept `2/3`, `√2`/`\sqrt{2}`, `3.2×10^4`, `3.2e4`, `45%`, unicode minus, fraction bars. For LaTeX input from MathLive, let compute-engine parse and `N()` it.
2. Units: normalise with mathjs (`math.unit('3 km')` → compare in SI); mark scheme flag `acceptUnitless`.
3. Compare per `tolerance.type`: `absolute` (|a−b| ≤ v), `relative` (|a−b| ≤ v·|b|), `sigfigs` (round both to n s.f. then equal, plus accept "more precise but correct"), `dp`.
4. Form checks (`mustBeSimplified` for fractions/surds) done symbolically (compute-engine `simplify()` equals input's canonical form).
5. Follow-through: re-evaluate later parts with the student's earlier value when `followThrough` is set.

### 10.2 Algebraic equivalence — library comparison

| Library | Version / last publish | Licence | Node | Equivalence facilities | Verdict |
|---|---|---|---|---|---|
| **@cortex-js/compute-engine** | 0.120.0 / 2026-08-27 | MIT | `>=22.3` | Parses LaTeX → MathJSON. `isSame()` structural (canonical form) — `x+x` vs `2x` → false; `isEqual()` "do these two expressions have the same value?" with numeric tolerance, no symbolic proof; **`isIdenticallyEqual()`** — same function of the free variables using "symbolic transformations (expansion and simplification) and numerical sampling", e.g. `(x+1)^2` ≡ `x^2+2x+1` → true; `is()` smart check; `match()` patterns; `simplify()`, `expand()`, `subs()`. Companion **MathLive 0.110.0** (MIT) `<math-field>` gives a LaTeX editor with a virtual keyboard and a React guide. | **Primary** |
| mathjs | 15.2.0 / 2026-04-07 | Apache-2.0 | `>=18` | `simplify()`, `rationalize()`, `derivative()`, units, matrices, BigNumber/fractions. Docs: "for certain classes of expressions … it is undecidable whether a given expression is equivalent to zero"; no equivalence function; `simplify.realContext` for domain safety. | **Secondary** (numeric evaluation, units, sampling) |
| nerdamer | 1.1.13 / **2021-11-17** | MIT | — | Symbolic solve/simplify | Avoid — unmaintained ~5 years |
| Algebrite | 1.4.0 / **2021-04-14** | MIT | — | CAS (Eigenmath port) | Avoid — unmaintained ~5 years |

### 10.3 Recommended algorithm (three-stage, deterministic, offline)
1. **Parse** student LaTeX with compute-engine (`ce.parse(latex, {canonical:true})`); reject on parse error with a helpful message.
2. **Fast path:** `student.isSame(expected)` → full marks and "exactly as expected".
3. **Symbolic path:** `student.isIdenticallyEqual(expected)` (expansion/simplification + sampling) → `true` = equivalent.
4. **Numeric sampling fallback (own):** if `undefined`, substitute 8–12 random rational points inside `domain` for each variable, evaluate both with `N()` (or mathjs), require relative agreement ≤ 1e-9 at every point, rejecting points where either side is non-finite. This catches cases the symbolic engine cannot prove.
5. **Form requirements:** if `mustBeSimplified`, compare `student.simplify().isSame(student)`; if `mustBeFactorised`, check the top-level operator is a product (MathJSON head `Multiply`) and each factor is irreducible (degree ≤ 1 or no rational roots) — implement as a small MathJSON walker.
6. **Feedback:** on equivalent-but-not-simplified answers award accuracy marks minus the "simplest form" mark, per the mark scheme; on non-equivalent answers, run `commonErrors` pattern matches (compute-engine `match()`) for targeted feedback (sign errors, dropped factor of 2, etc.).

Sources: https://mathlive.io/compute-engine/guides/symbolic-computing/ ; https://www.npmjs.com/package/@cortex-js/compute-engine ; https://github.com/cortex-js/compute-engine/blob/main/README.md ; https://github.com/arnog/mathlive ; https://mathjs.org/docs/expressions/algebra.html ; https://nerdamer.com/ ; publish dates via `npm view … time`.

---

## 11. Drawing canvas for "show your working"

| Option | Version | Licence | Assessment |
|---|---|---|---|
| **Excalidraw** (`@excalidraw/excalidraw`) | 0.18.1 (2026-04-20) | **MIT** (Excalidraw) | Peer `react ^17.0.2 \|\| ^18.2.0 \|\| ^19.0.0`. Next.js: `dynamic(() => import(...).then(m => m.Excalidraw), { ssr: false })` in a `"use client"` wrapper; import `@excalidraw/excalidraw/index.css`; **self-host fonts/assets for offline** with `window.EXCALIDRAW_ASSET_PATH = "/excalidraw-assets/"` set before import. Props: `initialData`, `onChange(elements, appState, files)`, `excalidrawAPI`, `viewModeEnabled`, `zenModeEnabled`, `gridModeEnabled`, `UIOptions.canvasActions`, `theme`, `langCode`; export via `exportToBlob/exportToSvg/serializeAsJSON`. Container needs non-zero size. | **Recommended** for the working canvas; persist JSON per question in Dexie. |
| tldraw | 5.3.2 (2026-08-18), `engines.node >=22.12` | Proprietary ("SEE LICENSE IN LICENSE.md"): SDK "permits use only in development"; production requires a **trial** (100 days), **hobby** (free, "made with tldraw" watermark, non-commercial, "discretionary approval by their team") or **commercial** licence (reported at US$6,000/yr per team when 4.0 launched, Sept 2025) | Avoid — licence key requirement is incompatible with a self-hosted, forkable static site. |
| Plain `<canvas>` + Pointer Events | — | — | ~200 lines: pressure-aware strokes, undo stack, PNG export. Zero dependencies, instant load. | Use for the lightweight per-question scratchpad; Excalidraw for full diagrams. |

Sources: https://docs.excalidraw.com/docs/@excalidraw/excalidraw/integration ; https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/props/ ; https://github.com/excalidraw/excalidraw/blob/master/LICENSE ; https://www.npmjs.com/package/@excalidraw/excalidraw ; tldraw licence: https://tldraw.dev/community/license ; licence change coverage: https://tldraw.substack.com/p/license-updates-for-the-tldraw-sdk and https://biggo.com/news/202509190115_tldraw_SDK_4.0_Licensing_Debate ; watermark PR: https://github.com/tldraw/tldraw/pull/4021

---

## 12. Third-party embeds: YouTube, PhET, GeoGebra

### 12.1 YouTube (privacy-enhanced)
- Google: "The Privacy Enhanced Mode of the YouTube embedded player prevents the use of views of embedded YouTube content from influencing the viewer's browsing experience on YouTube" — switch the iframe host to `https://www.youtube-nocookie.com`. It delays cookies until play but the iframe still contacts Google and stores identifiers in localStorage under the `youtube-nocookie.com` origin on load.
- "The YouTube API Terms of Service and Developer Policies apply to all access and use of the YouTube embedded player." If the site is child-directed you "must self-designate your site or app" (Google's tools) so personalised ads are not served. GCSE students are 14–16 (not under-13 "child-directed" in the COPPA sense) but the UK Age-Appropriate Design Code covers under-18s — design as if it applies.
- Required minimum functionality: viewport "at least 200px by 200px"; 16:9 with controls "at least 480 pixels wide and 270 pixels tall"; "must not display overlays, frames, or other visual elements in front of any part of a YouTube embedded player"; autoplay only if >½ of the player is visible and at most one autoplaying player per page; playback-initiating thumbnails ≥ 120×70.
- Developer policies: must not "download, import, backup, cache, or store copies of YouTube audiovisual content" — so **video is never available offline**; show an "online only" badge in the PWA.
- Implementation: click-to-load facade (static thumbnail ≥ 120×70 rendered by us, not an overlay on the player) → on click inject the `youtube-nocookie.com` iframe with `autoplay=1` (user-initiated) and `rel=0`. No custom controls over the player.

Sources: https://support.google.com/youtube/answer/171780?hl=en ; https://developers.google.com/youtube/terms/required-minimum-functionality ; https://developers.google.com/youtube/terms/developer-policies ; tracking analysis https://swarmify.com/blog/what-is-youtube-nocookie/ ; https://www.ignite.video/en/articles/basics/youtube-no-cookie

### 12.2 PhET
- HTML licensing page: "Historical HTML Simulations" (published **before 29 March 2026**) are **CC BY 4.0** — "freely used and/or redistributed by third parties … for non-commercial or commercial purposes". Mandatory attribution text: *"Simulation by PhET Interactive Simulations, University of Colorado Boulder, licensed under CC BY 4.0 (https://phet.colorado.edu)"* placed "as close as possible to the point of use and … human-readable"; the PhET logo must remain "visible, unobstructed, and unaltered". Using the PhET brand for promotion requires a separate agreement. **Newer sim versions and PhET-iO are under different terms** listed on the main licensing page, which is JavaScript-rendered and could not be read programmatically — check https://phet.colorado.edu/en/licensing manually before self-hosting any post-March-2026 build.
- Embedding: each sim page has an "Embed" button producing iframe code; offline: download the single-file `<sim>_all.html` from the sim page (runs from a USB stick), `?locale=` query for language; full offline installer available.
- Recommendation: iframe from `phet.colorado.edu` when online (with attribution block); for offline, self-host specific CC BY 4.0 (pre-29-Mar-2026) `_all.html` files under `/public/phet/` with the attribution text and untouched logo. Keep a manifest of sim name → version → licence.

Sources: https://phet.colorado.edu/en/licensing/html ; https://phet.colorado.edu/en/help-center/getting-started ; https://phet.colorado.edu/en/help-center/offline ; https://phet.colorado.edu/en/help-center/running-sims ; PhET-iO devguide: https://phet-io.colorado.edu/devguide/

### 12.3 GeoGebra — see §4 (non-commercial licence, attribution "Made with GeoGebra®", offline bundle).

---

## 13. Optional Claude "tutor" mode

Architecture rule: a static export has no server, so **the API key must never be in the bundle**. Three deployment shapes:
1. **Local dev / self-hosted:** a 40-line Node 24 script (`node --env-file=.env tutor-proxy.mjs`) using `@anthropic-ai/sdk` 0.123.0 with a zero-arg `new Anthropic()` (reads `ANTHROPIC_API_KEY` or an `ant auth login` profile). The static site calls `http://localhost:8787/tutor`.
2. **Vercel / Netlify:** the same handler as a serverless function (this is the one place the "optional backend" exists). GitHub Pages cannot host it — tutor mode is disabled there unless the user supplies their own key (BYO-key mode stored in IndexedDB; the SDK's browser-usage opt-in flag must be set deliberately and the user warned — verify the current flag name in the TypeScript SDK README before implementing).
3. **Offline:** tutor is unavailable; the UI degrades to worked solutions and hints from the question bank.

API usage recommendations (per the current Anthropic documentation):
- Model `claude-opus-5` by default (1M context, $5 / $25 per MTok input/output); `claude-sonnet-5` ($2 / $10) or `claude-haiku-4-5` ($1 / $5) if cost dominates — make it a config switch.
- `thinking: { type: "adaptive" }` (not `budget_tokens`), `output_config.effort` `medium`/`high` for marking, streaming via `client.messages.stream(...)` for the chat UI, `max_tokens` ≈ 16000 non-streaming / higher when streaming.
- **Prompt caching:** put the frozen system prompt (CCEA subject persona, marking rules) and the topic's mark scheme first with `cache_control: { type: "ephemeral" }`; the volatile student answer last.
- **Structured outputs** (`output_config.format` with the Zod `MarkPoint[]` JSON Schema) for "mark my working" so the app can render awarded marks deterministically.
- Send Excalidraw canvases as PNG (`exportToBlob`) using the vision content block.
- Rate-limit per session and cap spend server-side; never log student text beyond what is needed.

Sources: https://platform.claude.com/docs/en/about-claude/models/overview.md ; https://platform.claude.com/docs/en/pricing.md ; https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking.md ; https://platform.claude.com/docs/en/build-with-claude/streaming.md ; https://platform.claude.com/docs/en/build-with-claude/prompt-caching.md ; https://platform.claude.com/docs/en/build-with-claude/structured-outputs.md ; https://platform.claude.com/docs/en/build-with-claude/vision.md ; SDK: https://github.com/anthropics/anthropic-sdk-typescript (npm `@anthropic-ai/sdk` 0.123.0, MIT).

---

## 14. Testing

- **Vitest 4.1.11** (MIT; `engines.node ^20 || ^22 || >=24`): Browser Mode is stable in v4 (released 22 Oct 2025) with `@vitest/browser-playwright` 4.1.11 as the recommended provider ("supports parallel execution"), visual-regression testing and Playwright trace output. Use it for component tests of `<Tex>`, graphs, marking engine (pure unit tests in Node), and Dexie logic (fake-indexeddb).
- **Playwright 1.62.1** (Apache-2.0; `engines.node >=20`): E2E incl. offline mode (`context.setOffline(true)`), service-worker precache assertions, PWA install flow, keyboard accessibility; 1.62 adds `AbortSignal` support, WebP screenshots and `retryStrategy: 'isolated'`.
- Marking-engine golden tests: a JSON corpus of (question, student answer, expected marks) run in Node — fast, deterministic, no browser.

Sources: https://vitest.dev/guide/browser/ ; https://www.infoq.com/news/2025/12/vitest-4-browser-mode ; https://playwright.dev/docs/release-notes

---

## 15. Windows 11 + Node 24 pitfalls (and fixes)

| # | Pitfall | Evidence | Fix |
|---|---|---|---|
| 1 | **`npm`/`npx` blocked in Windows PowerShell 5.1** — Node 24 ships `npm.ps1`/`npx.ps1` (shebang `#!/usr/bin/env pwsh`); unsigned, so `AllSigned`/default policies throw "running scripts is disabled". nodejs/node #62427 closed as *not planned*. | https://github.com/nodejs/node/issues/62427 ; https://github.com/openclaw/openclaw/issues/24784 | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or call `npm.cmd` / `npx.cmd`, or use PowerShell 7 (`pwsh`) / Git Bash. Put `npm.cmd` in `package.json` scripts docs for contributors. |
| 2 | **`MAX_PATH` = 260 chars.** Deep `node_modules` (pnpm virtual store, three.js examples, Playwright browsers) and long project names overflow. The current folder `C:\Users\feras\Downloads\CCEA GCSE Top Learning Platform\` already spends 55 characters and contains spaces. | https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation | Enable long paths: `New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name LongPathsEnabled -Value 1 -PropertyType DWORD -Force` (admin; reboot) — note Microsoft says apps must also be long-path aware, so still **move the repo to a short path without spaces**, e.g. `C:\dev\ccea`. Set `git config --global core.longpaths true` (Git for Windows option, see https://git-scm.com/docs/git-config). Prefer npm (flat `node_modules`) over pnpm's nested store on Windows. |
| 3 | **Downloads / OneDrive / Defender-scanned folders slow or break file watching**; Next.js docs explicitly recommend adding the project folder to Microsoft Defender exclusions on Windows. | https://nextjs.org/docs/app/guides/local-development | Move out of `Downloads`/OneDrive; add Defender exclusion; keep `.next`, `out`, `node_modules` on a local NTFS drive. |
| 4 | **File watchers**: Vite docs — polling (`server.watch.usePolling`) "leads to high CPU utilization"; WSL2 cannot see edits made by Windows apps. Turbopack "OS file watch limit reached" issues exist (Linux-reported). Tailwind 4.3.2 fixed a Windows watch-mode crash; 4.3.3 added polling for unreliable file systems. | https://vite.dev/config/server-options ; https://github.com/vercel/next.js/issues/75828 ; https://github.com/tailwindlabs/tailwindcss/releases | Develop natively on Windows (not WSL2 with files on `C:`); avoid polling unless on a network drive; keep watched trees small (`content/` not `node_modules`). |
| 5 | **Turbopack on Windows**: Sass `@use/@forward` path bug (#87243, open); `npm link`/symlink resolution breaks. | https://github.com/vercel/next.js/issues/87243 ; https://steveharrison.dev/next-js-16s-turbopack-breaks-npm-link/ | Do not use Sass (Tailwind v4 + CSS); use `next dev --webpack` if a Windows-only Turbopack bug appears; avoid `npm link` (use `file:` deps or a workspace). |
| 6 | **Vite 8 / Rolldown**: beta had a Windows null-byte path error (`ERR_INVALID_ARG_VALUE`), fixed for 8.0.0 stable; `build.rollupOptions.watch.chokidar` removed → `build.rolldownOptions.watch.watcher`. | https://github.com/vitejs/rolldown-vite/issues/584 ; https://main.vite.dev/guide/migration | Stay on ≥ 8.2.2. |
| 7 | **Case-insensitive file system + CRLF**: imports that differ only in case work on Windows and fail on Vercel/Netlify Linux builders; CRLF in MDX can trip snapshot tests. | (general; Next docs assume Linux CI) | `.gitattributes` with `* text=auto eol=lf`; ESLint `import/no-unresolved` with `caseSensitive`; run `next build` in CI on Linux early. |
| 8 | **Next 16 lockfile / separate dev & build output dirs**: two `next dev` instances on the same folder are blocked. | https://nextjs.org/blog/next-16 | Kill stale `node` processes (`Get-Process node \| Stop-Process`) before restarting. |
| 9 | **Excalidraw / KaTeX / Mafs assets offline**: fonts load from CDN or package paths by default. | https://docs.excalidraw.com/docs/@excalidraw/excalidraw/integration ; https://mafs.dev/guides/get-started/installation | Copy assets to `public/`, set `EXCALIDRAW_ASSET_PATH`, self-host `katex.min.css` + fonts, precache them. |
| 10 | **Large chunks vs service-worker precache limit** (three.js, Excalidraw ≈ MBs). | https://serwist.pages.dev/docs/next/configuring | Raise `maximumFileSizeToCacheInBytes`; lazy-load 3D/drawing per route; keep `Plotly` out. |
| 11 | **Node 24 `--env-file`, `node:sqlite`, `node:test`** are available — use them for the tutor proxy and build scripts instead of extra deps. | Node 24 runtime (verified `v24.18.0` locally) | — |

---

## 16. Deployment matrix

| Target | Next.js static export | Notes |
|---|---|---|
| Local | `npx serve out` or `npx http-server out -c-1` | Service worker requires `http://localhost` (secure context OK). |
| Vercel | Auto-detects Next; with `output:'export'` it serves `out/` as static. | No serverless functions unless you add `api/` functions for the tutor. |
| Netlify | Publish directory `out`, build `npm run build && npm run sw` (post-build Serwist step). | Netlify Functions for the tutor. Netlify's Next docs focus on the OpenNext adapter; static export needs no adapter. |
| GitHub Pages | Official template: `output:'export'`, `basePath: process.env.PAGES_BASE_PATH`; add `.nojekyll`; `images.unoptimized`. | No tutor backend (BYO-key only). |

Sources: https://nextjs.org/docs/app/guides/static-exports ; https://github.com/nextjs/deploy-github-pages ; https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/

---

## 17. Verified package table (npm registry, queried 2026-09-01)

| Package | Version | Published (UTC) | Licence | `engines.node` |
|---|---|---|---|---|
| next | 16.3.4 | 2026-08-31 | MIT | >=20.9.0 |
| react / react-dom | 19.2.8 | 2026-07-21 | MIT | — |
| astro | 7.2.10 | 2026-08-31 | MIT | >=22.12.0 |
| @astrojs/react / @astrojs/mdx | 6.0.5 / 8.0.0 | — | MIT | >=22.12.0 |
| @sveltejs/kit / adapter-static | 2.70.3 / 3.0.10 | 2026-08-18 | MIT | >=18.13 |
| vite | 8.2.2 | 2026-08-20 | MIT | ^20.19.0 \|\| >=22.12.0 |
| katex | 0.18.5 | 2026-08-31 | MIT | — |
| mathjax | 4.1.3 | 2026-07-03 | Apache-2.0 | — |
| mafs | 0.21.0 | **2024-10-20** | MIT | >=20.11.0 |
| jsxgraph | 1.13.2 | 2026-08-17 | (MIT OR LGPL-3.0-or-later) | >=20.19.0 |
| ts-fsrs | 5.4.2 | 2026-09-01 | MIT | >=20.0.0 |
| motion / framer-motion | 13.1.1 | 2026-08-20 | MIT | — |
| gsap | 3.15.0 | 2026-04-13 | Standard "no charge" licence | — |
| tailwindcss / @tailwindcss/postcss / @tailwindcss/vite | 4.3.3 | 2026-07-16 | MIT | — |
| @tailwindcss/typography | 0.5.20 | — | MIT | — |
| shadcn (CLI) | 4.19.1 | — | MIT | — |
| @base-ui/react | 1.7.0 | — | MIT | — |
| radix-ui | 1.6.7 | 2026-07-24 | MIT | — |
| lucide-react | 1.39.0 | 2026-09-01 | ISC | — |
| dexie / dexie-react-hooks | 4.4.5 / 4.4.0 | 2026-08-14 | Apache-2.0 | — |
| zustand | 5.0.15 | 2026-08-13 | MIT | >=12.20.0 |
| idb-keyval | 6.3.0 | — | Apache-2.0 | — |
| @cortex-js/compute-engine | 0.120.0 | 2026-08-27 | MIT | >=22.3.0 |
| mathlive | 0.110.0 | 2026-06-09 | MIT | — |
| mathjs | 15.2.0 | 2026-04-07 | Apache-2.0 | >=18 |
| nerdamer | 1.1.13 | **2021-11-17** | MIT | — |
| algebrite | 1.4.0 | **2021-04-14** | MIT | — |
| three | 0.185.1 | 2026-07-01 | MIT | — |
| @react-three/fiber | 9.7.0 | 2026-07-31 | MIT | — |
| @react-three/drei | 10.7.8 | 2026-08-05 | MIT | — |
| lenis | 1.3.26 | 2026-08-05 | MIT | — |
| zod | 4.5.4 | 2026-08-29 | MIT | — |
| vitest / @vitest/browser-playwright | 4.1.11 | 2026-08-18 | MIT | ^20 \|\| ^22 \|\| >=24 |
| @playwright/test | 1.62.1 | 2026-07-30 | Apache-2.0 | >=20 |
| serwist / @serwist/next / @serwist/turbopack / @serwist/build / @serwist/cli | 9.5.12 | 2026-07-22 | MIT | (@serwist/next >=18) |
| vite-plugin-pwa | 1.3.0 | 2026-05-05 | MIT | >=16 |
| @vite-pwa/astro / @vite-pwa/sveltekit | 1.2.0 / 1.1.0 | — | MIT | — |
| @mdx-js/mdx / loader / react | 3.1.1 | 2025-08-29 | MIT | — |
| @next/mdx | 16.3.4 | — | MIT | — |
| remark-math / rehype-katex / remark-gfm | 6.0.0 / 7.0.1 / 4.0.1 | — | MIT | — |
| @excalidraw/excalidraw | 0.18.1 | 2026-04-20 | MIT | — |
| tldraw | 5.3.2 | 2026-08-18 | "SEE LICENSE IN LICENSE.md" (proprietary) | >=22.12.0 |
| plotly.js-dist-min | 4.0.0 | 2026-08-24 | MIT | — |
| d3 | 7.9.0 | 2024-03-12 | ISC | >=12 |
| @anthropic-ai/sdk | 0.123.0 | 2026-09-01 | MIT | — |
| babel-plugin-react-compiler | 1.0.0 | — | MIT | — |

All of the "known current versions" supplied in the brief were confirmed against the registry.

---

## 18. Licence summary

| Component | Licence | Obligations / risk for a free, self-hosted educational site |
|---|---|---|
| Next.js, React, Vite, Astro, SvelteKit, Tailwind, shadcn, Base UI, Radix, Motion, Zustand, Zod, Vitest, Serwist, vite-plugin-pwa, MDX, KaTeX, Mafs, three, R3F, drei, Lenis, compute-engine, MathLive, Excalidraw, Plotly, nerdamer, Algebrite | MIT | Keep notices. |
| Lucide, D3 | ISC | Keep notices (Lucide: Feather-derived icons under MIT). |
| MathJax, Dexie, mathjs, Playwright, idb-keyval | Apache-2.0 | Keep notices + NOTICE files. |
| JSXGraph | MIT **or** LGPL-3.0-or-later (your choice) | Pick MIT for a static bundle. |
| GSAP (all plugins) | GSAP Standard "no charge" licence (30 Apr 2025) | Free incl. commercial; cannot be used to build a competing visual animation tool. |
| tldraw | Proprietary SDK licence | Dev-only without key; production = hobby (watermark, approval), trial or paid. **Not used.** |
| Desmos API | Desmos API Terms + API key; partner-only self-hosting | **Not used.** |
| GeoGebra apps | Non-commercial licence (+EUPL source) | Free while non-commercial, attribution "Made with GeoGebra®" + link; licence needed if ever sold. |
| PhET HTML5 sims | CC BY 4.0 for versions published before 29 Mar 2026; newer versions under separate terms | Exact attribution text and visible logo; verify newer versions' terms. |
| YouTube embed | YouTube API ToS + Developer Policies + Required Minimum Functionality | Privacy-enhanced host, no overlays, size minimums, no caching/download, child-directed designation if applicable. |
| Claude API | Anthropic Commercial Terms | Key server-side only; usage costs per token. |

---

## 19. Open items that could not be verified programmatically
1. Desmos API Terms of Service (https://www.desmos.com/api-terms) and Terms (https://www.desmos.com/terms) are JavaScript-rendered — read manually if Desmos is ever reconsidered.
2. PhET's main licensing page (https://phet.colorado.edu/en/licensing) is JavaScript-rendered — the post-29-March-2026 simulation licence must be read manually before self-hosting new sim builds.
3. `@serwist/turbopack` behaviour with `output: 'export'` was not exercised — the post-build `@serwist/cli build` route avoids the question.
4. Mafs has had no release since October 2024; confirm it still builds against React 19.2.8 in the first spike (peer range `>=18` allows it).
