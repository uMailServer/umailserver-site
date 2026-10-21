import type { Metadata } from 'next';
import { DocsShell, Callout, SourceLink } from '@/components/docs';
import { productStatus } from '@/lib/product';
export const metadata: Metadata = {
  title: 'Security & scope',
  description:
    'Understand uMailServer authentication, mail TLS, spam filtering, license and current beta limitations.',
  alternates: { canonical: '/docs/security/' },
};
export default function Security() {
  return (
    <DocsShell
      title="Understand the boundaries."
      intro="Useful security starts with knowing what the implementation does, what you configure and what is still taking shape."
      path="/docs/security/"
    >
      <Callout title={`Current status: ${productStatus}`}>
        Evaluate delivery, authentication, access controls and recovery in your own environment. A
        feature list is not a security certification or a guarantee of deliverability.
      </Callout>
      <section>
        <h2>Encrypted mail connections</h2>
        <p>
          SMTP and IMAP support STARTTLS and implicit TLS. The project includes ACME / Let’s Encrypt
          certificate provisioning and renewal for mail TLS. Supply valid hostnames, DNS and
          certificate challenge access as required by your configuration.
        </p>
        <p>
          Public webmail and REST traffic need a TLS-terminating HTTPS reverse proxy. The built-in
          web listener does not automatically become HTTPS when configured to use port 443.
        </p>
      </section>
      <section>
        <h2>Account access</h2>
        <p>
          The implementation includes bcrypt password hashing, JWT-based API authentication, TOTP
          two-factor support and optional LDAP / Active Directory integration. API password hashing
          can also be configured for Argon2id. Login lockouts cover SMTP, IMAP, POP3, ManageSieve,
          CalDAV/CardDAV and REST access; TOTP attempts are limited. Session revocation and expiring
          tokens protect API access.
        </p>
        <p>
          Keep admin access restricted, protect signing keys and integration tokens, and review each
          service’s bind address. MCP defaults to loopback; external binding requires an explicit
          token and privileged operations require an admin token.
        </p>
      </section>
      <section>
        <h2>Outbound transport policy</h2>
        <p>
          Outbound MTA-STS enforcement refuses plaintext fallback when a destination’s enforce
          policy requires TLS. DANE/TLSA remains advisory in the stock server: it has no
          validating-resolver hook, and unvalidated DNS records are not treated as authenticated
          transport policy.
        </p>
        <p>
          See the <SourceLink file="docs/SECURITY.md">upstream security policy</SourceLink> for the
          distinction between enforced MTA-STS and advisory DANE.
        </p>
      </section>
      <section>
        <h2>Several checks, one message path</h2>
        <p>
          SPF, DKIM, DMARC and ARC handle email authentication signals. RBL checks, Bayesian and
          heuristic filters, greylisting and configurable thresholds contribute to the spam
          decision. Their results depend on your configuration and environment.
        </p>
        <p>
          ClamAV is an optional external integration. Installing the core binary does not install or
          operate an antivirus daemon for you.
        </p>
      </section>
      <section>
        <h2>Know the current limits</h2>
        <ul>
          <li>
            The project is single-node; shared-data replication and high availability are not
            implemented.
          </li>
          <li>
            S/MIME and OpenPGP message verification are unsupported. DANE is advisory, not enforced.
          </li>
          <li>
            MCP queue tools are placeholders; use the admin REST API for implemented queue
            operations.
          </li>
          <li>
            Contacts UI is a stub; admin Settings and account Profile have read-only limitations.
          </li>
          <li>
            CalDAV, CardDAV, JMAP and POP3 are optional and disabled by default; review their
            current scope before enabling them.
          </li>
          <li>
            Configuration changes generally need a restart. SIGHUP only rechecks manual TLS
            certificates.
          </li>
        </ul>
        <p>
          See the <SourceLink file="docs/SECURITY.md">current security scope</SourceLink> and{' '}
          <SourceLink file="docs/SECURITY_HARDENING.md">hardening guide</SourceLink>. Report issues
          through the project’s published security process.
        </p>
      </section>
      <section>
        <h2>Open source, with a clear license</h2>
        <p>
          The repository’s root <SourceLink file="LICENSE">LICENSE</SourceLink> specifies
          AGPL-3.0-or-later. Older README text and promotional artwork referring to MIT are
          inconsistent with this file. Review the authoritative license when distributing or
          modifying the software.
        </p>
        <p>
          Contributions are welcome through the{' '}
          <SourceLink file="docs/CONTRIBUTING.md">official contribution guide</SourceLink>. Use
          reproducible issue reports and run the project’s applicable checks with your changes.
        </p>
      </section>
    </DocsShell>
  );
}
