import { Room } from '@/types/room';

/**
 * Adapts a single room data object to match the Room interface
 * Handles inconsistencies in the data structure, particularly with the features property
 */
export function adaptRoomData(roomData: any): Room {
  return {
    ...roomData,
    title: roomData.title, 
    description: roomData.description,
    features: Array.isArray(roomData.features) 
      ? roomData.features.map((f: any) => 
          typeof f === 'string' ? f : (f.title || f.en || '')
        )
      : []
  };
}

/**
 * Adapts an array of room data objects to match the Room[] type
 */
export function adaptRoomsArray(roomsData: any[]): Room[] {
  return roomsData.map(adaptRoomData);
}
