'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { CampaignProvider } from '../context/CampaignContext';
import { TranslationProvider } from '@/context/TranslationContext';

const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: "EpicWG",
//   description: "Join our early-bird campaign for EpicWG",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TranslationProvider defaultLanguage="en">
          <CampaignProvider>
            {children}
          </CampaignProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
