import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Header, MotionObserver } from '@/components/interactive';
import { Footer } from '@/components/footer';
import { SiteBackground } from '@/components/site-background';

const spaceGrotesk = localFont({
  src: './fonts/spacegrotesk.woff2',
  variable: '--font-space-grotesk',
  weight: '300 700',
  display: 'swap',
  adjustFontFallback: 'Arial',
});
const jetbrainsMono = localFont({
  src: './fonts/jetbrainsmono.woff2',
  variable: '--font-jetbrains',
  weight: '100 800',
  display: 'swap',
  adjustFontFallback: 'Arial',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://umailserver.com'),
  title: { default: 'uMailServer — One binary. Complete email.', template: '%s · uMailServer' },
  description:
    'Your mail. Your infrastructure. A self-hosted Go mail server with SMTP, IMAP, webmail, spam protection and administration in one executable.',
  openGraph: {
    type: 'website',
    siteName: 'uMailServer',
    title: 'One binary. Complete email.',
    description: 'A complete mail stack. A smaller operational footprint. Meet uMailServer.',
    url: 'https://umailserver.com',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'uMailServer — One binary. Complete email.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'uMailServer — One binary. Complete email.',
    images: ['/og.png'],
  },
  icons: { icon: '/logo-mark.svg', apple: '/apple-touch-icon.png' },
};
const themeScript = `(function(){try{var t=localStorage.getItem('umail-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}})()`;
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body id="top">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteBackground />
        <Header />
        {children}
        <Footer />
        <MotionObserver />
      </body>
    </html>
  );
}
