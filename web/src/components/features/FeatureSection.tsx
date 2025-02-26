'use client';

import { motion } from 'framer-motion';
import { TablerIconsProps } from '@tabler/icons-react';
import { OptimizedImage } from '../ui/optimized-image';
import { useTranslation } from '@/context/TranslationContext';

interface Feature {
  title: string;
  icon?: React.FC<TablerIconsProps>;
}

interface FeatureGroup {
  title: string;
  features: Feature[];
  translationKey?: string;
}

interface FeatureSectionProps {
  title: string;
  description: string;
  groups: FeatureGroup[];
  imageUrl?: string;
  reversed?: boolean;
  onApply?: () => void;
  translationKey?: string;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  description,
  groups,
  imageUrl,
  reversed = false,
  onApply,
  translationKey,
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className={`flex flex-col lg:flex-row items-center gap-12 ${reversed ? 'lg:flex-row-reverse' : ''}`}>
          {/* Content */}
          <div className="flex-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4">
                {translationKey ? t(`${translationKey}_title`) : title}
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                {translationKey ? t(`${translationKey}_description`) : description}
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-8">
              {groups.map((group, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <h3 className="text-xl font-semibold mb-4 text-[#2E4555]">
                    {group.translationKey ? t(group.translationKey) : group.title}
                  </h3>
                  <ul className="space-y-3">
                    {group.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-start">
                        {feature.icon && (
                          <span className="mr-2 text-[#D09467] mt-0.5">
                            <feature.icon size={18} />
                          </span>
                        )}
                        <span className="text-gray-700">{feature.title}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Image */}
          {imageUrl && (
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: reversed ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="rounded-xl overflow-hidden shadow-xl">
                <OptimizedImage
                  src={imageUrl}
                  alt={title}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
