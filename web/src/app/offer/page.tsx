'use client';

import { FoundersEliteCard } from '@/components/FoundersEliteCard';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function OfferPage() {
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Limited Time Founders Elite Offer
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300"
          >
            Join our exclusive founding members and shape the future of tech living in Innsbruck
          </motion.p>
        </div>

        {/* Offer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FoundersEliteCard onApply={() => setShowApplicationModal(true)} />
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-24"
        >
          <h2 className="text-2xl font-bold text-center mb-12">Exclusive Founder Benefits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Priority Room Selection",
                description: "First choice on room selection and customization options"
              },
              {
                title: "Lifetime Rate Lock",
                description: "Your founding member rate stays fixed, protected from future increases"
              },
              {
                title: "Extended Stay Flexibility",
                description: "Flexible booking terms exclusive to founding members"
              },
              {
                title: "Premium Upgrades",
                description: "Free upgrades to premium amenities and workspace features"
              },
              {
                title: "Event Priority",
                description: "VIP access to all community events and workshops"
              },
              {
                title: "Founding Member Badge",
                description: "Recognition as a founding member in our community"
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
