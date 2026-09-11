import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Providers } from './providers';
import { CompareTray } from '@/components/compare/CompareTray';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { InstallPrompt } from '@/components/layout/InstallPrompt';
import { JsonLd } from '@/components/seo/JsonLd';
import { organizationSchema, websiteSchema } from '@/lib/seo/structured-data';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Hukan — Find a place that feels right',
    template: '%s | Hukan',
  },
  description:
    "Kenya's property marketplace. Search apartments, houses, land and commercial properties for sale and rent across all 47 counties.",
  keywords: [
    'property Kenya',
    'houses for sale Nairobi',
    'apartments for rent',
    'land for sale',
    'Kenya real estate',
    'Hukan',
  ],
  authors: [{ name: 'Hukan' }],
  creator: 'Hukan',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://hukan.co.ke'),
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    siteName: 'Hukan',
    title: 'Hukan — Find a place that feels right',
    description: "Kenya's property marketplace for buyers, renters and professionals.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hukan — Find a place that feels right',
    description: "Kenya's property marketplace.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hukan',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-KE" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col`}>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Providers>
          <Header />
          <main className="flex-1 pb-16 md:pb-0 animate-fade-in">{children}</main>
          <Footer />
          <CompareTray />
          <MobileBottomNav />
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
