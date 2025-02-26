import { Room } from '@/types/room';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  IconRuler, 
  IconStar,
  IconX 
} from '@tabler/icons-react';
import { translateFloorName, translateRoomFeature, translateRoomTitle, translateRoomDescription } from '@/utils/roomHelpers';

interface RoomCardInlineProps {
  room: Room;
  index: number;
  currentLanguage: string;
  t: any;
  activeRoomId: string | null;
  toggleRoomDetail: (roomId: string) => void;
  handleApplyForRoom: (room: Room) => void;
}

// Helper functions for room cards
const renderRoomStatusBadge = (room: Room, currentLanguage: string, t: any) => {
  if (room.available) {
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#D09467]/80 text-white backdrop-blur-sm">
        {t('rooms.available_now')}
      </span>
    );
  } else if (room.availableFrom) {
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#979C94]/80 text-white backdrop-blur-sm">
        {t('rooms.available_from')} {new Date(room.availableFrom).toLocaleDateString(
          currentLanguage === 'de' ? 'de-DE' : 'en-US', 
          { month: 'short', day: 'numeric', year: 'numeric' }
        )}
      </span>
    );
  }
  return null;
};

const renderRoomTitle = (room: Room, currentLanguage: string) => {
  return typeof room.title === 'object' 
    ? room.title[currentLanguage as 'en' | 'de'] 
    : currentLanguage === 'en' ? translateRoomTitle(room.title) : room.title;
};

const renderRoomDescription = (room: Room, currentLanguage: string) => {
  return typeof room.description === 'object' 
    ? room.description[currentLanguage as 'en' | 'de'] 
    : currentLanguage === 'en' ? translateRoomDescription(room.description) : room.description;
};

const renderRoomFeature = (feature: string | Record<string, string>, currentLanguage: string) => {
  return typeof feature === 'object' 
    ? feature[currentLanguage as 'en' | 'de'] 
    : currentLanguage === 'en' ? translateRoomFeature(feature) : feature;
};

/**
 * Room card component (for inline use)
 */
export function RoomCardInline({ 
  room, 
  index, 
  currentLanguage, 
  t, 
  activeRoomId, 
  toggleRoomDetail, 
  handleApplyForRoom 
}: RoomCardInlineProps) {
  return (
    <motion.div
      key={room.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="relative aspect-square rounded-xl overflow-hidden group"
    >
      {/* Overlay gradients */}
      <div className="absolute inset-0 bg-black/20 z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#2E4555]/80 to-transparent z-10"></div>
      
      {/* Room image */}
      <Image
        src={room.images[0]}
        alt={typeof room.title === 'string' ? room.title : 'Room image'}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      
      {/* Room info overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2E4555]/60 text-[#EBDBC3] backdrop-blur-sm">
            {currentLanguage === 'en' ? translateFloorName(room.floor) : room.floor}
          </span>
          {renderRoomStatusBadge(room, currentLanguage, t)}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {renderRoomTitle(room, currentLanguage)}
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-[#EBDBC3]/90 text-sm flex items-center gap-1">
            <IconRuler className="w-4 h-4" />
            {room.size}m²
          </span>
          {/* Room-specific highlight */}
          {room.features.slice(0, 1).map((feature, idx) => (
            <span key={idx} className="text-[#EBDBC3]/90 text-sm flex items-center gap-1">
              <IconStar className="w-4 h-4" />
              {renderRoomFeature(feature, currentLanguage)}
            </span>
          ))}
        </div>
      </div>
      
      {/* Bottom actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex justify-between items-center">
        <div className="text-white font-medium backdrop-blur-sm bg-[#2E4555]/30 px-3 py-1.5 rounded-full">
          €{room.price}<span className="text-[#EBDBC3]/80">{t('rooms.per_month')}</span>
        </div>
        <button 
          onClick={() => toggleRoomDetail(room.id)}
          className="text-white backdrop-blur-sm bg-[#D09467]/70 hover:bg-[#D09467]/90 transition-colors px-4 py-1.5 rounded-full font-medium cursor-pointer"
        >
          {t('rooms.view_details')}
        </button>
      </div>
      
      {/* Room Detail Overlay */}
      <div 
        className={`absolute inset-0 bg-[#2E4555]/95 z-30 p-6 transition-all duration-300 flex flex-col overflow-y-auto ${
          activeRoomId === room.id ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button 
          onClick={() => toggleRoomDetail(room.id)} 
          className="absolute top-4 right-4 text-white hover:text-[#D09467] transition-colors z-40"
        >
          <IconX className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col h-full overflow-y-auto">
          <h3 className="text-2xl font-bold text-white mb-4">
            {renderRoomTitle(room, currentLanguage)}
          </h3>
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#D09467]/80 text-white">
              {currentLanguage === 'en' ? translateFloorName(room.floor) : room.floor}
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2E4555]/60 text-[#EBDBC3]">
              {room.size}m²
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2E4555]/60 text-[#EBDBC3]">
              €{room.price}{t('rooms.per_month')}
            </span>
          </div>
          
          <p className="text-[#EBDBC3] mb-4">
            {renderRoomDescription(room, currentLanguage)}
          </p>
          
          <div className="mb-4">
            <h4 className="text-white font-medium mb-2">{t('rooms.features')}</h4>
            <div className="flex flex-wrap gap-2">
              {room.features.map((feature, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2E4555]/60 text-[#EBDBC3] flex items-center gap-1">
                  <IconStar className="w-4 h-4" />
                  {renderRoomFeature(feature, currentLanguage)}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-auto pt-4">
            <button 
              onClick={() => handleApplyForRoom(room)}
              className="w-full bg-[#D09467] hover:bg-[#D09467]/80 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {t('hero.apply_now')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
