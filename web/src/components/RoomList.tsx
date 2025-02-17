import { Grid, Title, Card } from "@tremor/react";
import { RoomCard } from "./RoomCard";
import { Room } from "../types/room";

interface RoomListProps {
  rooms: Room[];
  onApply: (roomId: string) => void;
}

function getFloorName(floor: number): string {
  switch (floor) {
    case -1:
      return "Keller";
    case 0:
      return "Erdgeschoss";
    case 1:
      return "Dachgeschoss";
    default:
      return `${floor}. Stock`;
  }
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
  }, {} as Record<number, Room[]>);

  // Sortiere Stockwerke von oben nach unten
  const sortedFloors = Object.keys(roomsByFloor)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="space-y-8">
      {sortedFloors.map((floor) => (
        <Card key={floor} className="p-4">
          <Title className="mb-4">{getFloorName(floor)}</Title>
          <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
            {roomsByFloor[floor].map((room) => (
              <div key={room.id} className="!cursor-zoom-in">
                <RoomCard room={room} onApply={onApply} />
              </div>
            ))}
          </Grid>
        </Card>
      ))}
    </div>
  );
}
