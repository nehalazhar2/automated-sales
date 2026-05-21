import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StructuredData from '@/components/seo/StructuredData';
import { professionalServiceSchema } from '@/components/seo/schemas';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Pipedrive, AI & Automation Consultancy`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Pipedrive, AI & Automation Consultancy`,
    description: SITE_DESCRIPTION,
    images: [{ url: '/og', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ['/og'],
  },
  robots:
    process.env.VERCEL_ENV === 'preview'
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  verification: process.env.GOOGLE_VERIFICATION_CODE
    ? { google: process.env.GOOGLE_VERIFICATION_CODE }
    : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <StructuredData data={professionalServiceSchema()} />
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />
        <main id="main" className="site-main" role="main">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
