'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/context/TranslationContext';
import { motion } from 'framer-motion';
import { LanguageSelector } from "./LanguageSelector";

export function TopNav() {
  const pathname = usePathname();
  const { currentLanguage, setLanguage, t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkBaseStyle = `text-sm font-medium transition-colors duration-200`;
  const navLinkScrolledStyle = isScrolled ? 'text-[#2E4555] hover:text-[#D09467]' : 'text-[#EBDBC3] hover:text-[#D09467]';

  const scrollToRooms = (e: React.MouseEvent) => {
    e.preventDefault();
    const roomsSection = document.getElementById('rooms');
    if (roomsSection) {
      roomsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      <nav className={`navbar-transparent ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'} ${isScrolled ? 'scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto pl-4 sm:pl-6 lg:pl-8 pr-4 sm:pr-6 lg:pr-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative h-8 w-32">
                {/* Dark mode logo - visible when not scrolled */}
                <Image
                  src="/libralab_darkmode.png"
                  alt="LibraLab"
                  fill
                  sizes="(max-width: 768px) 100vw, 200px"
                  className={`object-contain transition-opacity duration-300 ${
                    isScrolled ? 'opacity-0' : 'opacity-100'
                  }`}
                  priority
                />
                {/* Light mode logo - visible when scrolled */}
                <Image
                  src="/libralab_lighrmode.png"
                  alt="LibraLab"
                  fill
                  sizes="(max-width: 768px) 100vw, 200px"
                  className={`object-contain transition-opacity duration-300 ${
                    isScrolled ? 'opacity-100' : 'opacity-0'
                  }`}
                  priority
                />
              </div>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-8">
              {/* Language Selector */}
              <LanguageSelector />

              {/* Discover Room Button */}
              <button
                onClick={scrollToRooms}
                className="group relative inline-flex items-center px-4 py-2 text-sm font-medium overflow-hidden rounded-full border-2 border-[#D09467] transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(208, 148, 103, 0.1)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                {/* Glass effect overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div 
                    className="absolute inset-0"
                    style={{
                      backdropFilter: 'blur(12px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                      backgroundColor: 'rgba(208, 148, 103, 0.15)',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D09467]/20 to-[#E1B588]/20" />
                </div>
                
                {/* Button content */}
                <span className="relative z-10 text-[#D09467] group-hover:text-[#EBDBC3] transition-colors duration-300 flex items-center">
                  {t('nav.discover_room')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
