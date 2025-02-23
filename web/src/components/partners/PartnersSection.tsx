'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Text } from '@tremor/react';
import { useEffect, useState } from 'react';

interface Partner {
  name: string;
  url: string;
  logoLight: string;
  logoDark: string;
}

const partners: Partner[] = [
  {
    name: 'AI Shift',
    url: 'https://ai-shift.de',
    logoLight: '/images/partners/logo_ais_lightmode.png',
    logoDark: '/images/partners/logo_ais_darkmode.png',
  },
  {
    name: 'Mission Solar',
    url: 'https://mission-solar.at',
    logoLight: '/images/partners/logo_ms_lightmode.png',
    logoDark: '/images/partners/logo_ms_darkmode.png',
  },
];

export const PartnersSection = () => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by only rendering after mount
  if (!mounted) {
    return null;
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <section className="py-16 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Text className="text-2xl font-semibold mb-4">Our Partners</Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Working together with leading tech and sustainability companies
          </Text>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
          {partners.map((partner) => (
            <motion.a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-12 w-48"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={currentTheme === 'dark' ? partner.logoDark : partner.logoLight}
                alt={`${partner.name} logo`}
                fill
                className="object-contain filter hover:brightness-110 transition-all"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};
