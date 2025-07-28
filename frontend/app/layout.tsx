// app/layout.tsx
import './globals.css';
import ClientLayoutWrapper from './client-layout';
import { Metadata, Viewport } from 'next';
import { inter } from './fonts';

export const viewport: Viewport = {
  themeColor: '#f59e0b', // Properly moved to viewport
}

export const metadata: Metadata = {
  metadataBase: new URL('https://bettingbaits.com'), // Added metadataBase
  title: {
    template: '%s | BettingBaits',
    default: 'BettingBaits - Predictive Placement Wagering',
  },
  description: 'Compete in skill-based betting markets for campus placements. Predict outcomes, wager BB tokens, and climb leaderboards!',
  keywords: ['placement betting', 'campus recruitment', 'skill wagering', 'college competitions', 'BB tokens'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://bettingbaits.com',
    siteName: 'BettingBaits',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'BettingBaits Competitive Platform',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@bettingbaits',
    images: '/og-image.jpg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="bg-black text-amber-50 font-sans antialiased">
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}