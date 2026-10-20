import Link from 'next/link';
import type { Metadata } from 'next';
import { Icon, StepLabel } from '@/components/icons';
import { MailDiagram, Pipeline } from '@/components/mail-diagram';
import { CopyButton, InstallTabs } from '@/components/interactive';
export const metadata: Metadata = { alternates: { canonical: '/' } };
const repo = 'https://github.com/uMailServer/uMailServer';
const features = [
  [
    'globe',
    'The protocols you know.',
    'SMTP, IMAP and optional POP3. Connect your existing clients, without changing how your team works.',
    '25 / 587 / 465 · 143 / 993 · 995',
  ],
  [
    'shield',
    'A thoughtful first line.',
    'SPF, DKIM, DMARC and ARC, alongside Bayesian filtering, greylisting and RBL checks.',
    'LAYERED SPAM PROTECTION',
  ],
  [
    'code',
    'Built to work with you.',
    'A REST API, webhooks and an MCP server for domain and account workflows. Make mail part of your tooling.',
    'REST · WEBHOOKS · MCP',
  ],
];
const faqs = [
  [
    'Is uMailServer ready for my production server?',
    'The project is currently v0.1.0 beta. Evaluate it in a controlled environment, review the documented limitations and test backup and delivery workflows before relying on it for important mail.',
  ],
  [
    'Can I use my existing email client?',
    'Yes. The server implements SMTP submission and IMAP with TLS, plus optional POP3. Use the protocol and port settings from your server configuration.',
  ],
  [
    'Do I still need to configure DNS?',
    'Yes. A mail domain needs A and MX records, SPF, DKIM and DMARC. You also need a matching PTR record from your hosting provider and a provider that permits SMTP traffic on port 25.',
  ],
  [
    'Does the web interface include HTTPS?',
    'The current web and admin listeners speak HTTP. Put public web traffic behind a TLS-terminating reverse proxy. TLS for SMTP and IMAP is configured separately. The deployment guide explains the boundary.',
  ],
  [
    'Where is my email stored?',
    'Messages use local Maildir++ storage; bbolt stores metadata. This is a single-node system. Plan persistent storage and backups, and stop the server before using the direct-database CLI backup command.',
  ],
  [
    'What is the license?',
    'The current root LICENSE specifies AGPL-3.0-or-later. Some older documentation and promotional assets still say MIT; the repository LICENSE is the authoritative source.',
  ],
];

export default function Home() {
  return (
    <main tabIndex={-1} id="main">
      <section className="hero-scene">
        <div className="hero container">
          <div className="hero-copy">
            <a className="release-pill" href={`${repo}#readme`}>
              <span className="status-dot" />
              <span>v0.1.0 beta</span>
              <span className="pill-divider" />A fresh take on self-hosted mail
              <Icon name="arrow" size={14} />
            </a>
            <h1>
              One binary.
              <br />
              <span>Complete email.</span>
            </h1>
            <p className="hero-lead">
              Your mail.
              <br />
              Your infrastructure.
            </p>
            <p className="hero-description">
              Stop stitching services together. SMTP, IMAP, webmail and spam protection — one
              cohesive mail server, written in Go.
            </p>
            <div className="hero-buttons">
              <Link href="/docs/getting-started/" className="button primary">
                Start building <Icon name="arrow" size={18} />
              </Link>
              <a href={repo} className="button secondary">
                <Icon name="github" size={18} />
                Explore the source
                <Icon name="external" size={15} />
              </a>
            </div>
            <div className="hero-command">
              <span className="terminal-prompt">❯</span>
              <code>umailserver serve</code>
              <CopyButton text="umailserver serve" />
            </div>
            <div className="hero-checks">
              <span>
                <Icon name="check" size={13} />
                Open source · AGPL-3.0
              </span>
              <span>
                <Icon name="check" size={13} />
                Pure Go
              </span>
              <span>
                <Icon name="check" size={13} />
                Self-hosted
              </span>
            </div>
          </div>
          <MailDiagram />
        </div>
      </section>
      <div className="stack-strip">
        <div className="container">
          <span className="stack-intro">
            LESS TO OPERATE.
            <br />
            <b>MORE TO BUILD ON.</b>
          </span>
          {[
            ['server', 'Single executable'],
            ['mail', 'Complete mail stack'],
            ['lock', 'Mail TLS built in'],
            ['code', 'API & MCP'],
            ['box', 'Docker compatible'],
          ].map(([icon, text]) => (
            <span key={text}>
              <Icon name={icon} size={19} />
              {text}
            </span>
          ))}
        </div>
      </div>
      <section id="features" className="section container">
        <div className="section-heading reveal">
          <div>
            <StepLabel n="01">A SMALLER STACK. A BIGGER PICTURE.</StepLabel>
            <h2>
              Everything mail needs.
              <br />
              <span>Room for what’s next.</span>
            </h2>
          </div>
          <p>
            Good infrastructure gets out of the way.
            <br />
            One engine brings the pieces together,
            <br className="desktop-break" /> so you can focus on what you’re building.
          </p>
        </div>
        <div className="feature-grid">
          <article className="feature-large reveal">
            <div className="card-top">
              <span className="mini-label">ONE COHESIVE ENGINE</span>
              <Icon name="layers" />
            </div>
            <h3>
              Less assembly.
              <br />
              More possibility.
            </h3>
            <p>
              Your protocols, delivery queue, local storage and web interfaces share a single Go
              runtime. Fewer moving parts to keep in sync.
            </p>
            <div className="engine-graphic">
              <div className="engine-orbit">
                <span>SMTP</span>
                <span>IMAP</span>
                <span>WEBMAIL</span>
                <span>REST API</span>
              </div>
              <div className="engine-core">
                <Icon name="server" size={34} />
                <strong>uMailServer</strong>
                <small>ONE GO EXECUTABLE</small>
              </div>
              <div className="engine-base">
                <i /> Maildir++ <span>+</span> bbolt
              </div>
            </div>
            <Link className="text-link" href="/docs/architecture/">
              Explore the architecture <Icon name="arrow" size={17} />
            </Link>
          </article>
          <div className="feature-side">
            {features.map(([icon, title, body, tag]) => (
              <article className="feature-card reveal" key={title}>
                <div className="feature-icon">
                  <Icon name={icon} size={23} />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <span className="mini-label">{tag}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="architecture" className="architecture-section section">
        <div className="container">
          <div className="section-heading reveal">
            <div>
              <StepLabel n="02">FOLLOW THE MESSAGE</StepLabel>
              <h2>
                A clear path.
                <br />
                <span>From hello to inbox.</span>
              </h2>
            </div>
            <div>
              <p>
                Receive, check, route, store. A connected pipeline
                <br className="desktop-break" /> turns incoming messages into accessible mail.
              </p>
              <Link className="text-link" href="/docs/architecture/">
                Look under the hood <Icon name="arrow" size={17} />
              </Link>
            </div>
          </div>
          <Pipeline />
          <div className="architecture-notes">
            <span>
              <i /> Incoming mail follows the local delivery path shown above.
            </span>
            <span>Outbound mail uses the delivery queue with retries and backoff.</span>
          </div>
        </div>
      </section>
      <section className="section container interface-section">
        <div className="interface-copy reveal">
          <StepLabel n="03">A HUMAN SIDE TO INFRASTRUCTURE</StepLabel>
          <h2>
            Behind every email.
            <br />
            <span>You’re in control.</span>
          </h2>
          <p>
            Read your mail, manage your domains and connect your tools. Three embedded interfaces
            bring your server closer.
          </p>
          <ul className="interface-list">
            <li>
              <Icon name="mail" />
              <div>
                <h3>A place for your mail</h3>
                <p>Folders, search, drafts and compose in the React webmail interface.</p>
              </div>
            </li>
            <li>
              <Icon name="globe" />
              <div>
                <h3>Your domains. Your accounts.</h3>
                <p>
                  Manage accounts and aliases, inspect queues and retry delivery through the admin
                  API.
                </p>
              </div>
            </li>
            <li>
              <Icon name="activity" />
              <div>
                <h3>A view into the engine</h3>
                <p>
                  Prometheus metrics, structured logs and event webhooks for the tools you already
                  use.
                </p>
              </div>
            </li>
          </ul>
          <Link className="text-link" href="/docs/">
            Get to know your server
            <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="control-illustration reveal">
          <div className="illustration-caption">
            <span>YOUR SERVER, CONNECTED</span>
            <span>CONCEPTUAL VIEW</span>
          </div>
          <div className="control-window">
            <div className="window-title">
              <span>
                <i />
                <i />
                <i />
              </span>
              <span>mail.your-domain.com</span>
              <Icon name="lock" size={12} />
            </div>
            <div className="control-body">
              <div className="control-sidebar">
                <Icon name="mail" size={24} />
                <span className="selected">
                  <Icon name="globe" size={17} />
                </span>
                <Icon name="server" size={17} />
                <Icon name="activity" size={17} />
              </div>
              <div className="control-content">
                <span className="mini-label">A HOME FOR YOUR DOMAINS</span>
                <h3>
                  Your mail.
                  <br />
                  Under your roof.
                </h3>
                <div className="domain-row">
                  <div className="domain-icon">
                    <Icon name="globe" />
                  </div>
                  <div>
                    <strong>your-domain.com</strong>
                    <small>Your self-hosted mail domain</small>
                  </div>
                  <span className="domain-check">
                    <Icon name="check" size={15} />
                  </span>
                </div>
                <div className="control-chips">
                  <span>Accounts</span>
                  <span>Aliases</span>
                  <span>Delivery queue</span>
                </div>
                <div className="control-line" />
                <div className="control-line short" />
              </div>
            </div>
          </div>
          <div className="integration-card">
            <span className="integration-icon">
              <Icon name="code" size={22} />
            </span>
            <div>
              <strong>Plays well with your workflow.</strong>
              <p>REST API · MCP · Webhooks</p>
            </div>
            <Icon name="external" size={18} />
          </div>
          <p className="illustration-note">
            An illustration of the management model, not a product screenshot.
          </p>
        </div>
      </section>
      <section id="get-started" className="start-section section">
        <div className="container">
          <div className="section-heading reveal">
            <div>
              <StepLabel n="04">MAKE IT YOURS</StepLabel>
              <h2>
                Your next mail server.
                <br />
                <span>A few commands away.</span>
              </h2>
            </div>
            <p>
              Start with the source. Build the complete binary.
              <br className="desktop-break" /> Keep every piece of your infrastructure in view.
            </p>
          </div>
          <InstallTabs />
          <div className="setup-bottom">
            <span>
              <Icon name="globe" size={18} /> Bring a domain, public IP and DNS access. Check port
              25 with your provider.
            </span>
            <Link className="text-link" href="/docs/getting-started/">
              Walk through setup <Icon name="arrow" size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section container use-cases">
        <StepLabel n="05">BUILT FOR YOUR CORNER OF THE INTERNET</StepLabel>
        <div className="use-case-grid">
          {[
            [
              '01',
              'A domain of your own.',
              'For developers and self-hosters who want to understand and operate their own email infrastructure.',
              'globe',
            ],
            [
              '02',
              'A home for your team.',
              'Explore shared domain administration, individual accounts and aliases in a single-node deployment.',
              'mail',
            ],
            [
              '03',
              'Mail that fits your tools.',
              'Connect domain workflows to a REST API, receive event webhooks and inspect server metrics.',
              'terminal',
            ],
          ].map(([n, title, body, icon]) => (
            <article key={n} className="reveal">
              <div>
                <span>{n} /</span>
                <Icon name={icon} size={24} />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section container faq-section">
        <div>
          <StepLabel n="06">BEFORE YOU DIVE IN</StepLabel>
          <h2>
            Good questions.
            <br />
            <span>Straight answers.</span>
          </h2>
          <p>
            Know what you’re running.
            <br />
            And what comes with it.
          </p>
          <a className="text-link" href={`${repo}/issues`}>
            Keep the conversation going
            <Icon name="external" size={16} />
          </a>
        </div>
        <div className="faq-list">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="container final-cta">
        <div>
          <span className="eyebrow">YOUR MAIL HAS A NEW HOME.</span>
          <h2>
            Less stack.
            <br />
            <span>More ownership.</span>
          </h2>
          <p>Meet your infrastructure. Then make it yours.</p>
        </div>
        <div>
          <Link href="/docs/getting-started/" className="button primary">
            Build your mail server
            <Icon name="arrow" size={19} />
          </Link>
          <a href={repo}>
            Built in Go. Open to everyone.
            <Icon name="github" size={17} />
          </a>
        </div>
        <svg
          className="cta-envelope"
          viewBox="0 0 300 200"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="30" y="20" width="230" height="150" rx="12" />
          <path d="m30 25 115 88L260 25M30 170l85-81m145 81-85-81" />
        </svg>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'uMailServer',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Linux, macOS, Windows',
            url: 'https://umailserver.com',
            codeRepository: repo,
            license: `${repo}/blob/main/LICENSE`,
            description:
              'A self-hosted mail server written in Go with SMTP, IMAP and embedded web interfaces.',
          }),
        }}
      />
    </main>
  );
}
