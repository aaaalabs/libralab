'use client';

import { Text, Badge } from "@tremor/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { IconMapPin, IconCircleFilled, IconStar, IconCurrencyEuro, IconZoomIn, IconRuler } from "@tabler/icons-react";

interface RoomCardProps {
  room: {
    id: string;
    title: string;
    description: string;
    size: number;
    price: number;
    floor: string;
    amenities: string[];
    available: boolean;
    availableFrom?: string;
    images: string[];
    rating?: number;
    costRating?: number;
    features: string[];
  };
  onSelect?: () => void;
  onApply?: (roomId: string) => void;
}

const getLocationDescription = (room: RoomCardProps['room']) => {
  let location = room.floor;

  // Add additional context based on room features or title
  if (room.features?.some(f => f.toLowerCase().includes('küche'))) {
    location += ' • Nahe Küche';
  }
  if (room.features?.some(f => f.toLowerCase().includes('coworking'))) {
    location += ' • Nahe Co-working';
  }

  return location;
};

export function RoomCard({ room, onSelect, onApply }: RoomCardProps) {
  const defaultImage = "/images/rooms/zimmer1.webp";

  // Format the date if available
  const formatAvailableDate = (date?: string) => {
    if (!date) return "Available";
    const formattedDate = new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return `Available from ${formattedDate}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative aspect-square cursor-zoom-in"
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
        onApply?.(room.id);
      }}
    >
      <div className="absolute inset-0 rounded-xl overflow-hidden shadow-lg">
        {room.images[0] ? (
          <Image
            src={room.images[0]}
            alt={room.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Image
            src={defaultImage}
            alt={room.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Front Side Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 z-10 transition-opacity duration-300 group-hover:opacity-0">
          {/* Top Bar */}
          <div className="flex justify-end items-start">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 hover:bg-black/60 transition-colors"
            >
              <IconCircleFilled className={`w-4 h-4 ${room.available ? 'text-green-400' : 'text-red-400'}`} />
              <Text className="text-white font-medium">
                {room.available ? formatAvailableDate(room.availableFrom) : 'Booked'}
              </Text>
            </motion.div>
          </div>

          {/* Bottom Content */}
          <div className="z-20">
            <Text className="!text-3xl !font-bold !text-white mb-2 !drop-shadow-lg">
              {room.title}
            </Text>
            <div className="flex items-center gap-2 mb-3">
              <IconMapPin className="w-4 h-4 text-white/90" />
              <Text className="text-sm text-white/90">{getLocationDescription(room)}</Text>
            </div>
            <div className="flex items-baseline gap-1">
              <Text className="!text-5xl !font-bold !text-white !drop-shadow-lg">€{room.price}</Text>
              <Text className="text-sm text-white/80">/mo</Text>
            </div>
          </div>
        </div>

        {/* Back Side Content */}
        <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="h-full p-4 flex flex-col justify-center">
            {/* Stats */}
            <div className="space-y-8">
              {/* Overall Rating */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <IconStar className="w-5 h-5 text-yellow-400" />
                  <Text className="text-white/90 font-medium">Overall</Text>
                  <Text className="text-white/90 ml-auto">{room.rating}/10</Text>
                </div>
                <div className="h-8 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500" 
                    style={{ width: `${(room.rating || 0) * 10}%` }} 
                  />
                </div>
              </div>

              {/* Cost Rating */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <IconCurrencyEuro className="w-5 h-5 text-green-500" />
                  <Text className="text-white/90 font-medium">Cost</Text>
                  <Text className="text-white/90 ml-auto">{room.costRating}/10</Text>
                </div>
                <div className="h-8 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500" 
                    style={{ width: `${(room.costRating || 0) * 10}%` }} 
                  />
                </div>
              </div>
              
              {/* Size Rating */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <IconRuler className="w-5 h-5 text-blue-400" />
                  <Text className="text-white/90 font-medium">Size</Text>
                  <Text className="text-white/90 ml-auto">{room.size}m²</Text>
                </div>
                <div className="h-8 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-400 rounded-full transition-all duration-500" 
                    style={{ width: `${(room.size/30) * 100}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mt-8">
              {room.amenities.map((amenity) => (
                <Badge 
                  key={amenity}
                  className="bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1.5 font-medium"
                >
                  {amenity}
                </Badge>
              ))}
            </div>

            {/* Zoom Icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <IconZoomIn className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
