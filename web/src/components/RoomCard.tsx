'use client';

import { Text, Badge } from "@tremor/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { IconWifi, IconMapPin, IconCircleFilled, IconStar, IconCurrencyEuro } from "@tabler/icons-react";

interface RoomCardProps {
  room: {
    id: string;
    title: string;
    description: string;
    size: number;
    price: number;
    floor: number;
    amenities: string[];
    available: boolean;
    images: string[];
    rating?: number;
    costRating?: number;
    features: string[];
  };
  onApply?: (roomId: string) => void;
}

export function RoomCard({ room, onApply }: RoomCardProps) {
  const defaultImage = "/images/rooms/zimmer1.webp";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative aspect-square cursor-zoom-in"
      onClick={(e) => {
        e.stopPropagation();
        onApply?.(room.id);
      }}
    >
      <div className="absolute inset-0 rounded-xl overflow-hidden shadow-lg">
        {room.images[0] ? (
          <Image
            src={room.images[0]}
            alt={room.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Image
            src={defaultImage}
            alt={room.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {/* Gradient Overlay - nur unteres Drittel */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Content der bei Hover ausgeblendet wird */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 z-10 transition-opacity duration-300 group-hover:opacity-0">
          {/* Top Bar */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <IconWifi className="w-4 h-4 text-white" />
              <Text className="text-sm font-medium text-white">1000 Mbps</Text>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 hover:bg-black/60 transition-colors"
            >
              <IconCircleFilled className={`w-4 h-4 ${room.available ? 'text-green-400' : 'text-red-400'}`} />
              <Text className="text-white font-medium">
                {room.available ? 'Noch frei' : 'Reserviert'}
              </Text>
            </motion.div>
          </div>

          {/* Bottom Content */}
          <div>
            <Text className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
              {room.title}
            </Text>
            <div className="flex items-center gap-2 mb-2">
              <IconMapPin className="w-4 h-4 text-white/90" />
              <Text className="text-sm text-white/90">Innsbruck, Austria</Text>
            </div>
            <div className="flex items-baseline gap-1">
              <Text className="text-3xl font-bold text-white drop-shadow-lg">€{room.price}</Text>
              <Text className="text-sm text-white/80">/mo</Text>
            </div>
          </div>
        </div>

        {/* Hover Stats Overlay */}
        <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="p-4 space-y-6">
            {/* Internet Speed */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 w-fit">
              <IconWifi className="w-4 h-4 text-white" />
              <Text className="text-sm font-medium text-white">1000 Mbps</Text>
            </div>

            {/* Stats */}
            <div className="space-y-8">
              {/* Rating Stars */}
              {room.rating !== undefined && (
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, index) => (
                    <IconStar
                      key={index}
                      className={`w-4 h-4 ${
                        index < (room.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Cost Rating */}
              {room.costRating !== undefined && (
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(3)].map((_, index) => (
                    <IconCurrencyEuro
                      key={index}
                      className={`w-4 h-4 ${
                        index < (room.costRating || 0) ? 'text-green-500' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
              
              {/* Size Rating */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <Text className="text-white/90 font-medium text-lg">📏 Size</Text>
                  <Text className="text-white/90 font-medium text-lg">{room.size}m²</Text>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-400 rounded-full transition-all duration-500" 
                    style={{ width: `${(room.size/30) * 100}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2">
              {room.amenities.slice(0, 3).map((amenity) => (
                <Badge 
                  key={amenity}
                  className="bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1.5 font-medium"
                >
                  {amenity}
                </Badge>
              ))}
              {room.amenities.length > 3 && (
                <Badge className="bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1.5 font-medium">
                  +{room.amenities.length - 3}
                </Badge>
              )}
            </div>

            {/* Zoom Icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <IconCircleFilled className="w-12 h-12 text-white/80" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
