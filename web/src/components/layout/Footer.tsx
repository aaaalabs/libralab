'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Text } from '@tremor/react';
import { IconBrandGithub, IconBrandLinkedin, IconHeart, IconMail, IconPhone } from '@tabler/icons-react';

const partners = [
  {
    name: 'AI Shift',
    href: 'https://ai-shift.de',
    logo: '/images/partners/logo_ais_darkmode.png',
  },
  {
    name: 'Mission Solar',
    href: 'https://mission-solar.at',
    logo: '/images/partners/logo_ms_darkmode.png',
  },
];

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/libralab',
    icon: IconBrandGithub,
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/libralab-ai',
    icon: IconBrandLinkedin,
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#2E4555] print:hidden">
      {/* Desktop Footer */}
      <div className="hidden md:block max-w-7xl mx-auto py-12 px-8">
        <div className="grid grid-cols-4 gap-12">
          {/* Partners */}
          <div>
            <Text className="font-semibold text-lg text-white mb-6">Our Partners</Text>
            <div className="grid gap-4">
              {partners.map((partner) => (
                <Link
                  key={partner.name}
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={120}
                    height={40}
                    className="h-8 w-auto object-contain"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Company Info */}
          <div>
            <Text className="font-semibold text-lg text-white mb-6">LIBRAlab</Text>
            <Text className="text-sm text-gray-300">
              Innovation Hub & Tech Community in Innsbruck
            </Text>
          </div>

          {/* Contact */}
          <div>
            <Text className="font-semibold text-lg text-white mb-6">Connect</Text>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-300 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <Text className="text-white font-semibold mb-4">Rechtliches</Text>
            <ul className="space-y-2">
              <li>
                <Link href="/impressum" className="text-gray-300 hover:text-white transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-gray-300 hover:text-white transition-colors">
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <Text className="text-sm text-gray-300">
            &copy; {currentYear} LIBRAlab.ai – Made with <IconHeart className="inline-block h-4 w-4 text-red-500" /> in Innsbruck
          </Text>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="md:hidden px-6 py-8">
        <div className="space-y-8">
          {/* Partners */}
          <div>
            <Text className="font-semibold text-lg text-white mb-4">Our Partners</Text>
            <div className="grid gap-4">
              {partners.map((partner) => (
                <Link
                  key={partner.name}
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={120}
                    height={40}
                    className="h-8 w-auto object-contain"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Company Info */}
          <div>
            <Text className="font-semibold text-lg text-white mb-4">LIBRAlab</Text>
            <Text className="text-sm text-gray-300">
              Innovation Hub & Tech Community in Innsbruck
            </Text>
          </div>

          {/* Contact */}
          <div>
            <Text className="font-semibold text-lg text-white mb-4">Connect</Text>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-300 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <Text className="font-semibold text-lg text-white mb-4">Rechtliches</Text>
            <div className="space-y-2">
              <Link href="/impressum" className="text-gray-300 block hover:text-white transition-colors">
                Impressum
              </Link>
              <Link href="/datenschutz" className="text-gray-300 block hover:text-white transition-colors">
                Datenschutz
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <Text className="text-xs text-gray-300 mt-8 pt-8 border-t border-gray-700">
          &copy; {currentYear} LIBRAlab.ai
        </Text>
      </div>
    </footer>
  );
}
