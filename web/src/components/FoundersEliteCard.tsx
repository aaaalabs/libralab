'use client';

import React from 'react';
import { motion } from "framer-motion";
import { Card, Text, Button } from "@tremor/react";
import { IconCrown, IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "../context/TranslationContext";
import type { TranslationKey } from "../types/i18n";

interface FoundersEliteProps {
  onApply: () => void;
}

export function FoundersEliteCard({ onApply }: FoundersEliteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, isLoading: isTranslationLoading } = useTranslation();

  const benefits = [
    {
      key: 'benefit.interior_design' as const,
      icon: <IconCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
    },
    {
      key: 'benefit.community' as const,
      icon: <IconCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
    },
    {
      key: 'benefit.priority' as const,
      icon: <IconCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
    },
    {
      key: 'benefit.revenue_share' as const,
      icon: <IconCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
    },
    {
      key: 'benefit.ai_consulting' as const,
      icon: <IconCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
    },
    {
      key: 'benefit.etrike' as const,
      icon: <IconCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <Card 
        className={`relative overflow-hidden transition-all duration-300 ${
          isExpanded ? 'bg-gradient-to-br from-black to-gray-900' : 'bg-black/5 hover:bg-black/10'
        }`}
      >
        {/* Compact View */}
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-3">
            <IconCrown className={`w-5 h-5 ${isExpanded ? 'text-amber-400' : 'text-gray-600'}`} />
            <div>
              <Text className={`font-semibold ${isExpanded ? 'text-amber-400' : 'text-gray-800'}`}>
                {isTranslationLoading ? '...' : t('founders_elite_title')}
              </Text>
              <div className="flex flex-col gap-1">
                <Text className="text-gray-600">
                  {isTranslationLoading ? '...' : t('founders_elite_price_month')}
                </Text>
                <Text className="text-amber-500 text-sm">
                  {isTranslationLoading ? '...' : t('founders_elite_value')}
                </Text>
                <Text className="text-amber-500 text-sm">
                  {isTranslationLoading ? '...' : t('founders_elite_spots_left')}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded View */}
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="pt-4 space-y-4">
            <Text className="text-gray-400">
              {isTranslationLoading ? '...' : t('founders_elite_looking_for')}
            </Text>
            
            <div className="space-y-2">
              {benefits.map((benefit) => (
                <div key={benefit.key} className="flex items-center gap-2">
                  {benefit.icon}
                  <Text className="text-gray-300 text-sm">
                    {isTranslationLoading ? '...' : t(benefit.key)}
                  </Text>
                </div>
              ))}
            </div>

            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => {
                onApply();
              }}
            >
              {isTranslationLoading ? '...' : t('founders_elite_apply_now')}
            </Button>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}
