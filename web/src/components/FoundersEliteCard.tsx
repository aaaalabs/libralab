'use client';

import React from 'react';
import { motion } from "framer-motion";
import { Card, Text, Button } from "@tremor/react";
import { IconCrown, IconCheck, IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "../context/TranslationContext";
import type { TranslationKey } from "../types/i18n";

interface FoundersEliteProps {
  onApply: () => void;
  className?: string;
}

export function FoundersEliteCard({ onApply, className = '' }: FoundersEliteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, isLoading: isTranslationLoading } = useTranslation();

  const benefits = [
    {
      key: 'benefit.interior_design' as const,
      value: '€3,000',
      description: 'Custom Interior Design Consultation'
    },
    {
      key: 'benefit.community' as const,
      value: '€1,200/Jahr',
      description: 'Lifetime AI-Shift Community Membership'
    },
    {
      key: 'benefit.priority' as const,
      value: '€600',
      description: 'Priority Room Alert: Get notified when your designed room is about to be booked (1 year)'
    },
    {
      key: 'benefit.revenue_share' as const,
      value: '€2,400',
      description: 'Earn 20% revenue share from your designed room bookings (1 year)'
    },
    {
      key: 'benefit.ai_consulting' as const,
      value: '€2,000',
      description: '1:1 AI Consulting Sessions with Libralab CTO during your stay'
    },
    {
      key: 'benefit.etrike' as const,
      value: '€2,400/Jahr',
      description: 'E-Trike Carsharing Mini'
    }
  ];

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 bg-gradient-to-br from-gray-900 to-black cursor-pointer ${className}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-start gap-4">
            <IconCrown className="w-8 h-8 text-amber-400 flex-shrink-0 mt-2" />
            <div>
              <h2 className="text-4xl font-bold text-amber-400 tracking-tight mb-2">
                {isTranslationLoading ? '...' : t('founders_elite_title')}
              </h2>
              <div className="flex items-center gap-4">
                <Text className="text-gray-400">
                  2 spots left
                </Text>
                <Text className="text-amber-400">
                  €8,999 one-time investment
                </Text>
              </div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <IconChevronDown className="w-6 h-6 text-amber-400" />
          </motion.div>
        </div>

        {/* Value Proposition */}
        <div className="mb-4">
          <Text className="text-amber-400 text-xl font-medium">
            Total Value: €11,600+ (first year)
          </Text>
          <Text className="text-gray-300 mt-1">
            Looking for visionary founders
          </Text>
        </div>

        {/* Expanded Content */}
        <motion.div
          initial={false}
          animate={{ 
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="space-y-3">
            {benefits.map((benefit) => (
              <div key={benefit.key} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-gray-800/50">
                <div className="flex items-center gap-3 flex-1">
                  <IconCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <Text className="text-gray-200">
                    {benefit.description}
                  </Text>
                </div>
                <Text className="text-amber-400 font-medium whitespace-nowrap">
                  {benefit.value}
                </Text>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg text-lg"
              onClick={(e) => {
                e.stopPropagation();
                onApply();
              }}
            >
              Jetzt Investieren
            </Button>
          </div>
        </motion.div>
      </div>
    </Card>
  );
}
