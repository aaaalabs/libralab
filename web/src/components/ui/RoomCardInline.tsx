import { Room } from '@/types/room';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { 
  IconRuler, 
  IconStar,
  IconX,
  IconClock,
  IconProgress, 
  IconCalendarTime,
  IconCheck,
  IconArrowsShuffle,
  IconPhoto
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
    // Treat "2025" as backlog/coming soon
    if (room.availableFrom === "2025") {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#979C94]/80 text-white backdrop-blur-sm flex items-center gap-1">
          <IconClock className="w-3 h-3" />
          {currentLanguage === 'de' ? "Demnächst" : "Coming Soon"}
        </span>
      );
    }
    // For specific dates, calculate the progress between kickoff and target date
    const targetDate = new Date(room.availableFrom);
    const formattedDate = targetDate.toLocaleDateString(
      currentLanguage === 'de' ? 'de-DE' : 'en-US', 
      { month: 'short', day: 'numeric', year: 'numeric' }
    );
    
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#4CAF50]/80 text-white backdrop-blur-sm border border-[#4CAF50] flex items-center gap-1">
        <IconCalendarTime className="w-3 h-3" />
        {t('rooms.available_from')} {formattedDate}
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
 * Calculate the progress percentage between kickoff date and availability date
 */
const calculateProgressPercentage = (room: Room): number => {
  // If the room has a specific progress percentage, use that
  if (room.progressPercentage !== undefined) {
    return room.progressPercentage;
  }
  
  // If the room has both kickoff date and available date, calculate progress
  if (room.kickoffDate && room.availableFrom && room.availableFrom !== "2025") {
    const now = new Date();
    const kickoff = new Date(room.kickoffDate);
    const target = new Date(room.availableFrom);
    
    // Calculate total milliseconds and elapsed milliseconds
    const totalTime = target.getTime() - kickoff.getTime();
    const elapsedTime = now.getTime() - kickoff.getTime();
    
    // If the project hasn't started yet
    if (elapsedTime < 0) return 0;
    
    // If the project is past the target date
    if (elapsedTime > totalTime) return 100;
    
    // Calculate percentage
    return Math.round((elapsedTime / totalTime) * 100);
  }
  
  // Default to zero if we can't calculate
  return 0;
};

/**
 * Get color based on progress percentage
 */
const getProgressColor = (percentage: number): string => {
  if (percentage < 30) return 'bg-[#D09467]'; // Copper
  if (percentage < 70) return 'bg-[#D09467]/80 bg-gradient-to-r from-[#D09467] to-[#68B984]'; // Copper to Green
  return 'bg-[#68B984]'; // Green
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
  // Calculate progress for in-progress rooms or rooms with dates
  const [progress, setProgress] = useState<number>(0);
  // Track which image type to show (before/after) for in-progress rooms
  const [showAfterImage, setShowAfterImage] = useState<boolean>(false);
  
  useEffect(() => {
    setProgress(calculateProgressPercentage(room));
    
    // Re-calculate progress every minute to keep it updated
    const interval = setInterval(() => {
      setProgress(calculateProgressPercentage(room));
    }, 60000);
    
    return () => clearInterval(interval);
  }, [room]);
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
      
      {/* Room image with conditional grayscale and before/after toggle */}
      <Image
        src={
          room.status === 'in-progress' && room.imagesBefore && room.imagesAfter && room.imagesAfter.length > 0
            ? showAfterImage 
              ? room.imagesAfter[0] 
              : room.imagesBefore[0]
            : (room.imagesBefore && room.imagesBefore.length > 0) ? room.imagesBefore[0] : room.images[0]
        }
        alt={typeof room.title === 'string' ? room.title : 'Room image'}
        fill
        className={`object-cover transition-transform duration-500 group-hover:scale-105 ${room.status === 'backlog' ? 'grayscale' : ''}`}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      
      {/* Before/After toggle for rooms in progress (only shown when an 'after' image is available) */}
      {room.status === 'in-progress' && room.imagesBefore && room.imagesAfter && room.imagesAfter.length > 0 && (
        <div className="absolute top-4 right-4 z-30">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowAfterImage(!showAfterImage);
            }}
            className="p-2 rounded-full bg-[#2E4555]/70 hover:bg-[#2E4555]/90 backdrop-blur-sm transition-colors"
            title={showAfterImage ? t('rooms.view_before') : t('rooms.view_after')}
          >
            <IconArrowsShuffle className="w-5 h-5 text-white" />
          </button>
          <div className="absolute -right-2 -bottom-8 px-2 py-1 text-xs text-white bg-[#2E4555]/80 rounded-md backdrop-blur-sm">
            {showAfterImage ? 
              (currentLanguage === 'de' ? 'Aktuell' : 'Current') : 
              (currentLanguage === 'de' ? 'Ursprünglich' : 'Original')
            }
          </div>
        </div>
      )}
      
      {/* Room info overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2E4555]/60 text-[#EBDBC3] backdrop-blur-sm">
            {currentLanguage === 'en' ? translateFloorName(room.floor) : room.floor}
          </span>
          {/* Status badge based on room.status */}
          {room.status === 'backlog' && (
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#979C94]/80 text-white backdrop-blur-sm flex items-center gap-1">
              <IconClock className="w-3 h-3" />
              {currentLanguage === 'de' ? "Demnächst" : "Coming Soon"}
            </span>
          )}
          {room.status === 'in-progress' && (
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#D09467]/80 text-white backdrop-blur-sm flex items-center gap-1">
              <IconProgress className="w-3 h-3" />
              {currentLanguage === 'de' ? "In Arbeit" : "In Progress"}
              {room.progressPercentage !== undefined && ` ${room.progressPercentage}%`}
            </span>
          )}
          {(!room.status || room.status === 'completed') && renderRoomStatusBadge(room, currentLanguage, t)}
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
      
      {/* Progress bar for in-progress rooms or rooms with specific available date */}
      {((room.status === 'in-progress' && progress > 0) || (room.availableFrom && room.availableFrom !== "2025" && progress > 0)) && (
        <div className="absolute bottom-16 left-4 right-4 z-20">
          <div className="w-full bg-[#2E4555]/60 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`${getProgressColor(progress)} h-2.5 rounded-full transition-all duration-700 animate-pulse-slow`} 
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
          <div className="text-xs text-[#EBDBC3]/90 mt-1 flex justify-between">
            <span>{currentLanguage === 'de' ? "Fortschritt" : "Progress"}: {progress}%</span>
            {room.kickoffDate && (
              <span>
                {currentLanguage === 'de' ? "Beginn" : "Started"}: {new Date(room.kickoffDate).toLocaleDateString(
                  currentLanguage === 'de' ? 'de-DE' : 'en-US', 
                  { month: 'short', year: 'numeric' }
                )}
              </span>
            )}
          </div>
        </div>
      )}
      
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
            
            {/* Room status badge in detail view */}
            {room.status === 'backlog' && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#979C94]/80 text-white flex items-center gap-1">
                <IconClock className="w-3 h-3" />
                {currentLanguage === 'de' ? "Demnächst" : "Coming Soon"}
              </span>
            )}
            {room.status === 'in-progress' && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#D09467]/80 text-white flex items-center gap-1">
                <IconProgress className="w-3 h-3" />
                {currentLanguage === 'de' ? "In Arbeit" : "In Progress"}
                {room.progressPercentage !== undefined && ` ${room.progressPercentage}%`}
              </span>
            )}
            {room.status === 'completed' && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#4CAF50]/80 text-white flex items-center gap-1">
                <IconCheck className="w-3 h-3" />
                {currentLanguage === 'de' ? "Fertiggestellt" : "Completed"}
              </span>
            )}
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
