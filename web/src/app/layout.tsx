'use client';

import './globals.css';
import '@/lib/env';  
import { CampaignProvider } from '../context/CampaignContext';
import { TranslationProvider } from '@/context/TranslationContext';
import { ThemeProvider } from "next-themes";
import { TopNav } from '@/components/navigation/TopNav';
import { Toaster } from '../components/ui/toaster';
import { metadata } from './metadata';
import { OrganizationStructuredData, ColivingSpaceStructuredData } from '@/components/seo/StructuredData';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="author" content={metadata.authors[0].name} />
        <meta name="creator" content={metadata.creator} />
        <meta name="publisher" content={metadata.publisher} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content={metadata.openGraph.type} />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta property="og:site_name" content={metadata.openGraph.siteName} />
        <meta property="og:locale" content={metadata.openGraph.locale} />
        
        {/* Twitter */}
        <meta property="twitter:card" content={metadata.twitter.card} />
        <meta property="twitter:url" content={metadata.openGraph.url} />
        <meta property="twitter:title" content={metadata.twitter.title} />
        <meta property="twitter:description" content={metadata.twitter.description} />
        <meta property="twitter:image" content={metadata.twitter.images[0]} />
        
        {/* Canonical link */}
        <link rel="canonical" href={metadata.alternates.canonical} />
        
        {/* Alternate language versions */}
        <link rel="alternate" href={metadata.alternates.languages.en} hrefLang="en" />
        <link rel="alternate" href={metadata.alternates.languages.de} hrefLang="de" />
        
        {/* Structured Data for AI agents and search engines */}
        <OrganizationStructuredData />
        <ColivingSpaceStructuredData />
        
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
