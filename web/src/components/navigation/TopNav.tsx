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
              <div className="relative h-6 w-24">
                {/* Dark mode logo - visible when not scrolled */}
                <Image
                  src="/libralab_darkmode.svg"
                  alt="LIBRAlab"
                  fill
                  className={`transition-opacity duration-300 ${isScrolled ? 'opacity-0' : 'opacity-100'}`}
                  priority
                />
                {/* Light mode logo - visible when scrolled */}
                <Image
                  src="/libralab_lightmode.svg"
                  alt="LIBRAlab"
                  fill
                  className={`transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}
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
                className={`
                  group relative inline-flex items-center px-4 py-2 text-sm font-medium overflow-hidden rounded-full transition-all duration-300
                  ${isScrolled 
                    ? 'bg-[#2E4555] text-white shadow-[0_2px_8px_rgba(46,69,85,0.25)]' 
                    : 'border-2 border-[#D09467] text-[#D09467] group-hover:text-[#EBDBC3]'
                  }
                `}
                style={!isScrolled ? {
                  backgroundColor: 'rgba(208, 148, 103, 0.1)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                } : undefined}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {isScrolled ? (
                    <>
                      <div className="absolute inset-0" style={{
                        backdropFilter: 'blur(12px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                        backgroundColor: 'rgba(46, 69, 85, 0.15)'
                      }}></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#2E4555]/20 to-[#1A3F5C]/20"></div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0" style={{
                        backdropFilter: 'blur(12px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                        backgroundColor: 'rgba(208, 148, 103, 0.15)'
                      }}></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#D09467]/20 to-[#E1B588]/20"></div>
                    </>
                  )}
                </div>
                <span className="relative z-10 flex items-center gap-2">
                  {t('nav.discover_room')}
                  <svg 
                    className="w-4 h-4 transform transition-transform group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
