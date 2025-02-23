'use client';

import { motion } from 'framer-motion';
import { TablerIconsProps } from '@tabler/icons-react';
import { OptimizedImage } from '../ui/optimized-image';

interface Feature {
  title: string;
  icon?: React.FC<TablerIconsProps>;
}

interface FeatureGroup {
  title: string;
  features: Feature[];
}

interface FeatureSectionProps {
  title: string;
  description: string;
  groups: FeatureGroup[];
  imageUrl?: string;
  reversed?: boolean;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  description,
  groups,
  imageUrl,
  reversed = false,
}) => {
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
              <h2 className="text-3xl font-bold mb-4">{title}</h2>
              <p className="text-gray-600 text-lg mb-8">{description}</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-8">
              {groups.map((group, idx) => (
                <motion.div
                  key={group.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold text-gray-800">{group.title}</h3>
                  <ul className="space-y-3">
                    {group.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-start gap-2">
                        {feature.icon && <feature.icon className="w-5 h-5 text-blue-500 mt-1" />}
                        <span className="text-gray-600">{feature.title}</span>
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative flex-1"
              style={{ aspectRatio: '2.35/1' }}
            >
              <OptimizedImage
                src={imageUrl}
                alt={title}
                className="rounded-2xl shadow-2xl w-full h-full object-cover"
                width={1200}
                height={510}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
