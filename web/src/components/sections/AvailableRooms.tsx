import { Room } from '@/types/room';
import { adaptRoomsArray } from '@/utils/roomAdapter';
import { RoomCardInline } from '@/components/ui/RoomCardInline';

interface AvailableRoomsProps {
  rooms: any[]; // Accept any[] to handle epicwgData.rooms
  currentLanguage: string;
  t: any;
  activeRoomId: string | null;
  toggleRoomDetail: (roomId: string) => void;
  handleApplyForRoom: (room: Room) => void;
}

/**
 * Displays a grid of all available rooms
 */
export function AvailableRooms({ 
  rooms, 
  currentLanguage, 
  t, 
  activeRoomId, 
  toggleRoomDetail, 
  handleApplyForRoom 
}: AvailableRoomsProps) {
  const typedRooms = adaptRoomsArray(rooms);
  
  return (
    <section id="available-rooms" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#2E4555] mb-2">{t('all_available_space')}</h2>
            <p className="text-gray-600">{t('choose_room')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {typedRooms.map((room, index) => (
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
    </section>
  );
}
