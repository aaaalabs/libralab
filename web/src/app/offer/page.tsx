'use client';

import { FoundersEliteCard } from '@/components/FoundersEliteCard';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FloatingNav } from '@/components/navigation/FloatingNav';
import { CompactTierCard } from '@/components/tiers/CompactTierCard';
import { Text, Button } from '@tremor/react';
import { IconClock } from '@tabler/icons-react';
import { Tier } from '@/types/tier';

export default function OfferPage() {
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [expandedView, setExpandedView] = useState(false);

  // Campaign end date
  const campaignEndDate = new Date('2025-03-15');
  const daysRemaining = Math.ceil((campaignEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const tier: Tier = {
    id: "founders-elite",
    name: "Founders Elite",
    price: 799,
    maxSlots: 10,
    remainingSlots: 3,
    description: "Exclusive founding member package with premium benefits and lifetime perks",
    benefits: [
      "Private Room with Balcony",
      "24/7 Access to Co-Working Space",
      "High-Speed Internet (1000 Mbps)",
      "Weekly Community Events",
      "Access to Mentorship Network",
      "Exclusive Startup Resources",
      "Priority Room Customization",
      "Dedicated Parking Space"
    ],
    isPopular: true,
    discount: 20
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 md:pt-32">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <Text className="text-blue-400 font-medium">Limited Time Offer</Text>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Join the Founders Elite
              <br />
              <span className="text-blue-400">Tech Community</span>
            </h1>
            
            {/* Campaign Timer */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <IconClock className="w-5 h-5 text-blue-400" />
              <Text className="text-white">
                {daysRemaining} days remaining
              </Text>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-8">
              {[
                { label: 'Spots Left', value: `${tier.remainingSlots}/${tier.maxSlots}` },
                { label: 'Starting From', value: `€${tier.price}/mo` },
                { label: 'Move-in Date', value: 'March 2025' },
                { label: 'Min. Stay', value: '6 months' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
                  <Text className="text-gray-400 text-sm">{stat.label}</Text>
                  <Text className="text-xl font-semibold">{stat.value}</Text>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {expandedView ? (
            <>
              <div className="mb-6 text-center">
                <Button
                  variant="secondary"
                  onClick={() => setExpandedView(false)}
                  className="inline-block"
                >
                  Show Compact View
                </Button>
              </div>
              <FoundersEliteCard onApply={() => setShowApplicationModal(true)} />
            </>
          ) : (
            <CompactTierCard
              tier={tier}
              onExpand={() => setExpandedView(true)}
              onApply={() => setShowApplicationModal(true)}
            />
          )}
        </div>
      </section>

      <FloatingNav />
    </div>
  );
}
