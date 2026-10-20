import type { Metadata } from 'next';
import { DocsShell, Callout, SourceLink } from '@/components/docs';
import { Pipeline } from '@/components/mail-diagram';
export const metadata: Metadata = {
  title: 'Architecture',
  description:
    'How the Go runtime connects mail protocols, spam checks, outbound delivery, Maildir storage and web interfaces.',
  alternates: { canonical: '/docs/architecture/' },
};
export default function Architecture() {
  return (
    <DocsShell
      title="Follow the message."
      intro="A connected mail stack inside one Go executable. Protocol servers, message processing and local storage share the same runtime."
      path="/docs/architecture/"
    >
      <Pipeline headingLevel={2} />
      <section>
        <h2>Incoming mail</h2>
        <p>
          SMTP receives mail for your configured domains. The message-processing path applies
          enabled authentication and spam checks, including SPF, DKIM, DMARC, ARC, RBL, greylisting
          and Bayesian filtering. Sieve rules can apply server-side filtering.
        </p>
        <p>
          Local messages are written to Maildir++ storage. IMAP and the webmail/API interfaces
          provide access to that mailbox. Optional POP3 support exists and is disabled by default.
        </p>
      </section>
      <section>
        <h2>Outgoing delivery</h2>
        <p>
          Clients submit mail using authenticated SMTP submission, ordinarily STARTTLS on port 587
          or implicit TLS on 465. Outgoing messages enter a delivery queue with retry logic and
          exponential backoff.
        </p>
        <p>
          Queue status and delivery actions are available through the admin REST API.
          Direct-database CLI commands require the server to be stopped; they cannot share the
          running server’s bbolt lock.
        </p>
      </section>
      <section>
        <h2>Local data, deliberately simple</h2>
        <p>
          Maildir++ holds messages; bbolt databases hold account and mail metadata. A local search
          index supports full-text search. Deploy with persistent disks and use a tested backup
          process.
        </p>
        <Callout title="A single-node architecture">
          Do not run several instances against the same data directory or assume shared-data
          replicas are supported. The current storage model is local to one server.
        </Callout>
      </section>
      <section>
        <h2>Three interfaces. One server.</h2>
        <ul>
          <li>
            <strong>Webmail:</strong> folders, message reading, flags, compose, drafts, trash and
            search.
          </li>
          <li>
            <strong>Admin:</strong> domain, account and alias workflows, with delivery queue
            controls.
          </li>
          <li>
            <strong>Account portal:</strong> individual account access and available preferences.
          </li>
        </ul>
        <p>
          The React interfaces are embedded through Go’s filesystem embedding. Realtime interface
          events use Server-Sent Events (SSE), despite older material referring to WebSocket
          updates. Contacts and some settings/profile interfaces remain incomplete in the current
          beta.
        </p>
      </section>
      <section>
        <h2>Your tools can join in</h2>
        <p>
          A REST API handles integration workflows. Webhooks send event notifications; Prometheus
          metrics and optional OpenTelemetry support observability. The MCP server provides domain
          and account tools for compatible assistants.
        </p>
        <p>
          MCP queue operations are currently placeholders. Use the implemented admin REST API for
          live queue inspection and retry workflows.
        </p>
        <p>
          Read the <SourceLink file="docs/ARCHITECTURE.md">upstream architecture</SourceLink>,{' '}
          <SourceLink file="internal/server/server_api.go">HTTP server implementation</SourceLink>{' '}
          and <SourceLink file="internal/mcp/server.go">MCP implementation</SourceLink> for the full
          source context.
        </p>
      </section>
    </DocsShell>
  );
}
