import type { Metadata } from 'next';
import Link from 'next/link';
import { DocsShell, Callout } from '@/components/docs';
import { Icon } from '@/components/icons';
import { productStatus } from '@/lib/product';
export const metadata: Metadata = {
  title: 'Documentation',
  description:
    'Build, understand and operate uMailServer. A source-grounded guide to setup, architecture, deployment and security.',
  alternates: { canonical: '/docs/' },
};
export default function Docs() {
  return (
    <DocsShell
      title="Know your mail server."
      intro="A field guide to the engine, the setup and the decisions that make it yours. Start small. Understand every layer."
      path="/docs/"
    >
      <Callout title="An open project, still taking shape">
        uMailServer is currently {productStatus}. New work is documented as Unreleased, with no
        published GitHub release binaries. Read the <Link href="/docs/changelog/">changelog</Link>,
        scope and deployment notes before running a server that handles important email.
      </Callout>
      <div className="doc-cards">
        {[
          [
            'terminal',
            'Getting started',
            'Build the binary, create your first domain and prepare the configuration.',
            'getting-started',
          ],
          [
            'layers',
            'Architecture',
            'Follow messages through the protocols, pipeline, delivery queue and local storage.',
            'architecture',
          ],
          [
            'server',
            'Deployment',
            'Plan DNS, ports, persistent data, web HTTPS and operational workflows.',
            'deployment',
          ],
          [
            'shield',
            'Security & scope',
            'Understand TLS, authentication, filtering and the current implementation boundaries.',
            'security',
          ],
          [
            'book',
            'Changelog',
            'Recent mail, API, security and operator changes, with the source snapshot clearly identified.',
            'changelog',
          ],
        ].map(([icon, title, body, slug]) => (
          <Link className="doc-card" key={slug} href={`/docs/${slug}/`}>
            <Icon name={icon} size={25} />
            <h2>{title}</h2>
            <p>{body}</p>
            <span>
              Open the guide
              <Icon name="arrow" size={15} />
            </span>
          </Link>
        ))}
      </div>
      <section>
        <h2>One executable. Several responsibilities.</h2>
        <p>
          The Go binary embeds webmail, administration and account interfaces. It handles mail
          protocols, filtering, delivery and local data storage. Operating a public mail server
          still means managing DNS, network access, HTTPS, backups and monitoring.
        </p>
        <p>
          These guides separate the current implementation from older promotional material. The
          authoritative license is AGPL-3.0-or-later, and the web listeners currently require an
          HTTPS reverse proxy.
        </p>
      </section>
    </DocsShell>
  );
}
