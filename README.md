# uMailServer website

The English product site for [uMailServer](https://github.com/uMailServer/uMailServer), built with Next.js, React and TypeScript. Static export, self-hosted fonts, original SVG diagrams, light/dark/system themes and source-grounded guides.

Production domain: **https://umailserver.com**

Website repository: **https://github.com/umailserver/umailserver-site**

## Local development

Use the version in `.nvmrc` (Node.js 26.12.0) and npm 12.2.0. These versions are also pinned in the deployment workflow.

```sh
npm install --global npm@12.2.0
npm ci
npm run dev
```

The development server binds to `127.0.0.1:3000` by default.

## Check and preview the production export

```sh
npm run typecheck
npm test
npm run build
npm run check:export
npm run preview
```

Preview: http://127.0.0.1:4173. Set `PORT` to use a different free port (for example, `$env:PORT='4185'; npm run preview` in PowerShell). `scripts/serve.mjs` serves the actual `out/` files, including nested routes and a real 404 response. It is a development preview, not a production server.

`check:export` checks every HTML file for a title, a single h1 and local link/asset targets, then verifies canonical URLs, descriptions, robots, sitemap, CNAME, social assets and `.nojekyll`.

## Layout and content

- `src/app/page.tsx`: product landing page.
- `src/app/docs/`: overview, quick start, architecture, deployment, security and current limitations.
- `src/app/brand/`: downloadable SVG identity.
- `src/components/`: shared identity, diagrams, navigation, theme picker, copy buttons and installation tabs.
- `src/components/site-background.tsx`: reusable, site-wide SVG field and reaction layers with global input/lifecycle handling.
- `src/lib/ambient-scene.ts`: deterministic world geometry, density/effect budgets, local forces, tap recognition and cancellable RAF loop.
- `tests/ambient-scene.test.mjs`: native Node tests for effect limits, lifetime, timing, reduced motion, input filtering and scheduling.
- `src/app/globals.css`: central theme, container, gutter, spacing, typography and breakpoint tokens. Main containers cap at 1720px.
- `public/`: SVG sources, raster social/apple icons, custom domain and Pages files.
- `docs/RESEARCH.md`: product sources and content decisions.
- `docs/VALIDATION.md`: verification record and limitations.

The web UI illustration is explicitly conceptual. It is not a screenshot. No testimonial, benchmark, customer count or delivery guarantee is presented.

The theme picker follows CobaltDB's three interface previews, native Light/Dark/System radio controls, selected checkmark, status copy and keyboard/focus behavior. The Oxog studio card follows NineDeploy's rounded panel, ambient pink/purple accents, original four-path symbol and project links. Its signature draws on viewport entry over 1.6 seconds with .25/.5/.9-second path delays. Reduced-motion CSS disables decorative motion, transitions and smooth scrolling; the complete logo and content remain visible without JavaScript.

## Site-wide SVG background

`SiteBackground` is mounted once in the root layout, including documentation, brand and error pages. Seven reusable SVG symbols form a deterministic field of geometric shapes, fine connector lines and small envelopes. Three depths use different slow drift and scroll factors. World-space bands recycle a fixed pool of at most 144 objects; mobile uses two layers, fewer columns and lower frame rates. Only viewport objects update their SVG transforms. There is no Canvas, animation dependency or per-frame React render.

The body-level SVG uses two unmasked groups: a quiet field and a stronger reaction layer. Its explicit foreground stacking level stays above section/card surfaces and outside their `overflow` and `isolation` contexts. Only the viewport clips it. Readability comes from low-alpha thin strokes and a faint radial gradient, not rectangular text masks. Existing light/dark/system tokens control both layers. The SVG remains decorative, unfocusable and `pointer-events: none`; the header mouse toggle beside the theme picker is a separate accessible button.

Global passive capture listeners track client coordinates over text, cards, links and buttons. Click filtering is independent: links, controls, editable areas and `data-background-ignore` do not emit waves. Ordinary text taps can emit waves; scrolling, dragging, text selection, long presses and mismatched pointers cannot. No handler prevents native input. Pointer fields stay in client space while scrolling; click waves use document coordinates, synchronized at pointer-up even before the next scroll frame.

Within 330px on desktop or 230px on mobile, objects attract/repel, ripple, rotate and brighten with smooth distance falloff. A faint pointer halo, up to six curved connections (three on mobile) and an 18-point, 0.85-second trail make movement visible over content. Idle pointer influence fades after three seconds. Clicks create 1.9-second waves and eight particles; the same eased radius drives the drawn wave and physical impulse. The radius is 330px on desktop or 220px on mobile, with a 135px maximum combined displacement. Nearby rapid clicks merge without renewing age; signals are capped at five/three. Scrolling carries existing signals with their document location and discards departed ones.

Pointer displacement follows a breathing orbital field with individual depth speeds and smooth easing. Click waves seed short relays at nearby shapes, which can excite their neighbours through at most two subsequent hops. A shape emits only once per cascade, each relay has at most two children, and power falls to 55% at each hop. Cascades allow nine nodes on desktop or five on mobile, with at most 12/6 active 0.72-second relays and a hard 3.2-second lifetime. Thin connector traces and faint local rings show the transfer; echoes yield smoothly to the primary impulse. No all-pairs neighbour search or new animation dependency is needed.

The header mouse toggle controls only pointer/click effects. The quiet geometric field keeps drifting while the switch is off. Its Turkish tooltip and accessible label change between “Fare efektlerini kapat” and “Fare efektlerini aç”; the 44px native button supports keyboard activation, a visible focus ring and a slashed, muted off icon. The `umail-animations` localStorage key stores `on` or `off`. Without a valid saved choice, the preference follows `prefers-reduced-motion`; an explicit choice overrides that default. Cross-tab storage changes synchronize the control and scene, and blocked storage still permits an in-memory choice.

Switching off clears waves, relays, trails and pointer displacement, and removes the pointer listeners. The same scene, object identities and clock remain alive at the lower idle frame rate for quiet drift and parallax; switching on reconnects input without restarting the field. Scroll/resize observers remain available for the quiet field. Other UI behavior, logo animations and theme transitions are independent. While mouse effects are off, an OS reduced-motion preference also freezes the quiet field and stops its RAF loop, leaving static geometry with ordinary scrolling. Explicitly enabling mouse effects overrides that system default, as before. Hidden documents and invisible layers stop the loop, and background-tab effects are cleared. Offscreen objects skip motion work and SVG updates; expired effects hide their fixed DOM slots. There are no per-frame layout reads or React state updates. The background falls back to existing CSS surfaces without JavaScript.

`og.png`, its compatibility copy `social.png`, and the apple icon are checked in so CI does not need asset generation. Open Graph and Twitter metadata use `/og.png` (1200×630). To regenerate them after changing the corresponding SVG sources, run `node scripts/generate-assets.mjs` with the installed dependencies (Next.js supplies Sharp).

## GitHub Pages

`.github/workflows/pages.yml` installs the pinned toolchain, runs typecheck, builds the export, checks it, uploads `out/` and deploys through the GitHub Pages environment.

Repository settings → Pages → **GitHub Actions**. Custom domain: **umailserver.com**. `public/CNAME` and `public/.nojekyll` are copied to the root of `out/`. No `basePath` is used because the site targets the custom domain root.

### Web DNS

Use the [current GitHub Pages custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). Apex A records for `@`:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

For `www`, use a CNAME pointing to `umailserver.github.io` if that hostname should also be supported. Do not change MX, mail-host A records, SPF, DKIM, DMARC or other email service records. Enable Enforce HTTPS after GitHub provisions the certificate. DNS changes require access to the domain's DNS provider.

## Content maintenance

Recheck the authoritative product source before updating features, ports, license or installation snippets. The beta has no published releases at the research revision; the website deliberately uses source builds. In particular, the current root LICENSE is AGPL-3.0-or-later and built-in web listeners speak HTTP, despite contradictory older promotional material.
