# Website verification

18 October 2026. Product content is grounded at `cc09145f03e150bb6218cf8c32abf3b4675176dd`. This record concerns the website; a real mail server was not deployed or tested.

## Local results

- Clean `npm ci` with Node 26.12.0 / npm 12.2.0: passed, zero reported dependency vulnerabilities.
- `npm run typecheck`: passed.
- `npm run format:check`: passed after formatting source and documentation.
- `npm run build`: passed; all routes statically exported.
- `npm run check:export`: passed, 10 generated HTML files and 298 internal links/assets checked, including canonical metadata, CNAME and `.nojekyll`.
- Actual exported files served locally: home and nested documentation routes return HTTP 200; the preview server supplies the exported 404 for unknown paths.
- Browser layout matrix: 7 public pages × 7 widths × 2 themes = 98 DOM layout checks. Widths: 375, 768, 1024, 1440, 1920, 2560, 3840. No document-level horizontal overflow found. The wide container caps at 1720px.
- Representative mobile and desktop screenshots reviewed, including hero, features, brand assets and deployment guide.
- Theme selection, reload persistence, Escape-to-trigger focus, mobile navigation opening/closing and anchor navigation exercised.
- Installation method tabs exercised by click and keyboard arrow; source command copying confirmed through rendered “Copied!” feedback and exact browser clipboard contents.
- FAQ disclosure exercised. Browser error/warning log returned no entries on the exercised paths.
- Light-theme muted text and teal text tokens were checked against their light surfaces and darkened to exceed 4.5:1 for normal text.
- Reduced-motion rules reviewed in source: disable decorative CSS animations/transitions, smooth scroll, signature drawing and hide moving SVG mail packets. OS reduced-motion emulation was not available through the selected browser controls, so that media mode is source-checked rather than runtime-certified.

After the initial matrix, the incoming-mail diagram's route label was corrected to “Sieve · local delivery” to avoid implying every inbound message enters the outgoing queue. Mobile documentation links were enlarged. Production build and export checks were rerun.

## Theme picker and Oxog reference alignment

The updated components were checked against the live CobaltDB theme panel and live NineDeploy footer. Local production build and export verification passed. Browser checks covered:

- Native radio selection with keyboard arrows, Escape returning focus to the trigger, closing on focus-out, and saved theme restoration after reload.
- Three preview cards and an in-viewport panel at all seven target widths in both themes: 14 panel checks passed.
- All seven public pages at all seven target widths in both themes: 98 layout checks, no document-level horizontal overflow.
- Oxog logo state changing from `waiting` to `drawing` on viewport entry, four 1.6-second path animations with 0/.25/.5/.9-second delays, and completed paths at zero dash offset.
- Desktop and mobile screenshots of the panel and studio card. Reduced-motion behavior is implemented in both the observer and CSS; OS media emulation remains unavailable through the selected browser controls.

## Publication boundary

Repository and GitHub Pages workflow have been prepared. GitHub Pages custom domain is set to `umailserver.com`.

At verification time, Pages domain health reported `NotServedByPagesError`: the apex lacks a GitHub Pages A record. The domain's existing MX records point to `mx1.efwd.spaceship.net` and `mx2.efwd.spaceship.net`; these were not changed.

DNS provider access is not available in this task. Add the four apex A records documented in README, then enable HTTPS after GitHub's certificate is issued. Custom-domain HTTP/HTTPS delivery and live asset checks cannot be certified before that change. See GitHub Actions for the separate build/deployment result.
