'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconMenu2,
  IconX,
  IconHome,
  IconCalendarEvent,
  IconUsers,
  IconStarsFilled,
  IconChevronUp
} from '@tabler/icons-react';

export const FloatingNav = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past 100vh
      setIsVisible(window.scrollY > window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {
      label: 'Pre-Seed Investment',
      href: '/preseed',
      icon: IconStarsFilled,
      highlight: true
    },
    { label: 'Home', href: '/', icon: IconHome },
    { label: 'Book a Tour', href: '/book', icon: IconCalendarEvent },
    { label: 'Community', href: '/community', icon: IconUsers },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4"
        >
          {/* Main Navigation */}
          <div className="relative">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? (
                <IconX className="w-6 h-6" />
              ) : (
                <IconMenu2 className="w-6 h-6" />
              )}
            </motion.button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute bottom-full right-0 mb-4 bg-white rounded-lg shadow-xl overflow-hidden"
                >
                  <div className="py-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
                          pathname === item.href ? 'bg-gray-50' : ''
                        } ${
                          item.highlight ? 'text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${
                          item.highlight ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <span className="whitespace-nowrap">{item.label}</span>
                        {item.highlight && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                            Limited
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Scroll to Top */}
          <motion.button
            onClick={scrollToTop}
            className="bg-gray-800/80 backdrop-blur text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconChevronUp className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
