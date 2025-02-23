import { Grid, Title, Card } from "@tremor/react";
import { RoomCard } from "./RoomCard";
import { Room } from "../types/room";

interface RoomListProps {
  rooms: Room[];
  onApply: (roomId: string) => void;
}

type FloorType = "Dachgeschoß" | "Erdgeschoß" | "Untergeschoß";

const floorOrder: Record<FloorType, number> = {
  "Dachgeschoß": 2,
  "Erdgeschoß": 1,
  "Untergeschoß": 0
};

function getFloorName(floor: string): string {
  return floor;
}

export function RoomList({ rooms, onApply }: RoomListProps) {
  // Gruppiere Zimmer nach Stockwerk
  const roomsByFloor = rooms.reduce((acc, room) => {
    const floor = room.floor;
    if (!acc[floor]) {
      acc[floor] = [];
    }
    acc[floor].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  // Sortiere Stockwerke von oben nach unten
  const sortedFloors = Object.keys(roomsByFloor)
    .sort((a, b) => {
      const orderA = floorOrder[a as FloorType] ?? -1;
      const orderB = floorOrder[b as FloorType] ?? -1;
      return orderB - orderA;
    });

  return (
    <div className="space-y-8">
      {sortedFloors.map((floor) => (
        <Card key={floor} className="p-4">
          <Title className="mb-4">{getFloorName(floor)}</Title>
          <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
            {roomsByFloor[floor].map((room) => (
              <div key={room.id} className="!cursor-zoom-in">
                <RoomCard room={{ ...room, features: Array.isArray(room.features) ? room.features : [] }} onApply={onApply} />
              </div>
            ))}
          </Grid>
        </Card>
      ))}
    </div>
  );
}
