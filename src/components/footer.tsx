import '@fontsource-variable/space-grotesk';
import Link from 'next/link';
import { Icon, Logo, OxogLogo } from './icons';
const repo = 'https://github.com/uMailServer/uMailServer';
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link href="/" aria-label="uMailServer home">
              <Logo />
            </Link>
            <p>
              One binary. Complete email.
              <br />
              Your infrastructure, on your terms.
            </p>
            <span className="footer-open">
              <i /> OPEN SOURCE · AGPL-3.0
            </span>
          </div>
          <div>
            <h3>Explore</h3>
            <Link href="/#features">Features</Link>
            <Link href="/docs/architecture/">Architecture</Link>
            <Link href="/docs/security/">Security</Link>
            <Link href="/brand/">Brand assets</Link>
          </div>
          <div>
            <h3>Build</h3>
            <Link href="/docs/getting-started/">Quick start</Link>
            <Link href="/docs/deployment/">Deployment</Link>
            <a href={`${repo}/blob/main/umailserver.yaml.example`}>
              Configuration <Icon name="external" size={12} />
            </a>
            <a href={`${repo}/blob/main/docs/api-reference.md`}>
              API reference <Icon name="external" size={12} />
            </a>
          </div>
          <div>
            <h3>Open source</h3>
            <a href={repo}>
              GitHub <Icon name="external" size={12} />
            </a>
            <a href={`${repo}/issues`}>Issues & feedback</a>
            <a href={`${repo}/blob/main/docs/CONTRIBUTING.md`}>Contribute</a>
            <a href={`${repo}/blob/main/LICENSE`}>License</a>
          </div>
        </div>
        <a className="studio" href="https://oxog.net">
          <OxogLogo />
          <div>
            <span className="eyebrow">PART OF A BIGGER PICTURE</span>
            <h2>
              Small studio. <span>Big ideas.</span>
            </h2>
            <p>Explore the tools and infrastructure from Oxog.</p>
          </div>
          <span className="studio-link">
            Meet oxog.net
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
          </span>
        </a>
        <div className="footer-bottom">
          <span>© {new Date().getUTCFullYear()} uMailServer contributors.</span>
          <span>Built in the open. Made to be yours.</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
