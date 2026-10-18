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
        <div className="studio">
          <a href="https://oxog.net/" aria-label="Visit Oxog studio" className="oxog-mark">
            <OxogLogo />
          </a>
          <div className="studio-copy">
            <span className="eyebrow">INDEPENDENT SOFTWARE. SHARED POSSIBILITIES.</span>
            <a className="oxog-word" href="https://oxog.net/">
              oxog<span>net</span>
              <b>.</b>
              <Icon name="external" size={23} />
            </a>
            <p>Explore the studio and the ideas behind the tools.</p>
          </div>
          <a className="text-link studio-link" href="https://oxog.net/">
            Meet the studio <Icon name="external" size={18} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getUTCFullYear()} uMailServer contributors.</span>
          <span>Built in the open. Made to be yours.</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
