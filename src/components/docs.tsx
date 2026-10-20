import Link from 'next/link';
import { Icon } from './icons';
import { CopyButton } from './interactive';
export const productRepo = 'https://github.com/uMailServer/uMailServer';
export const productRevision = 'cc09145f03e150bb6218cf8c32abf3b4675176dd';
export const docsNav = [
  ['Overview', '/docs/'],
  ['Getting started', '/docs/getting-started/'],
  ['Architecture', '/docs/architecture/'],
  ['Deployment', '/docs/deployment/'],
  ['Security & scope', '/docs/security/'],
];
export function DocsShell({
  title,
  intro,
  path,
  children,
}: {
  title: string;
  intro: string;
  path: string;
  children: React.ReactNode;
}) {
  return (
    <main tabIndex={-1} id="main" className="container docs-layout">
      <aside className="docs-sidebar">
        <span className="eyebrow">THE FIELD GUIDE</span>
        <nav aria-label="Documentation">
          {docsNav.map(([name, href]) => (
            <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>
              {name}
              {path === href && <Icon name="arrow" size={13} />}
            </Link>
          ))}
        </nav>
        <a href={`${productRepo}/tree/main/docs`} className="source-link">
          Upstream documentation
          <Icon name="external" size={13} />
        </a>
      </aside>
      <article className="docs-content">
        <div className="breadcrumb">
          <Link href="/">uMailServer</Link>
          <span>/</span>
          <Link href="/docs/">Documentation</Link>
          {path !== '/docs/' && (
            <>
              <span>/</span>
              <span>{title}</span>
            </>
          )}
        </div>
        <h1>{title}</h1>
        <p className="docs-intro">{intro}</p>
        {children}
        <div className="docs-source">
          Content checked against product source{' '}
          <a href={`${productRepo}/tree/${productRevision}`}>{productRevision.slice(0, 7)}</a> on 18
          October 2026. Commands are source-verified; this site does not certify a mail deployment.
        </div>
      </article>
    </main>
  );
}
export function CodeBlock({ code, label = 'terminal' }: { code: string; label?: string }) {
  return (
    <div className="docs-code">
      <div>
        <span>{label}</span>
        <CopyButton text={code} label={`Copy ${label} example`} />
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
export function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="callout">
      <Icon name="book" size={21} />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}
export function SourceLink({ file, children }: { file: string; children: React.ReactNode }) {
  return <a href={`${productRepo}/blob/${productRevision}/${file}`}>{children}</a>;
}
