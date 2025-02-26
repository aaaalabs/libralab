import { Room } from '@/types/room';
import { adaptRoomsArray } from '@/utils/roomAdapter';
import Link from 'next/link';
import { IconArrowRight } from '@tabler/icons-react';
import { RoomCardInline } from '@/components/ui/RoomCardInline';

interface FeaturedRoomsProps {
  rooms: any[]; // Accept any[] to handle epicwgData.rooms
  currentLanguage: string;
  t: any;
  activeRoomId: string | null;
  toggleRoomDetail: (roomId: string) => void;
  handleApplyForRoom: (room: Room) => void;
  featuredRoomNumbers?: number[];
}

/**
 * Displays a grid of featured rooms
 */
export function FeaturedRooms({ 
  rooms, 
  currentLanguage, 
  t, 
  activeRoomId, 
  toggleRoomDetail, 
  handleApplyForRoom,
  featuredRoomNumbers = [1, 4, 5] // Default featured room numbers
}: FeaturedRoomsProps) {
  const typedRooms = adaptRoomsArray(rooms);
  const filteredRooms = typedRooms.filter(room => featuredRoomNumbers.includes(room.roomNumber || 0));
  
  return (
    <div className="py-16 px-6 sm:px-8 md:px-12 lg:px-16 bg-gradient-to-b from-white to-[#EBDBC3]/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-[#2E4555]">{t('featured_spaces')}</h2>
            <p className="text-[#979C94]">{t('handpicked_rooms')}</p>
          </div>
          <Link
            href="#rooms"
            className="text-[#D09467] hover:text-[#E1B588] font-medium flex items-center gap-2 transition-colors duration-300"
          >
            {t('view_all_spaces')}
            <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room, index) => (
            <RoomCardInline 
              key={room.id} 
              room={room} 
              index={index} 
              currentLanguage={currentLanguage} 
              t={t} 
              activeRoomId={activeRoomId} 
              toggleRoomDetail={toggleRoomDetail} 
              handleApplyForRoom={handleApplyForRoom} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
