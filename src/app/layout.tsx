import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './fonts.css';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { StickyCta } from '@/components/StickyCta';
import { JsonLd } from '@/components/JsonLd';
import { localBusinessSchema, websiteSchema } from '@/lib/schema';
import { metadataBase, ogImage } from '@/lib/seo';
import { leadFormScript } from '@/data/lead-form';
import { site } from '@/data/site';

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${site.brand} | ${site.phone.display}`,
    template: '%s',
  },
  description: `Basement waterproofing, crawl space encapsulation and foundation drainage across ${site.serviceAreaLabel}. Free on-site diagnosis. Call ${site.phone.display}.`,
  applicationName: site.brand,
  formatDetection: { telephone: true, address: true },
  icons: {
    icon: [
      // /favicon.ico first: browsers and crawlers request that path directly
      // and there is no server here to rewrite it. Generated from the brand
      // mark at build time by scripts/build-favicon.mjs.
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
      { url: '/brand/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/brand/apple-icon.png', sizes: '180x180' }],
  },
  openGraph: { images: [ogImage] },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#141a2f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <body className="flex min-h-screen flex-col">
        {/* Global entity graph — emitted once, referenced by @id elsewhere */}
        <JsonLd data={localBusinessSchema()} />
        <JsonLd data={websiteSchema()} />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-hivis-500 focus:px-4 focus:py-2 focus:font-display focus:font-bold"
        >
          Skip to content
        </a>

        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <StickyCta />

        {/*
          LeadSmart embed script. The provider's snippet wrapped this in
          document.write(), which blanks the page when called after load —
          see the note in src/data/lead-form.ts. Loading the script directly
          after hydration is equivalent and keeps it off the critical path.
        */}
        {leadFormScript.enabled && (
          <Script
            id={leadFormScript.id}
            src={leadFormScript.src}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
