import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { tokens } from '@/lib/tokens';
import './globals.css';

// One family, two weights, vendored from the brand folder. Self-hosted rather
// than linked from Google, so the first paint does not wait on a third party.
const poppins = localFont({
  src: [
    { path: '../fonts/Poppins-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/Poppins-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-poppins',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const SITE = 'https://cairnetint.com';
const DESCRIPTION =
  "Most businesses don't need AI. They need one specific thing fixed. Cairnet finds that thing, then builds it. Assessments, websites, automation and customer answers for local businesses.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Cairnet, AI integration for local businesses',
    template: '%s | Cairnet',
  },
  description: DESCRIPTION,
  applicationName: 'Cairnet',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Cairnet, AI integration for local businesses',
    description: 'Your next move, marked in stone.',
    url: SITE,
    siteName: 'Cairnet',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Cairnet, AI integration for local businesses',
    description: 'Your next move, marked in stone.',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: tokens.color.semantic.groundDark,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-modal focus:rounded-brand focus:bg-signal focus:px-4 focus:py-2 focus:text-offwhite"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
