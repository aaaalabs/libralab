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
      key: 'interior_design',
      value: '€3,000'
    },
    {
      key: 'community',
      value: '€1,200/Jahr'
    },
    {
      key: 'priority',
      value: '€600'
    },
    {
      key: 'revenue_share',
      value: '€2,400'
    },
    {
      key: 'ai_consulting',
      value: '€2,000'
    },
    {
      key: 'etrike',
      value: '€2,400/Jahr'
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
                  {isTranslationLoading ? '...' : t('founders_elite_spots_left')}
                </Text>
                <Text className="text-amber-400">
                  {isTranslationLoading ? '...' : t('founders_elite_price')}
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
            {isTranslationLoading ? '...' : t('founders_elite_value')}
          </Text>
          <Text className="text-gray-300 mt-1">
            {isTranslationLoading ? '...' : t('founders_elite_looking_for')}
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
                    {isTranslationLoading ? '...' : t(`benefit.${benefit.key}` as TranslationKey)}
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
              {isTranslationLoading ? '...' : t('invest_now')}
            </Button>
          </div>
        </motion.div>
      </div>
    </Card>
  );
}
