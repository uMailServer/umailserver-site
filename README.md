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
npm run build
npm run check:export
npm run preview
```

Preview: http://127.0.0.1:4173. `scripts/serve.mjs` serves the actual `out/` files, including nested routes and a real 404 response. It is a development preview, not a production server.

`check:export` checks every HTML file for a title, a single h1 and local link/asset targets, then verifies canonical URLs, descriptions, robots, sitemap, CNAME, social assets and `.nojekyll`.

## Layout and content

- `src/app/page.tsx`: product landing page.
- `src/app/docs/`: overview, quick start, architecture, deployment, security and current limitations.
- `src/app/brand/`: downloadable SVG identity.
- `src/components/`: shared identity, diagrams, navigation, theme picker, copy buttons and installation tabs.
- `src/app/globals.css`: central theme, container, gutter, spacing, typography and breakpoint tokens. Main containers cap at 1720px.
- `public/`: SVG sources, raster social/apple icons, custom domain and Pages files.
- `docs/RESEARCH.md`: product sources and content decisions.
- `docs/VALIDATION.md`: verification record and limitations.

The web UI illustration is explicitly conceptual. It is not a screenshot. No testimonial, benchmark, customer count or delivery guarantee is presented.

The theme picker follows CobaltDB's three interface previews, native Light/Dark/System radio controls, selected checkmark, status copy and keyboard/focus behavior. The Oxog studio card follows NineDeploy's rounded panel, ambient pink/purple accents, original four-path symbol and project links. Its signature draws on viewport entry over 1.6 seconds with .25/.5/.9-second path delays. Reduced-motion CSS disables decorative motion, transitions and smooth scrolling; the complete logo and content remain visible without JavaScript.

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
