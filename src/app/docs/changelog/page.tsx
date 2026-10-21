import type { Metadata } from 'next';
import Link from 'next/link';
import { DocsShell, Callout, SourceLink } from '@/components/docs';
import { productStatus, productRevision, productCheckedOn } from '@/lib/product';

export const metadata: Metadata = {
  title: 'Changelog',
  description:
    'Recent uMailServer mail, API, security and deployment changes, distinguished from published releases.',
  alternates: { canonical: '/docs/changelog/' },
};

export default function Changelog() {
  return (
    <DocsShell
      title="What’s changed. What to check."
      intro="A source-grounded summary of recent changes and what they mean for operators and integrations."
      path="/docs/changelog/"
    >
      <Callout title="Unreleased · latest source changes">
        Checked {productCheckedOn} at {productRevision.slice(0, 7)}. The upstream README still
        labels the project {productStatus}; GitHub has no published releases or tags. These changes
        are not a new numbered release or a downloadable release binary.
      </Callout>
      <section>
        <h2>Configuration and upgrades</h2>
        <p>
          Explicit config paths must exist, and relative paths resolve against the config’s
          directory. Run <code>config check</code> to reject unknown YAML keys. Normal loading only
          warns about them. Newer database schemas are refused by older binaries; SIGHUP reloads
          manual TLS certificates, while other configuration changes need a restart.
        </p>
        <p>
          <Link href="/docs/getting-started/">
            Review the pinned build and validation commands →
          </Link>
        </p>
      </section>
      <section>
        <h2>Mail delivery and client protocols</h2>
        <p>
          Recent work covers SMTP connection limits and graceful DATA draining, cached parallel RBL
          lookups, IMAP session/IDLE handling, POP3 maildrop locking and Sieve delivery. Outbound
          MTA-STS enforce policies prohibit plaintext fallback. Stock DANE remains advisory;
          IMAP4rev2, CONDSTORE and QRESYNC are not advertised.
        </p>
      </section>
      <section>
        <h2>API and integrations</h2>
        <p>
          Dedicated mail endpoints handle message reading, flags, drafts and moves. Lists support
          pagination, flagged/unread filters and qualified message IDs. Admin clients should handle
          last-admin conflicts (409), throttling (429 with Retry-After) and quota failures (507).
          Queue retries use POST on the queue item, not an invented retry subroute. Webhooks persist
          registrations, sign deliveries and retry with backoff.
        </p>
        <p>
          <SourceLink file="docs/api-reference.md">Read the current API reference →</SourceLink>
        </p>
      </section>
      <section>
        <h2>Account security and operations</h2>
        <p>
          Login lockouts, TOTP attempt limits, session revocation and expiring API tokens harden
          account access. Forwarded audit IPs require a trusted proxy. MCP refuses non-loopback
          binding without an explicit auth token. CLI backups require a stopped server, and restore
          output is staged in restore_temp/ for inspection.
        </p>
        <p>
          <Link href="/docs/deployment/">Check deployment boundaries →</Link>
        </p>
      </section>
      <section>
        <h2>Observability and documented scope</h2>
        <p>
          Optional OpenTelemetry tracing and authentication-cache metrics accompany the existing
          Prometheus endpoint. Metrics and /healthz use the metrics listener; /health and
          /health/ready use the web listener. Web/API/admin listeners still need an HTTPS proxy. MCP
          queue tools, Contacts and some settings/profile screens remain incomplete.
        </p>
        <p>
          This summary combines the upstream Unreleased notes, including audit rounds 141–220, with
          the current implementation. Where older prose differs, the linked source snapshot
          controls. See the <SourceLink file="CHANGELOG.md">full upstream changelog</SourceLink> and{' '}
          <Link href="/docs/security/">current limitations</Link>.
        </p>
      </section>
    </DocsShell>
  );
}
