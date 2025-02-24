'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/context/TranslationContext';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

export function StickyNav() {
  const { currentLanguage: language, setLanguage } = useTranslation();
  const { theme, systemTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || !mounted) return null;

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm"
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/libralab_lightmode.svg"
              alt="LIBRAlab"
              width={120}
              height={32}
              className="w-32 h-8"
              priority
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
            <Link 
              href="/#rooms" 
              className={`
                group relative px-6 py-2.5 rounded-lg font-medium
                ${isDark 
                  ? 'bg-[#D09467] text-white before:bg-[#B87D51]' 
                  : 'bg-[#2E4555] text-white before:bg-[#1A3F5C]'
                }
                transition-all duration-300
                before:absolute before:inset-0 before:rounded-lg
                before:opacity-0 before:transition-opacity before:duration-300
                hover:before:opacity-100
              `}
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore rooms
                <svg 
                  className="w-4 h-4 transform transition-transform group-hover:translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
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
