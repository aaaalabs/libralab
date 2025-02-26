'use client';

import React from 'react';
import { Footer } from '@/components/layout/Footer';
import { TopNav } from '@/components/navigation/TopNav';
import { useTranslation } from '@/context/TranslationContext';

export default function PrivacyPage() {
  const { t, currentLanguage } = useTranslation();

  return (
    <>
      <TopNav />
      <main className="container mx-auto px-4 py-16 max-w-4xl min-h-screen">
        <h1 className="text-3xl font-bold text-navy mb-8">
          {currentLanguage === 'en' ? 'Privacy Policy' : 'Datenschutzerklärung'}
        </h1>
        
        <section className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-navy mb-4">
              {currentLanguage === 'en' ? '1. Data Protection at a Glance' : '1. Datenschutz auf einen Blick'}
            </h2>
            <h3 className="text-lg font-medium text-navy mb-2">
              {currentLanguage === 'en' ? 'General Information' : 'Allgemeine Hinweise'}
            </h3>
            <p className="text-navy/80 mb-4">
              {currentLanguage === 'en' 
                ? 'The following information provides a simple overview of what happens to your personal data when you visit this website. Personal data is any data that can be used to personally identify you.'
                : 'Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.'
              }
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-4">
              {currentLanguage === 'en' ? '2. Responsible Party' : '2. Verantwortliche Stelle'}
            </h2>
            <p className="text-navy/80 mb-4">
              Libra Innovation FlexCo<br />
              Adamgasse 23<br />
              6020 Innsbruck<br />
              {currentLanguage === 'en' ? 'Austria' : 'Österreich'}<br /><br />
              {currentLanguage === 'en' ? 'Phone' : 'Tel.'}: +49 176 577 16 229<br />
              Email: <a href="mailto:contact@libralab.ai" className="text-copper hover:underline">contact@libralab.ai</a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-4">
              {currentLanguage === 'en' ? '3. Data Protection Officer' : '3. Datenschutzbeauftragter'}
            </h2>
            <p className="text-navy/80 mb-4">
              {currentLanguage === 'en' ? 'Statutory Data Protection Officer' : 'Gesetzlich vorgeschriebener Datenschutzbeauftragter'}:<br />
              Thomas Seiger<br />
              Email: <a href="mailto:privacy@libralab.ai" className="text-copper hover:underline">privacy@libralab.ai</a>
            </p>
          </div>

          <div className="pt-8">
            <p className="text-navy/80 italic">
              {currentLanguage === 'en' ? 'Last updated' : 'Stand'}: Februar 2025
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
