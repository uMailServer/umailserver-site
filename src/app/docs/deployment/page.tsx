import type { Metadata } from 'next';
import { DocsShell, Callout, CodeBlock, SourceLink } from '@/components/docs';
export const metadata: Metadata = {
  title: 'Deployment',
  description:
    'DNS, protocol ports, web HTTPS, persistent storage and operational requirements for a uMailServer deployment.',
  alternates: { canonical: '/docs/deployment/' },
};
const ports = [
  ['25', 'SMTP', 'Inbound mail; public'],
  ['587 / 465', 'SMTP submission', 'STARTTLS / implicit TLS; authenticated clients'],
  ['143 / 993', 'IMAP', 'STARTTLS / implicit TLS'],
  ['995', 'POP3', 'Implicit TLS; disabled by default'],
  ['4190', 'ManageSieve', 'Server-side filtering rules'],
  ['443 (default)', 'Web / REST', 'Plain HTTP listener; use an HTTPS proxy'],
  ['8443', 'Admin HTTP', 'Loopback by default'],
  ['8080', 'Metrics / health', 'Loopback by default'],
  ['3000', 'MCP', 'Loopback by default; protect tokens'],
];
export default function Deployment() {
  return (
    <DocsShell
      title="Make room for your mail."
      intro="The binary simplifies the application stack. Your domain, network, HTTPS boundary and data lifecycle still need a deliberate setup."
      path="/docs/deployment/"
    >
      <section>
        <h2>Give your domain a clear route</h2>
        <ul>
          <li>Create an A record for your mail hostname and an MX record that points to it.</li>
          <li>
            Publish the SPF, DKIM and DMARC records appropriate to your sending setup. Quickstart
            prints an initial DNS guide.
          </li>
          <li>Ask your IP provider to configure reverse DNS (PTR) to match your mail hostname.</li>
          <li>
            Confirm inbound and outbound port 25 is permitted. Network access and correct DNS do not
            guarantee deliverability.
          </li>
        </ul>
        <p>
          Follow the <SourceLink file="docs/dns-setup.md">official DNS setup guide</SourceLink>.
          Preserve existing mail records when changing unrelated website hosting records.
        </p>
      </section>
      <section>
        <h2>Know which doors are open</h2>
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Server ports and deployment notes"
        >
          <table>
            <thead>
              <tr>
                <th>Default port</th>
                <th>Service</th>
                <th>Deployment note</th>
              </tr>
            </thead>
            <tbody>
              {ports.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell) => (
                    <td key={cell}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          These are configuration defaults, not an instruction to expose every port. Enable only the
          services you use and review the{' '}
          <SourceLink file="internal/config/defaults.go">current defaults</SourceLink>.
        </p>
      </section>
      <section>
        <h2>Put HTTPS at the web edge</h2>
        <p>
          The current web and admin servers speak HTTP. Terminate HTTPS at a reverse proxy, then
          forward to a loopback listener. Mail protocol TLS is configured separately.
        </p>
        <CodeBlock
          label="umailserver.yaml · partial example"
          code={
            'server:\n  hostname: mail.example.com\n  data_dir: /var/lib/umailserver\n\nhttp:\n  enabled: true\n  bind: "127.0.0.1"\n  port: 8880\n  trusted_proxies: ["127.0.0.1"]\n\nadmin:\n  enabled: true\n  bind: "127.0.0.1"\n  port: 8443'
          }
        />
        <Callout title="This fragment is not a complete production configuration">
          Configure your reverse proxy, mail TLS certificates, domains, storage permissions and
          secrets separately. In a container network, loopback and proxy trust must be adapted to
          the actual network boundary.
        </Callout>
        <p>
          See the{' '}
          <SourceLink file="umailserver.yaml.example">complete configuration example</SourceLink>{' '}
          and{' '}
          <SourceLink file="deploy/docker/production/docker-compose.yml">
            production container stack
          </SourceLink>
          .
        </p>
      </section>
      <section>
        <h2>Plan the machine and the data</h2>
        <p>
          The deployment documentation suggests at least two CPU cores, 4 GB RAM and 20 GB SSD
          storage. Treat these as documented planning guidance, not a measured capacity guarantee.
          Size the disk for mail volume, retention, indexes and backups.
        </p>
        <ul>
          <li>Keep configuration, certificates and mail data on persistent storage.</li>
          <li>
            Run one instance per data directory; bbolt files are local, single-process stores.
          </li>
          <li>
            Stop the server before direct-database CLI backup or maintenance commands. Test restore
            procedures before relying on them.
          </li>
          <li>Use the REST API to administer a running server.</li>
        </ul>
      </section>
      <section>
        <h2>Observe, update, verify</h2>
        <p>
          Metrics default to <code>http://127.0.0.1:8080/metrics</code>; monitoring health is{' '}
          <code>/healthz</code>. The web listener also exposes <code>/health</code> and{' '}
          <code>/health/ready</code>. Keep internal observability endpoints protected.
        </p>
        <p>
          Back up data and configuration, build the intended source revision, stop the old process
          and replace the executable. Restart after configuration changes: SIGHUP only rechecks
          manually managed TLS certificates.
        </p>
        <p>
          Consult the <SourceLink file="docs/DEPLOYMENT.md">deployment guide</SourceLink> and{' '}
          <SourceLink file="docs/RUNBOOK.md">operational runbook</SourceLink> for further detail.
        </p>
      </section>
    </DocsShell>
  );
}
