'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Text } from '@tremor/react';
import { 
  IconBrandGithub, 
  IconBrandLinkedin, 
  IconBrandInstagram, 
  IconHeart, 
  IconMail, 
  IconPhone,
  IconWorld
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { ContactForm } from '../contact/ContactForm';
import { useTranslation } from '@/context/TranslationContext';

const partners = [
  {
    name: 'ai_shift',
    href: 'https://ai-shift.community',
    logo: '/images/partners/logo_ais_darkmode.png'
  },
  {
    name: 'mission solar',
    href: 'https://missionsolar.energy',
    logo: '/images/partners/logo_ms_darkmode.png'
  }
];

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/aaaalabs',
    icon: IconBrandGithub,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/libralabs',
    icon: IconBrandLinkedin,
  },
  {
    name: 'Google Earth',
    href: 'https://earth.google.com/earth/d/1iar5vMJjzJfjfomgU3nZRPuU4ogCC9Zn?usp=sharing',
    icon: IconWorld,
  }
];

const quotes = [
  'footer.quotes.community',
  'footer.quotes.launchpad',
  'footer.quotes.innovation',
  'footer.quotes.playground',
  'footer.quotes.home',
  'footer.quotes.creative',
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [randomQuote, setRandomQuote] = useState<typeof quotes[number]>(quotes[0]);
  const { t, currentLanguage } = useTranslation();

  useEffect(() => {
    setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <footer className="bg-[#2E4555] text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand and Tagline */}
          <div>
            <div className="flex items-center mb-4">
              <Image
                src="/libralab_darkmode.svg"
                alt="LIBRAlab"
                width={120}
                height={30}
                className="dark"
              />
            </div>
            <p className="text-gray-300 text-sm">
              {t('footer.company_tagline')}
            </p>
          </div>

          {/* Partners */}
          <div>
            <Text className="font-semibold text-lg text-white mb-4">{t('footer.our_partners')}</Text>
            <div className="flex flex-col space-y-3">
              {partners.map((partner) => (
                <Link 
                  key={partner.name}
                  href={partner.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block transition-opacity hover:opacity-90"
                >
                  <Image 
                    src={partner.logo} 
                    alt={partner.name} 
                    width={120} 
                    height={30}
                    className="h-6 w-auto"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Connect and Location Combined */}
          <div>
            <Text className="font-semibold text-lg text-white mb-4">{t('footer.connect')}</Text>
            <div className="space-y-4">
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                    aria-label={link.name}
                  >
                    <link.icon className="w-5 h-5" />
                  </Link>
                ))}
              </div>
              
              {/* Contact Button */}
              <button
                onClick={() => setIsContactFormOpen(true)}
                className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <IconMail className="w-5 h-5 mr-2" />
                <span>{t('footer.contact_us')}</span>
              </button>

              {/* Location with Google Earth */}
              <Link 
                href="https://earth.google.com/earth/d/1iar5vMJjzJfjfomgU3nZRPuU4ogCC9Zn?usp=sharing"
                target="_blank"
                rel="noopener noreferrer" 
                className="inline-flex items-center text-gray-300 hover:text-white transition-colors group"
              >
                <IconWorld className="w-5 h-5 mr-2" />
                <span className="group-hover:underline">LIBRAlab Coliving · Kristeneben 49 · 6094 Kristen</span>
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <Text className="font-semibold text-lg text-white mb-4">{t('footer.legal')}</Text>
            <div className="space-y-2">
              <Link href="/impressum" className="block text-gray-300 hover:text-white transition-colors">
                {t('footer.imprint')}
              </Link>
              <Link 
                href={currentLanguage === 'en' ? '/privacy' : '/datenschutz'} 
                className="block text-gray-300 hover:text-white transition-colors"
              >
                {t('footer.privacy')}
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 mt-8 border-t border-gray-700">
          <Text className="text-center text-sm text-gray-400">
            &copy; {currentYear} LIBRAlab ·{' '}
            <span className="inline-flex items-center">
              {t('footer.made_with')}{' '}
              <IconHeart 
                size={14} 
                className="inline-block text-[#D09467] mx-1" 
                stroke={2}
              />{' '}
              {t('footer.in_austria')}
            </span>
          </Text>
        </div>
      </div>

      <ContactForm isOpen={isContactFormOpen} onClose={() => setIsContactFormOpen(false)} />
    </footer>
  );
}
