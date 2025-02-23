'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/context/TranslationContext';
import { motion } from 'framer-motion';

export function StickyNav() {
  const { currentLanguage: language, setLanguage } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'white',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/sync_logo02.svg"
              alt="EpicWG Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-8">
            {/* Language Selector */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setLanguage('en')}
                className={`lang-selector ${language === 'en' ? 'active' : ''}`}
              >
                EN
              </button>
              <span className="text-gray-500/30">|</span>
              <button
                onClick={() => setLanguage('de')}
                className={`lang-selector ${language === 'de' ? 'active' : ''}`}
              >
                DE
              </button>
            </div>

            {/* Navigation Links */}
            <Link href="/#rooms" className="nav-button">
              Explore rooms
            </Link>

            <Link href="/preseed" className="nav-button">
              Invest now
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
