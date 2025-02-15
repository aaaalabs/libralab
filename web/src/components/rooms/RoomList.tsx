import { Grid } from "@tremor/react";
import { RoomCard } from "./RoomCard";
import { Room } from "../../types/room";

interface RoomListProps {
  rooms: Room[];
  onApply: (roomId: string) => void;
}

export function RoomList({ rooms, onApply }: RoomListProps) {
  return (
    <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onApply={onApply} />
      ))}
    </Grid>
  );
}
