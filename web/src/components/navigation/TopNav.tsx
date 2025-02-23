'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/context/TranslationContext';
import { motion } from 'framer-motion';

export function TopNav() {
  const pathname = usePathname();
  const { currentLanguage, setLanguage } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <nav className={`navbar-transparent ${isScrolled ? 'scrolled' : ''}`}>
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
                  className={`lang-selector ${currentLanguage === 'en' ? 'active' : ''}`}
                >
                  EN
                </button>
                <span className={`text-white/30 ${isScrolled ? 'text-gray-500/30' : ''}`}>|</span>
                <button
                  onClick={() => setLanguage('de')}
                  className={`lang-selector ${currentLanguage === 'de' ? 'active' : ''}`}
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
      </nav>
    </motion.header>
  );
}
