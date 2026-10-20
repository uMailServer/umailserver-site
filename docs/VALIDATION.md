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

## Interactive full-width hero

- Nine native Node behavioral tests pass: 1,000-click bounded stress, nearby-click merging and expiry, 60/120Hz timing equivalence, local pointer response and exit settling, static reduced-motion mode, mobile/4K backing budgets, single-chain RAF pause/resume/disposal, tap-versus-scroll/drag/long-press filtering, and theme interpolation.
- Production export passes with 10 HTML files and 299 internal links/assets. The client component adds no dependency and preserves static export.
- Browser matrix: 375, 768, 1024, 1440, 1920, 2560 and 3840px in both themes. All 14 cases fill the full hero width, have no horizontal document overflow, and remain below the 3.2M-pixel backing budget. Mobile uses 24 packets; the widest scene uses 72.
- Browser interaction checks: empty-area taps produce short-lived bursts; repeated taps remain bounded; copy/pause/resume controls do not increment background interactions; signals return to zero; a fully offscreen hero reports paused and resumes when returned to view. Mobile navigation and the real getting-started CTA work, removing the canvas on route exit.
- Live browser logs on exercised paths contain no errors or warnings. Mobile, desktop and 4K screenshots were reviewed.
- Reduced-motion simulation and RAF cancellation are exercised by engine/scheduler tests. OS reduced-motion emulation is unavailable through this browser, and its background tabs stay `visible`, so native OS preference and hidden-tab transitions are source-checked rather than claimed as live browser passes. The explicit pause control and offscreen pause were exercised in the browser.
- Preview used isolated port 4185; another project's existing server on 4173 was left alone.

## Site-wide SVG background

The site-wide `SiteBackground` replaces the earlier hero-only Canvas implementation described above.

- Nine native Node tests pass for bounded populations across mobile/4K/very long documents, stable world identities and depth parallax, 1,000-click limits and expiry, merging without age renewal, scroll-anchored signals, local pointer settling, static reduced motion including deep scrolling, refresh-rate independence, offscreen motion culling, RAF pause/resume/disposal and tap filtering.
- The component uses reusable SVG symbols, one luminance mask and a fixed pool of 144 object groups. Mobile has fewer layers/columns, at most three bursts and lower frame limits. Desktop allows five bursts. Every burst expires within 1.9 seconds. These are configured limits, not benchmark claims.
- Browser matrix: all seven public pages at 375, 768, 1024, 1440, 1920, 2560 and 3840px in both themes. All 98 cases passed: one full-viewport SVG, no Canvas, no horizontal document overflow, bounded populations and `pointer-events: none`. At the tested heights, active pools ranged from 20 to 108 objects.
- Screenshots reviewed the light/dark hero, section boundaries, mobile middle sections and footer. Masks protect content, illustrations, cards, controls and tables while the same SVG continues across opaque section surfaces.
- Actual browser input: empty-area taps create waves/particles, six rapid mobile taps stay capped at three simultaneous signals, dragging does not increment interactions, scrolling remains functional and departed effects disappear. Copy, theme and pause controls do not create click signals. Explicit pause freezes object transforms; resume restarts motion. A mobile CTA performs a real client-side route transition and retains a single SVG layer. Final exercised paths have no browser errors/warnings.
- Reduced-motion simulation and the cancellable scheduler are tested directly. OS media emulation and hidden-tab transitions remain unavailable through this browser, so their DOM event wiring is source-reviewed, not claimed as live browser passes. Offscreen simulation objects skip motion work; the renderer skips offscreen/fully masked objects. Hidden documents stop the RAF chain and clear transient effects.
- Final typecheck, formatting and all nine tests pass. Production build and export checks pass: 10 HTML pages, 2,148 internal links/assets including reusable SVG references. Preview uses isolated port 4185.

## Continuous foreground response and stronger forces

This revision replaces the rectangular content masks in the preceding implementation.

- Root cause verified in the live DOM: the SVG is a fixed child of `body`, and the clipped hero/cards/studio are its siblings. Their `overflow`/`isolation` do not clip this SVG. A shared luminance mask applies black rectangles to both geometry and waves, and covered objects are explicitly hidden. The move handler also stops tracking over text/controls; scrolling calls its leave handler. Those paths account for the flat clipping, gaps and weak tracking.
- Before proof: a paragraph click produced zero waves while an empty-area click produced one. The original source passed nine tests but failed two stronger-response regressions: nearby pointer travel was only 15.41px and the click-wave displacement peaked at 7.25px in deterministic fixtures. Both unchanged assertions now pass (more than 24px), alongside the existing controls.
- The root SVG now uses separate unmasked quiet/reaction groups above page surfaces, an explicit body stacking context, global passive capture tracking and independent control-click filtering. Low-opacity strokes/glow preserve readable content without rectangular boundaries. No new animation dependency or per-frame React render/layout query was introduced.
- Fourteen behavioral tests pass, including bounded/expiring trails, pointer/client-space scroll continuity, fresh document-space clicks, capped overlapping impulses, reduced-motion clearing and all prior timing, density, gesture and scheduler controls.
- Final browser matrix: seven public pages at 375, 768, 1024, 1440, 1920, 2560 and 3840px in both themes, 98/98 passed. Each check waits for the requested SVG viewBox and running lifecycle, and asserts the actual viewport width/height, full-viewport geometry, no document overflow, one SVG, zero rectangular masks, bounded object populations, `pointer-events: none` and the expected foreground stacking level. Initial unsynchronized resize/lifecycle observations were rechecked after their actual frame/observer updates, not counted as application failures.
- Actual input: paragraph and card text now receive pointer tracking and waves. A captured dark-theme wave crosses multiple card borders without clipping. Native drag visibly selects paragraph text and does not add a click signal; Copy and theme controls also do not add signals. Scrolling retained the pointer at client `(1019, 555)`; the next wave appeared exactly at client `(600, 555)` after scrollY 1752. Mobile paragraph input at `(180, 355)` and scrolling to 1688 also preserved the pointer coordinate and native scrolling.
- Explicit pause preserved five sampled SVG transforms across separate observations; resume and a real CTA route transition retained one running SVG. Final formatting, typecheck, 14 tests and the production export check passed (10 HTML pages, 3,588 internal links/assets).
- Light/dark, mobile, text selection, card and section-boundary screenshots were reviewed. Final exercised browser logs contain no errors/warnings. Native reduced-motion media emulation and hidden-tab transitions remain unavailable through this browser; their model/scheduler behavior is tested and event wiring reviewed.

## Organic orbits and neighbour cascades

- The existing 14 tests passed before this revision. Two new behavioral cases initially failed on the old engine: the selected nearby shape swept only 0.150 radians, and geometry beyond the primary wave had zero response through neighbours. Both now pass; the isolated-gap control remains unaffected.
- Eighteen model tests pass, including direct-on-shape seeding, bounded fanout/depth, desktop/mobile limits, expiry, reduced-motion clearing, primary-wave strength and prior input/scheduler/geometry controls.
- The field now rotates displacement targets with depth-dependent speeds and a slow breathing term. Relay influence propagates through visible shapes, with decaying power, per-cascade visited keys, two child links per source, two additional hops, nine/five nodes, 12/6 active relays and a 3.2-second hard lifetime. Each relay lasts 0.72 seconds. Echo forces yield smoothly while the stronger primary wave is passing.
- The renderer reuses 12 SVG relay groups for low-alpha connector traces and local rings in the existing response layer. Existing opacity, displacement, trail and population budgets remain in place. No new package, rectangular mask, per-frame layout read or React render is introduced.
- Focused browser checks pass at 375, 1440 and 3840px in both themes: correct actual viewport, no overflow, one SVG, 12 reusable relay slots and `pointer-events: none`. A real click produced a visible SVG relay and connector; transient relays subsequently returned to zero. Theme controls did not add click signals, pause cleared relays, resume worked, and the exercised console log was empty. Light/dark card screenshots remain readable. Final formatting, typecheck, production build and export checks passed (10 HTML pages, 3,588 internal links/assets).

## Header animation preference (initial behavior)

- The old floating pause control is replaced by a 44×44px mouse button beside the theme picker. Its Turkish title/accessible label and pressed state reflect the action; off has a muted, slashed icon. The switch controls only the shared SVG background and its mouse/tap effects.
- Off unmounts the scene, clears waves/trails/relays, cancels animation and pending layout frames, disconnects both observers and removes the scene's global input/geometry/visibility listeners. Disposal guards prevent queued observer callbacks from restarting work. On creates a fresh runtime. Preference storage/media-query watchers remain independent so system and cross-tab changes can still update the control.
- Five new native Node tests cover first-use reduced-motion defaults, explicit saved overrides, persistence across store instances, shared subscription cleanup, cross-tab updates/clear, and blocked storage. Together with the unchanged ambient tests: 23 passed, zero failures/skips.
- Browser checks passed at 320, 375, 768, 1440 and 3840px in both themes: actual requested viewport, no horizontal overflow or brand/actions overlap, and a 44×44px target. Off removes the SVG, remains off after reload and a real mobile documentation navigation; Space/Enter toggle it with focus retained. Restart produces one running SVG with zero active waves. Theme selection and mobile menu work while off. Exercised browser warning/error log was empty.
- First-use OS preference changes and inaccessible storage are tested through the injected preference host. Native OS media emulation remains unavailable in the browser controls; that event wiring is source-reviewed rather than claimed as a live browser pass.
- Production export check passes: 10 HTML pages and 308 internal links/assets. The SVG now mounts only after resolving the client preference, so exported HTML contains no transient background symbols; static content/SEO remain exported.

## Independent quiet motion and mouse effects

This revision supersedes the initial mouse toggle's full-scene removal described above.

- The mouse toggle now disables only pointer/click reactions and disconnects their listeners. It immediately clears waves, relays, trails, halos and reaction offsets while preserving the same scene, object pool, clock, slow drift and parallax. The quiet field runs at its lower idle frame rate. Other logo and interface animations remain independent.
- Labels now say “Disable mouse effects” / “Enable mouse effects”, inheriting the site’s English language. Existing saved choices remain valid. When the switch is off, the separately observed system reduced-motion preference freezes the quiet field and stops its RAF. Explicit mouse-on still overrides the system default as before. Hidden/invisible lifecycle handling and disposal guards remain intact.
- All 26 native tests passed, including three new cases: quiet objects continue moving while disabled inputs are ignored and effects cleared; mouse effects can restart without losing the scene clock; reduced motion freezes the quiet field independently; and system motion changes remain observable with a saved mouse-off preference (the first case includes restart coverage).
- Production browser observations: switching off cleared waves to zero while the scene stayed running; eight sampled object transforms changed between observations; a new real click did not increase the interaction count. Reload restored mouse-off with a running quiet scene. At 375px in dark mode, Space re-enabled input, turning it off again kept scrolling functional, and the warning/error log was empty. Light desktop behavior was also exercised. Native OS media emulation remains unavailable; system-default and reduced-motion behavior are unit-tested and event wiring is source-reviewed.

## MammothEngine OXOG footer alignment

19 October 2026. This replaces the earlier NineDeploy-inspired studio area.

- The live MammothEngine HTML, CSS and rendered OXOG card were inspected. The replacement keeps the reference's exact text and one full-card link to `https://oxog.net`, four SVG paths, stroke widths/colors, seven-pixel radius, spacing, arrow and responsive rules. Additional studio copy, wordmark and four project tiles are removed. Site sections and the existing product/legal footer remain outside this change.
- Space Grotesk Variable 5.3.0 is self-hosted for the studio heading only; its OFL license is included. The reference's warm light/dark colors are scoped to the card.
- At an actual 1440px viewport, the card width/height match the reference (1295.39×160.67px), as do the heading's family, weight, 35px size, 39.2px line height, -1.575px letter spacing and 349.67px text width. Logo dimensions match at 105×68.25px. SVG animation duration, easing, infinite iteration and delays match: 6s ease-in-out with 0/.15/.3/.45s stagger; draw offset 400 to zero by 33%.
- Local production checks at 320, 375, 768, 1440 and 3840px in both themes passed: no document overflow, four SVG paths, one studio link and no project tiles. Card heights are 234.19 / 206.19 / 194.34 / 160.67 / 160.67px at those widths. Mobile/light and desktop/dark screenshots were reviewed. Exercised browser error/warning log was empty.
- The logo runs while visible even with mouse effects off. Scrolling it out of view changes its state to paused, and sampled path offsets remain frozen; returning resumes drawing. OS reduced-motion and document-hidden event wiring is source-reviewed; native emulation remains unavailable through this browser.

## Publication boundary

The implementation build and GitHub Pages deployment passed in [run 39125180092](https://github.com/uMailServer/umailserver-site/actions/runs/39125180092), for application revision `453320a`. The custom domain is set to `umailserver.com`.

During initial setup, Pages reported `NotServedByPagesError`. A later external DNS update resolved that boundary: `https://umailserver.com/` now responds HTTP 200 with valid HTTPS. This task did not change DNS or the domain's existing email records.

DNS provider access is still outside this task. README retains the standard DNS instructions for future hosting changes; the earlier missing-DNS step no longer blocks the live website.

## Design critique and responsive accessibility pass

20 October 2026. Scope: home, documentation overview, getting started, architecture, deployment, security, brand assets and the real 404 route. Existing palette, SVG identities, diagrams, OXOG card and independent quiet/mouse animation behavior are retained.

- Before fixes, the 320px hero headline/secondary CTA extended beyond the content viewport, the mobile trigger did not close on Escape, controls included targets below 24px, and code line numbers measured 3.59:1 in light / 4.38:1 in dark. A long inline configuration path also overflowed the 320px getting-started page. These reproductions now pass with grid shrinkability, wrapping, 44px header/copy targets, brighter line numbers and inline-code wrapping.
- Space Grotesk is now the shared interface font and JetBrains Mono the technical font, self-hosted with `next/font/local`, variable weights, swap loading and adjusted fallbacks. All Turkish letters were checked in each WOFF2 cmap. Browser font status is loaded and both families resolve. Three obsolete Fontsource dependencies were removed; no UI library was added.
- Body copy, documentation, code, CTA links and footer navigation have readable shared sizes. The mobile menu focuses its first link, closes on Escape/outside focus/pointer, closes on navigation or desktop resize, and restores trigger focus on Escape. Skip navigation focuses main; long code is keyboard focusable and a real ArrowRight scrolled the overflowed block by 40px. Footer and architecture headings no longer skip levels. The export checker now protects main/skip semantics, heading order and keyboard access to code.
- Final production-browser matrix: 8 routes × 9 widths (320, 375, 390, 768, 1024, 1280, 1440, 1920, 2560) × light/dark = 144 cases. No document overflow, clipped headings/controls, unnamed buttons or sampled undersized controls remained. The read-only DOM contrast probe found no failures among eligible solid-background leaf text; translucent/gradient/decorative text is not a complete contrast certification.
- Additional checks: home at 539/540/541, 679/680/681, 819/820/821, 1099/1100/1101 and 1599/1600/1601px; deployment/theme panel at 600×320 and 844×390. Screenshots reviewed home/mobile, each guide, brand, 404 and the OXOG footer. Theme radio arrow keys/Escape/reload persistence, menu focus/Escape/route/resize, skip link, installation tab arrows and FAQ keyboard activation were exercised. Copy showed success, but this browser's clipboard read returned empty, so clipboard payload is not claimed as verified.
- Mouse-off preserved the running quiet field, cleared waves and retained `pointer-events: none`; the visible OXOG logo continued drawing. Existing reduced-motion/input/lifecycle tests remain relevant. Exercised browser warning/error log was empty.
- Limits: native 200% browser zoom, physical touch/virtual keyboard, screen-reader announcements, OS reduced-motion/hidden-tab emulation and lab CLS/Core Web Vitals measurement were unavailable or not run. 320px reflow was tested directly. This is a scoped design/accessibility check, not a claim of complete WCAG compliance or zero defects.

- Final project checks passed: clean npm ci (29 packages; audit reported zero vulnerabilities), formatting, TypeScript, 26 native tests with zero skips/failures, production build and export validation (10 HTML files, 315 internal links/assets).
