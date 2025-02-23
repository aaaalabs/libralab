'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Benefit = {
  emoji: string;
  text: string;
  color: string;
};

const benefits: Benefit[] = [
  // Room Equipment - Purple gradient
  { emoji: "🛏️", text: "Emma Matratzen", color: "from-purple-500/30 to-pink-500/30" },
  { emoji: "🪑", text: "Höhenverstellbare Tische", color: "from-purple-500/30 to-pink-500/30" },
  { emoji: "🖥️", text: "Breitbild Monitor", color: "from-purple-500/30 to-pink-500/30" },
  { emoji: "🌐", text: "Skylink Internet", color: "from-purple-500/30 to-pink-500/30" },
  { emoji: "🛁", text: "Grundausstattung", color: "from-purple-500/30 to-pink-500/30" },

  // Facilities - Blue gradient
  { emoji: "👨‍🍳", text: "Voll ausgestattete Küche", color: "from-blue-500/30 to-cyan-500/30" },
  { emoji: "☕", text: "Freeflow Kaffee", color: "from-blue-500/30 to-cyan-500/30" },
  { emoji: "🧺", text: "Waschmaschinen", color: "from-blue-500/30 to-cyan-500/30" },
  { emoji: "🛒", text: "Self Service Shop", color: "from-blue-500/30 to-cyan-500/30" },
  { emoji: "💻", text: "Coworking Space", color: "from-blue-500/30 to-cyan-500/30" },
  { emoji: "🤝", text: "Meeting Raum", color: "from-blue-500/30 to-cyan-500/30" },
  { emoji: "🚿", text: "3 Bäder, 4 WCs", color: "from-blue-500/30 to-cyan-500/30" },
  { emoji: "✨", text: "Reinigungsservice", color: "from-blue-500/30 to-cyan-500/30" },

  // Entertainment - Green gradient
  { emoji: "🏡", text: "Grill & Chill", color: "from-green-500/30 to-emerald-500/30" },
  { emoji: "🏔️", text: "Panorama Aussicht", color: "from-green-500/30 to-emerald-500/30" },
  { emoji: "🎿", text: "Ski & Bike Storage", color: "from-green-500/30 to-emerald-500/30" },
  { emoji: "🥬", text: "Gemüsegarten", color: "from-green-500/30 to-emerald-500/30" },
  { emoji: "🌅", text: "Hängematten", color: "from-green-500/30 to-emerald-500/30" },
  { emoji: "🎮", text: "Gaming Room", color: "from-green-500/30 to-emerald-500/30" },
  { emoji: "🚲", text: "eBike Sharing", color: "from-green-500/30 to-emerald-500/30" },
  { emoji: "🚗", text: "eCar Sharing", color: "from-green-500/30 to-emerald-500/30" },

  // Outdoor - Orange gradient
  { emoji: "🏃", text: "Laufstrecken", color: "from-orange-500/30 to-amber-500/30" },
  { emoji: "🚵", text: "Bike Trails", color: "from-orange-500/30 to-amber-500/30" },
  { emoji: "⛷️", text: "Skigebiet", color: "from-orange-500/30 to-amber-500/30" },
  { emoji: "🏔️", text: "Wanderwege", color: "from-orange-500/30 to-amber-500/30" },
  { emoji: "🧗", text: "Kletterrouten", color: "from-orange-500/30 to-amber-500/30" },
  { emoji: "🏍️", text: "Motocross", color: "from-orange-500/30 to-amber-500/30" },
  { emoji: "🏊", text: "Schwimmbad", color: "from-orange-500/30 to-amber-500/30" },
  { emoji: "🎫", text: "Welcome Card", color: "from-orange-500/30 to-amber-500/30" },

  // Community - Rose gradient
  { emoji: "🌐", text: "Online Community", color: "from-rose-500/30 to-pink-500/30" },
  { emoji: "🚀", text: "Startup Events", color: "from-rose-500/30 to-pink-500/30" },
  { emoji: "🎫", text: "Event Tickets", color: "from-rose-500/30 to-pink-500/30" },
  { emoji: "🤝", text: "Team Activities", color: "from-rose-500/30 to-pink-500/30" },

  // Innovation - Violet gradient
  { emoji: "🤖", text: "AI Workshops", color: "from-violet-500/30 to-purple-500/30" },
  { emoji: "🎓", text: "Uni Network", color: "from-violet-500/30 to-purple-500/30" },
  { emoji: "🔗", text: "Startup Hubs", color: "from-violet-500/30 to-purple-500/30" },
  { emoji: "🎯", text: "Free Events", color: "from-violet-500/30 to-purple-500/30" },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const Badge = ({ benefit, index }: { benefit: Benefit; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
               bg-gradient-to-br ${benefit.color} backdrop-blur-sm
               hover:scale-105 transition-all duration-300
               group cursor-default border border-white/20`}
  >
    <span className="text-lg group-hover:scale-110 transition-transform duration-300">
      {benefit.emoji}
    </span>
    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800 whitespace-nowrap">
      {benefit.text}
    </span>
  </motion.div>
);

export function BenefitValues() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shuffledBenefits] = useState(() => shuffleArray(benefits));
  const visibleBenefits = isExpanded ? shuffledBenefits : shuffledBenefits.slice(0, 8);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 justify-center">
        <AnimatePresence mode="sync">
          {visibleBenefits.map((benefit, index) => (
            <Badge key={`${benefit.text}-${index}`} benefit={benefit} index={index} />
          ))}
        </AnimatePresence>
        
        {!isExpanded && (
          <motion.button
            onClick={() => setIsExpanded(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
                     bg-gray-100 hover:bg-gray-200 backdrop-blur-sm 
                     border border-gray-300 text-gray-600
                     hover:text-gray-800 transition-all duration-300
                     text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Mehr anzeigen</span>
            <span className="text-lg">↓</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default BenefitValues;
