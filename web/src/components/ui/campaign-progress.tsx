"use client";

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, Text } from '@tremor/react';

interface CampaignProgressProps {
  currentAmount: number;
  goal: number;
  endDate: string;
  isLoading?: boolean;
}

export const CampaignProgress = ({ currentAmount, goal, endDate, isLoading = false }: CampaignProgressProps) => {
  const [percentage, setPercentage] = useState(0);
  const controls = useAnimation();
  const daysLeft = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    const targetPercentage = Math.min(100, (currentAmount / goal) * 100);
    
    // Animate percentage counter
    let start = 0;
    const step = targetPercentage / 50; // Divide animation into 50 steps
    const interval = setInterval(() => {
      start += step;
      if (start >= targetPercentage) {
        setPercentage(targetPercentage);
        clearInterval(interval);
      } else {
        setPercentage(start);
      }
    }, 20);

    // Animate progress bar
    controls.start({
      width: `${targetPercentage}%`,
      transition: { duration: 1, ease: "easeOut" }
    });

    return () => clearInterval(interval);
  }, [currentAmount, goal, controls]);

  return (
    <Card className="mb-8">
      <div className="p-6">
        <div className="flex justify-between mb-2">
          <Text className="font-medium">Campaign Progress</Text>
          <Text className="font-medium">
            €{currentAmount.toLocaleString()} of €{goal.toLocaleString()}
          </Text>
        </div>
        <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-400"
            initial={{ width: "0%" }}
            animate={controls}
          />
          <motion.div 
            className="absolute top-0 left-0 h-full bg-white opacity-20"
            animate={{
              x: ["0%", "100%"],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }
            }}
            style={{ width: "30%" }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <Text className="text-sm text-gray-500">
            {Math.floor(percentage)}% funded
          </Text>
          <Text className="text-sm text-gray-500">
            {daysLeft} days left
          </Text>
        </div>
      </div>
    </Card>
  );
};
