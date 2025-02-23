'use client';

import { motion } from 'framer-motion';
import { Card, Text, Button } from '@tremor/react';
import { IconCheck } from '@tabler/icons-react';
import { Tier } from '@/types/tier';

interface CompactTierCardProps {
  tier: Tier;
  onExpand: () => void;
  onApply: () => void;
}

export const CompactTierCard: React.FC<CompactTierCardProps> = ({
  tier,
  onExpand,
  onApply,
}) => {
  const highlights = tier.benefits.slice(0, 3); // Show only top 3 benefits

  return (
    <Card className="relative overflow-hidden">
      {tier.isPopular && (
        <div className="absolute top-0 right-0">
          <div className="bg-blue-600 text-white px-3 py-1 text-sm transform rotate-45 translate-x-8 translate-y-3">
            Popular
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <Text className="text-xl font-bold mb-2">{tier.name}</Text>
          <div className="flex justify-center items-baseline gap-1">
            <Text className="text-3xl font-bold">€{tier.price}</Text>
            <Text className="text-gray-500">/month</Text>
          </div>
          {tier.discount && (
            <Text className="text-sm text-green-600 mt-1">
              Save {tier.discount}%
            </Text>
          )}
        </div>

        {/* Top Benefits */}
        <div className="space-y-3 mb-6">
          {highlights.map((benefit: string, index: number) => (
            <div key={index} className="flex items-start gap-3">
              <IconCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <Text className="text-gray-600">{benefit}</Text>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onApply}
          >
            Apply Now
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={onExpand}
          >
            See Full Details
          </Button>
        </div>
      </div>
    </Card>
  );
};
