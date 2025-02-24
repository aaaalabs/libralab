'use client';

import './globals.css';
import '@/lib/env';  
import { Inter } from 'next/font/google';
import { CampaignProvider } from '../context/CampaignContext';
import { TranslationProvider } from '@/context/TranslationContext';
import { ThemeProvider } from "next-themes";
import { TopNav } from '@/components/navigation/TopNav';
import { Toaster } from '../components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TranslationProvider defaultLanguage="en">
            <CampaignProvider>
              <TopNav />
              {children}
              <Toaster />
            </CampaignProvider>
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
