# Research and content decisions

Checked on 18 October 2026 against product revision [`cc09145f03e150bb6218cf8c32abf3b4675176dd`](https://github.com/uMailServer/uMailServer/tree/cc09145f03e150bb6218cf8c32abf3b4675176dd).

## Primary product sources

| Source                                                       | Applied to the website                                                                 |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `README.md`, `Makefile`, `go.mod`, `cmd/umailserver/main.go` | Go server, beta status, build prerequisites, quickstart, validation and serve commands |
| Root `LICENSE`                                               | AGPL-3.0-or-later; stale MIT claims in artwork/README are excluded                     |
| `internal/config/defaults.go`, `umailserver.yaml.example`    | Actual protocol defaults, optional services, bind addresses                            |
| `internal/server/server_api.go`                              | Plain HTTP web listener, separate loopback admin listener; HTTPS proxy requirement     |
| `docs/ARCHITECTURE.md`                                       | Embedded React UIs, Maildir++, bbolt, delivery queue and single-node model             |
| `internal/mcp/server.go`                                     | MCP domain/account capabilities; queue placeholders are explicitly excluded            |
| `docs/SECURITY.md`, `docs/SECURITY_HARDENING.md`             | Implemented authentication/filtering and unsupported S/MIME/OpenPGP verification       |
| `docs/dns-setup.md`, `docs/DEPLOYMENT.md`, `docs/RUNBOOK.md` | Public SMTP, PTR, DNS, persistent data, documented machine-sizing guidance             |
| `Dockerfile`, `deploy/docker/production/docker-compose.yml`  | Local container build and TLS-proxy deployment reference                               |
| `docs/CONTRIBUTING.md`, `docs/api-reference.md`              | Contribution and integration destinations                                              |

The GitHub releases and tags lists were empty; `releases/latest` returned 404. Upstream installer scripts depend on a release and are not presented as a working install route. Product setup commands were read in source, not executed as a real mail deployment.

The site explicitly records current boundaries: optional POP3/JMAP/CalDAV/CardDAV, contacts stub, read-only settings/profile limitations, local data, stopped-server direct-database CLI maintenance, limited SIGHUP behavior and HTTP web listeners. It does not assert enterprise readiness, verified throughput, adoption, availability or delivery rates.

## Visual references

The provided logo and product infographic establish the turquoise envelope/lightning identity. No authoritative vector logo or product screenshot exists in the inspected product tree. Logo SVGs are faithful redraws; the admin illustration is labeled conceptual.

Fetched full HTML from CobaltDB, DockRouter, UWAS, NothingDNS, GuardianWAF and CacheStorm. Their shared practices informed the editorial hierarchy, open-source links, technical graphics and useful code samples. CobaltDB was also inspected in a browser: its theme picker provides Light/Dark/System, current-state feedback and keyboard focus. The site implements those behaviors in its own theme system.

The theme picker now follows CobaltDB's actual component markup and CSS: 328px panel, three miniature interface previews, native radio inputs, selected checkmark, status text, keyboard arrows, Escape focus return and dismissal when focus or pointer leaves the picker. The selection uses uMailServer's teal accent and persists across reloads and same-origin tabs.

Following the updated brief, NineDeploy's current footer supplied the Oxog card composition, original four-path SVG geometry, #ed0878 pink and theme-aware purple, project cards, and signature-drawing timing (1.6 seconds, .25/.5/.9-second path delays). The symbol is progressively enhanced with an entry animation; it stays complete with JavaScript disabled or reduced motion enabled. Its project links target the same OXOGNET ecosystem page as the reference. The copy names uMailServer and omits NineDeploy-specific operational claims.

`https://anubis.watch` could not be inspected because its certificate hostname did not match. No certificate warning was bypassed. `https://umailserver.com` had no working web response during initial research; domain DNS did have existing Spaceship mail-forwarding MX records, which were left untouched.

## Toolchain verification

Official npm registry stable dist-tags: Next 16.4.2, React/React DOM 19.3.1, TypeScript 7.0.2, npm 12.2.0. Types: React 19.3.0, React DOM 19.3.0, Node 26.6.5. Fontsource Manrope variable and IBM Plex Mono 5.3.0. Versions are exact and locked.

The official Node distribution index identified 26.12.0 as the latest stable runtime. The local temporary executable was fetched from nodejs.org and checked against its SHA256 manifest. npm 12 requires newer Node than the host's 24.13.0, so local final checks and CI use 26.12.0 with npm 12.2.0. Host-wide installations were not changed.

GitHub Actions latest releases were checked through GitHub API: checkout 7.0.1, setup-node 7.1.0, configure-pages 6.0.0, upload-pages-artifact 5.0.0, deploy-pages 5.0.1. Static-export architecture follows the [Next.js official guide](https://nextjs.org/docs/app/guides/static-exports).
