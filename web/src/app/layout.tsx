'use client';

import './globals.css';
import '@/lib/env';  
import { CampaignProvider } from '../context/CampaignContext';
import { TranslationProvider } from '@/context/TranslationContext';
import { ThemeProvider } from "next-themes";
import { TopNav } from '@/components/navigation/TopNav';
import { Toaster } from '../components/ui/toaster';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/brp5mxq.css" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
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
