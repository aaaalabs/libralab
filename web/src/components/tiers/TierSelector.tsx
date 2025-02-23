import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/context/TranslationContext';
import { EarlyBirdCampaign } from '@/types/epicwg';
import clsx from 'clsx';

interface TierSelectorProps {
  campaign: EarlyBirdCampaign;
  onSelect: (tierId: string) => void;
}

export const TierSelector: React.FC<TierSelectorProps> = ({ campaign, onSelect }) => {
  const { t } = useTranslation();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showUpsells, setShowUpsells] = useState(false);

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
    onSelect(tierId);
    setShowUpsells(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          {t('early_bird_pre_booking')}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {t('early_bird_description')}
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            {campaign.currentAmount}€ {t('raised')}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            {t('campaign_ends')} {new Date(campaign.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {campaign.tiers.map((tier) => (
          <motion.div
            key={tier.id}
            className={clsx(
              'relative rounded-2xl p-6 transition-all duration-300',
              'border-2',
              selectedTier === tier.id
                ? 'border-blue-500 shadow-xl scale-105'
                : 'border-gray-200 hover:border-blue-300'
            )}
            whileHover={{ scale: 1.02 }}
            onClick={() => handleTierSelect(tier.id)}
          >
            {/* Tag */}
            {tier.tag && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                  {tier.tag}
                </span>
              </div>
            )}

            {/* Tier Content */}
            <div className="text-center mb-6 pt-4">
              <h3 className="text-2xl font-bold mb-2">{tier.title}</h3>
              <div className="text-4xl font-bold mb-2">
                €{tier.price}
                <span className="text-lg text-gray-500">/mo</span>
              </div>
              <div className="text-green-500 font-semibold">
                {tier.discount}% {t('off_rent')}
              </div>
            </div>

            {/* Hero Features */}
            <div className="mb-6">
              {tier.heroFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center mb-3"
                >
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              {tier.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-auto">
              <button
                className={clsx(
                  'w-full py-3 px-6 rounded-xl font-semibold transition-colors',
                  selectedTier === tier.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                )}
              >
                {tier.remainingSlots > 0
                  ? `${t('reserve_now')} (${tier.remainingSlots} ${t('spots_left')})`
                  : t('sold_out')}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upsells */}
      <AnimatePresence>
        {showUpsells && selectedTier && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-12"
          >
            <h3 className="text-2xl font-bold mb-6 text-center">
              Enhance Your Experience
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {campaign.upsells
                .filter((upsell) => upsell.availableFor.includes(selectedTier))
                .map((upsell) => (
                  <div
                    key={upsell.id}
                    className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xl font-semibold">{upsell.title}</h4>
                      <span className="text-lg font-bold">€{upsell.price}/mo</span>
                    </div>
                    <div className="space-y-2">
                      {upsell.perks.map((perk, index) => (
                        <div key={index} className="flex items-center">
                          <span className="text-blue-500 mr-2">+</span>
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Future Amenities */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold mb-6 text-center">
          Coming Soon
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaign.futureAmenities.map((amenity) => (
            <div
              key={amenity.title}
              className="relative group overflow-hidden rounded-xl"
            >
              <img
                src={amenity.previewImage}
                alt={amenity.title}
                className="w-full h-48 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 text-white">
                <h4 className="text-lg font-semibold">{amenity.title}</h4>
                <p className="text-sm opacity-90">{amenity.description}</p>
                <span className="text-xs mt-2 opacity-75">{amenity.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
