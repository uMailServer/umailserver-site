import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="main" className="container not-found">
      <p className="eyebrow">404 / ADDRESS NOT FOUND</p>
      <h1>
        This one missed
        <br />
        the inbox.
      </h1>
      <p>Let’s get you back to a known address.</p>
      <Link href="/" className="button primary">
        Back to uMailServer →
      </Link>
    </main>
  );
}
