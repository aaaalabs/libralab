'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Text, Button, Badge } from '@tremor/react';
import { IconCheck, IconClock, IconX } from '@tabler/icons-react';
import { Footer } from '@/components/layout/Footer';
import { FoundersEliteCard } from '@/components/FoundersEliteCard';
import { CampaignProgress } from '@/components/ui/campaign-progress';
import epicwg from '@/data/epicwg.json';
import { Tier } from '@/types/tier';

interface EpicWGTier extends Tier {
  heroFeatures?: string[];
}

const tiers: EpicWGTier[] = epicwg.earlyBirdCampaign.tiers.map(tier => ({
  id: tier.id,
  name: tier.title,
  price: tier.price,
  description: tier.description,
  maxSlots: tier.maxSlots,
  remainingSlots: tier.remainingSlots,
  discount: tier.discount,
  benefits: tier.benefits,
  heroFeatures: tier.heroFeatures,
  isPopular: tier.id === 'pro'
}));

interface Category {
  name: string;
  features: string[];
}

// Create categories from all unique benefits
const allFeatures: Category[] = [
  {
    name: 'Wohnen & Komfort',
    features: [
      'Super Schlafqualität - Emma Matratzen',
      'Voll ausgestattete Küche',
      'Waschmaschinen & Trockner',
      'Wöchentliche Reinigung',
      'Terasse mit Grill & Chill Ecke'
    ]
  },
  {
    name: 'Workspace & Tech',
    features: [
      'Workstation mit höhenverstellbarem Tisch',
      'Breitbild Monitor',
      'Skylink Highspeed Internet',
      'Ergonomischer Premium Stuhl',
      'Dual Monitor Setup',
      'Meeting Raum Priorität'
    ]
  },
  {
    name: 'Community & Events',
    features: [
      'Community Events Basic',
      'Vergünstigte Event Tickets',
      'VIP Event Access',
      'AI-Shift Workshops (2x/Monat)',
      'AI-Shift Business (-50%)',
      'Förderberatung (-50%)'
    ]
  },
  {
    name: 'Premium Services',
    features: [
      'Freeflow Premium Kaffee',
      'Eigene Kaffeemaschine',
      'Mini Kühlschrank',
      'BT Soundsystem',
      'Ski & Bike Storage',
      'Priority Access: Gym/Sauna/Kino (2025)',
      'Unlimited GPU Credits (Q2/2025)'
    ]
  }
];

// Helper function to get features for a tier based on inheritance
const getTierFeatures = (tierId: string): string[] => {
  const tier = epicwg.earlyBirdCampaign.tiers.find(t => t.id === tierId);
  if (!tier) return [];

  switch (tierId) {
    case 'ultimate':
      return [...getTierFeatures('pro'), ...(tier.benefits || [])];
    case 'pro':
      return [...getTierFeatures('essential'), ...(tier.benefits || [])];
    default:
      return tier.benefits || [];
  }
};

export default function PricingPage() {
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);

  useEffect(() => {
    const campaignEndDate = new Date('2025-03-31');
    const now = new Date();
    setDaysRemaining(Math.ceil((campaignEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-7xl text-center">
          <div className="max-w-3xl mx-auto">
            <Badge color="blue" className="mb-4">Pre-Seed Investment Opportunity</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Invest in the Future of Co-Living
            </h1>
            <Text className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Join our exclusive pre-seed round and become a founding member of our tech-focused co-living community
            </Text>
            <Text className="text-md text-gray-500 dark:text-gray-400 mb-8">
              All deposits are fully refundable upon move-out
            </Text>
            
            {/* Campaign Progress */}
            <div className="max-w-xl mx-auto mb-8">
              <CampaignProgress 
                goal={8000}
                currentAmount={400}
                endDate="2025-03-31T23:59:59+02:00"
              />
            </div>
            
            {/* Campaign Timer */}
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full">
              <IconClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <Text className="text-blue-600 dark:text-blue-400">
                Noch {daysRemaining} Tage verfügbar
              </Text>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.filter(tier => tier.id !== 'founders-elite').map((tier) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative rounded-2xl bg-white dark:bg-gray-800 shadow-lg overflow-hidden border-2 ${
                  tier.isPopular ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                {tier.isPopular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-blue-500 text-white px-3 py-1 text-sm transform rotate-45 translate-x-8 translate-y-3">
                      Beliebt
                    </div>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold">€{epicwg.earlyBirdCampaign.tiers.find(t => t.id === tier.id)?.deposit}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">Deposit</span>
                  </div>
                  {tier.discount && (
                    <Badge color="red" className="mb-4">
                      {tier.discount}% Rabatt auf die Miete
                    </Badge>
                  )}
                  <Text className="text-gray-600 dark:text-gray-300 mb-6">
                    {tier.description}
                  </Text>

                  <div className="space-y-4 mb-8">
                    {(tier.heroFeatures || []).map((feature) => (
                      <div key={feature} className="flex items-center">
                        <IconCheck className="w-5 h-5 text-green-500 mr-3" />
                        <Text>{feature}</Text>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {tier.remainingSlots} von {tier.maxSlots} Plätzen verfügbar
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    color={tier.isPopular ? 'blue' : 'gray'}
                    onClick={() => setSelectedTier(tier.id)}
                  >
                    Jetzt Reservieren
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feature Comparison */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <Button
                color="gray"
                onClick={() => setShowAllFeatures(!showAllFeatures)}
              >
                {showAllFeatures ? 'Weniger Features anzeigen' : 'Alle Features anzeigen'}
              </Button>
            </div>

            {showAllFeatures && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="px-6 py-4 text-left">Feature</th>
                        {tiers.map((tier) => (
                          <th key={tier.id} className="px-6 py-4 text-center">
                            {tier.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allFeatures.map((category: Category) => (
                        <>
                          <tr key={category.name} className="bg-gray-50 dark:bg-gray-700">
                            <td colSpan={5} className="px-6 py-4 font-bold">
                              {category.name}
                            </td>
                          </tr>
                          {category.features.map((feature: string, idx: number) => (
                            <tr
                              key={`${category.name}-${idx}`}
                              className="border-t border-gray-200 dark:border-gray-700"
                            >
                              <td className="px-6 py-4">{feature}</td>
                              {tiers.map((tier) => (
                                <td key={`${tier.id}-${idx}`} className="px-6 py-4 text-center">
                                  {getTierFeatures(tier.id).includes(feature) ? (
                                    <IconCheck className="w-5 h-5 text-green-500 mx-auto" />
                                  ) : (
                                    <IconX className="w-5 h-5 text-red-500 mx-auto" />
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Founders Elite Section */}
          <div className="mt-24 pb-16">
            <div className="text-center mb-12">
              <Badge color="amber" className="mb-4">Limitiert</Badge>
              <h2 className="text-3xl font-bold mb-4">Für visionäre Gründer</h2>
              <Text className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Werde Teil des Gründerteams und sichere dir lebenslange Vorteile
              </Text>
            </div>
            <div className="max-w-5xl mx-auto">
              <FoundersEliteCard 
                onApply={() => setSelectedTier('founders-elite')}
                className="transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
