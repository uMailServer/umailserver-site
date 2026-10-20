import type { Metadata } from 'next';
import { Icon, Logo } from '@/components/icons';
export const metadata: Metadata = {
  title: 'Brand assets',
  description: 'Scalable uMailServer logo assets, faithful to the envelope and lightning mark.',
  alternates: { canonical: '/brand/' },
};
export default function Brand() {
  return (
    <main tabIndex={-1} id="main" className="container brand-page">
      <p className="eyebrow">A LITTLE MARK. A COMPLETE IDENTITY.</p>
      <h1>Made to be recognized.</h1>
      <p>
        The envelope and lightning bolt capture a simple idea: email infrastructure with less
        friction. These scalable redraws preserve the character of the supplied uMailServer artwork.
      </p>
      <div className="brand-assets">
        <article className="brand-asset">
          <div className="asset-preview">
            <Logo />
          </div>
          <h2>The complete signature.</h2>
          <p>
            For headers, documentation and product introductions. Keep breathing room around the
            mark.
          </p>
          <a download href="/logo.svg" className="text-link">
            Download SVG signature
            <Icon name="arrow" size={17} />
          </a>
        </article>
        <article className="brand-asset">
          <div className="asset-preview">
            <Logo markOnly />
          </div>
          <h2>A small, clear signal.</h2>
          <p>
            The standalone envelope and bolt. For compact layouts, icons and other small spaces.
          </p>
          <a download href="/logo-mark.svg" className="text-link">
            Download SVG mark
            <Icon name="arrow" size={17} />
          </a>
        </article>
      </div>
    </main>
  );
}
