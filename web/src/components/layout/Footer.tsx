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
  {
    name: 'Email',
    href: 'mailto:hello@libralab.ai',
    icon: IconMail,
  },
  {
    name: 'Phone',
    href: 'tel:+43123456789',
    icon: IconPhone,
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
            <div className="flex flex-wrap gap-8">
              {partners.map((partner) => (
                <Link
                  key={partner.name}
                  href={partner.href}
                  className="hover:opacity-75 transition-opacity focus:ring-2 focus:ring-white rounded"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={100}
                    height={40}
                    className="h-10 w-auto"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Company Info */}
          <div>
            <Text className="font-semibold text-lg text-white mb-4">LibraLab</Text>
            <Text className="text-base text-gray-300 mb-6">
              Innovation Hub & Tech Community in Innsbruck
            </Text>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Quick Links</h3>
            <nav className="flex flex-col space-y-4">
              <Link href="/privacy" className="text-base text-gray-300 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/imprint" className="text-base text-gray-300 hover:text-white">
                Legal Notice
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Contact</h3>
            <nav className="flex flex-col space-y-4">
              <a href="mailto:hello@libralab.ai" className="text-base text-gray-300 hover:text-white">
                hello@libralab.ai
              </a>
              <a href="tel:+43123456789" className="text-base text-gray-300 hover:text-white">
                +43 123 456 789
              </a>
              <div className="flex space-x-4 mt-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-gray-300 hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <link.icon className="h-6 w-6" />
                  </a>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <Text className="text-sm text-gray-300">
            &copy; {currentYear} LibraLab.ai – Made with <IconHeart className="inline-block h-4 w-4 text-red-500" /> in Innsbruck
          </Text>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="md:hidden py-8 px-6">
        <div className="space-y-8">
          {/* Company Info */}
          <div>
            <Text className="font-semibold text-lg text-white mb-2">LibraLab</Text>
            <Text className="text-sm text-gray-300">
              Innovation Hub & Tech Community in Innsbruck
            </Text>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-semibold text-white mb-3">Contact</h3>
            <div className="space-y-2">
              <a href="mailto:hello@libralab.ai" className="text-sm text-gray-300 block">
                hello@libralab.ai
              </a>
              <div className="flex space-x-4 mt-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-gray-300 hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <link.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <Text className="text-xs text-gray-300 pt-4 border-t border-gray-700">
            &copy; {currentYear} LibraLab.ai
          </Text>
        </div>
      </div>
    </footer>
  );
}
