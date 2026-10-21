import type { Metadata } from 'next';
import Link from 'next/link';
import { DocsShell, Callout, CodeBlock, SourceLink } from '@/components/docs';
import { sourceCheckout } from '@/lib/product';
export const metadata: Metadata = {
  title: 'Getting started',
  description:
    'Build uMailServer from source and prepare your first domain, administrator and configuration.',
  alternates: { canonical: '/docs/getting-started/' },
};
export default function GettingStarted() {
  return (
    <DocsShell
      title="Start with your own server."
      intro="Build the complete executable, give it a domain and get to know your configuration. The source-first path keeps every step in view."
      path="/docs/getting-started/"
    >
      <Callout title="Build from source for now">
        No tagged release or published release binary was available when this guide was verified.
        The upstream installer scripts depend on a release, so use the source build below.
      </Callout>
      <section>
        <h2>01 / Bring the essentials</h2>
        <ul>
          <li>Go 1.25 or newer, Node.js 20 or newer, npm, Git and make.</li>
          <li>
            A machine running Linux, macOS or Windows. The commands below use a Linux/macOS shell;
            Windows users can follow them in WSL with a Linux toolchain.
          </li>
          <li>
            A domain you control and, for public delivery, a public IP and a hosting provider that
            allows inbound and outbound SMTP on port 25.
          </li>
        </ul>
        <p>
          The build toolchain is needed to produce the executable. The resulting binary embeds the
          three web interfaces.
        </p>
      </section>
      <section>
        <h2>02 / Build the engine</h2>
        <CodeBlock code={`${sourceCheckout}\nmake build`} />
        <p>
          The <SourceLink file="Makefile">upstream Makefile</SourceLink> builds webmail, admin and
          account frontends, then compiles the Go binary. Review the upstream build instructions if
          your platform needs a different shell or toolchain.
        </p>
        <p>
          These commands pin the source snapshot used by this guide. Review the{' '}
          <Link href="/docs/changelog/">latest changes</Link> before selecting a different revision.
        </p>
      </section>
      <section>
        <h2>03 / Create your first domain</h2>
        <CodeBlock code={'sudo ./umailserver quickstart admin@example.com'} />
        <p>
          Replace the address with your administrator address. Quickstart creates the configuration,
          first administrator, domain and DKIM keypair, then prints the DNS records to publish.
        </p>
        <p>
          On Linux/macOS, default configuration is written to{' '}
          <code>/etc/umailserver/umailserver.yaml</code> and mail data lives in{' '}
          <code>/var/lib/umailserver</code>. Check the paths and permissions before continuing.
        </p>
      </section>
      <section>
        <h2>04 / Review, validate, run</h2>
        <CodeBlock
          code={
            'sudo ./umailserver config check \\\n  --config /etc/umailserver/umailserver.yaml\n\nsudo ./umailserver serve \\\n  --config /etc/umailserver/umailserver.yaml'
          }
        />
        <p>
          Open and review the generated YAML before starting. Set a valid mail hostname, check bind
          addresses and port access, configure mail TLS and put the public web interface behind an
          HTTPS reverse proxy.
        </p>
        <p>
          An explicitly supplied config path must exist. Relative data, certificate and database
          paths resolve from the config file’s directory. Unknown YAML keys are logged and ignored
          during normal loading, but <code>config check</code> rejects them; run it before
          deployment.
        </p>
        <Callout title="The web port is not HTTPS on its own">
          The current HTTP server uses a plain HTTP listener, even when the configured port is 443.
          The loopback admin endpoint defaults to http://127.0.0.1:8443. Follow the deployment guide
          before exposing web traffic.
        </Callout>
      </section>
      <section>
        <h2>Prefer containers?</h2>
        <CodeBlock code={`${sourceCheckout}\ndocker build -t umailserver:local .`} />
        <p>
          The <SourceLink file="Dockerfile">Dockerfile</SourceLink> builds the embedded frontends
          and executable in a multi-stage image. Use the{' '}
          <SourceLink file="deploy/docker/production/docker-compose.yml">
            production Compose example
          </SourceLink>{' '}
          as a starting point, with your own configuration, persistent volumes, secrets and TLS
          proxy. A locally built image is not a complete deployment by itself.
        </p>
      </section>
      <section>
        <h2>Next: make the network ready</h2>
        <p>
          Set up your domain’s DNS, confirm your provider’s SMTP policy and separate public services
          from local management endpoints.
        </p>
        <Link className="button primary" href="/docs/deployment/">
          Plan your deployment →
        </Link>
      </section>
    </DocsShell>
  );
}
