import { Card, Text, Badge, Button } from "@tremor/react";
import { Room } from "../../types/room";
import Image from "next/image";

interface RoomCardProps {
  room: Room;
  onApply: (roomId: string) => void;
}

export function RoomCard({ room, onApply }: RoomCardProps) {
  return (
    <Card className="max-w-sm mx-auto">
      <div className="relative h-48 mb-4">
        {room.images[0] && (
          <Image
            src={room.images[0]}
            alt={room.title}
            fill
            className="rounded-lg object-cover"
          />
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Text className="font-bold">{room.title}</Text>
          <Badge color={room.available ? "green" : "red"}>
            {room.available ? "Available" : "Occupied"}
          </Badge>
        </div>
        
        <Text>{room.description}</Text>
        
        <div className="flex justify-between items-center mt-4">
          <Text className="font-semibold">€{room.price}/month</Text>
          <Text>{room.size}m²</Text>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {room.amenities.map((amenity) => (
            <Badge key={amenity} color="blue">
              {amenity}
            </Badge>
          ))}
        </div>

        <Button 
          className="w-full mt-4"
          onClick={() => onApply(room.id)}
          disabled={!room.available}
        >
          Apply Now
        </Button>
      </div>
    </Card>
  );
}
