import { Card, Text, Metric, Badge } from '@tremor/react';
import { Room } from '../types/dao';

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  return (
    <Card>
      <div className="flex justify-between">
        <Text>Room {room.number}</Text>
        <Badge color={room.available ? 'green' : 'red'}>
          {room.available ? 'Available' : 'Occupied'}
        </Badge>
      </div>
      
      <Metric>€{room.price}/month</Metric>
      
      <Text className="mt-2">{room.size}m²</Text>
      
      <div className="mt-4">
        {room.amenities.map((amenity) => (
          <Badge key={amenity} color="blue" className="mr-2">
            {amenity}
          </Badge>
        ))}
      </div>
      
      {room.available && (
        <button className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded">
          Apply Now
        </button>
      )}
    </Card>
  );
}
