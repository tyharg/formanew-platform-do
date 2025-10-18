import type { Metadata } from 'next';
import { Geist, Geist_Mono, Roboto, Plus_Jakarta_Sans, Inter } from 'next/font/google';
import { Providers } from 'context/Providers';
import WithLoadingSpinner from 'components/Common/LoadingSpinner/LoadingSpinner';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://formanew.digitalocean.com';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
});

const inter = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'FormaNew | Build SaaS Faster with DigitalOcean Starter Kit',
    template: '%s | FormaNew',
  },
  description:
    'FormaNew is a production-ready SaaS starter kit built with Next.js, Prisma, and Stripe on DigitalOcean to help you launch secure subscription apps faster.',
  keywords: [
    'FormaNew',
    'DigitalOcean starter kit',
    'SaaS boilerplate',
    'Next.js template',
    'Stripe subscription app',
    'Prisma PostgreSQL SaaS',
    'Resend email integration',
    'GradientAI serverless inference',
  ],
  authors: [{ name: 'DigitalOcean', url: 'https://www.digitalocean.com/' }],
  creator: 'DigitalOcean',
  publisher: 'DigitalOcean',
  category: 'Technology',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'FormaNew | SaaS Starter Kit for DigitalOcean',
    description:
      'Launch a subscription-ready SaaS on DigitalOcean with FormaNew — complete with authentication, billing, file storage, and AI tooling.',
    siteName: 'FormaNew',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'FormaNew SaaS Starter Kit by DigitalOcean',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@digitalocean',
    creator: '@digitalocean',
    title: 'FormaNew | SaaS Starter Kit for DigitalOcean',
    description:
      'Accelerate your SaaS launch with FormaNew — a Next.js, Stripe, and Prisma starter kit optimized for DigitalOcean.',
    images: ['/logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
};

/**
 * Root layout of the application.
 * Applies global fonts, base styles and provides shared context through the Providers component.
 *
 * @returns HTML layout with fonts and providers applied.
 */
const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={`${roboto.variable} ${plusJakartaSans.variable} ${inter.variable}`}>
    <body
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{ margin: 0, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
    >
      <Providers>
        <WithLoadingSpinner>{children}</WithLoadingSpinner>
      </Providers>
    </body>
  </html>
);

export default RootLayout;
