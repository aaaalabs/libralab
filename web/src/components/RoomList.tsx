import { Card, Title, Text, Grid } from '@tremor/react';
import { Room } from '../types/dao';
import RoomCard from './RoomCard';

const SAMPLE_ROOMS: Room[] = [
  {
    id: '1',
    number: '101',
    size: 20,
    price: 600,
    available: true,
    amenities: ['Balcony', 'Mountain View'],
    images: [],
  },
  // Add more sample rooms
];

export default function RoomList() {
  return (
    <Card>
      <Title>Available Rooms</Title>
      <Text>Find your perfect space in our community</Text>
      
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4 mt-4">
        {SAMPLE_ROOMS.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </Grid>
    </Card>
  );
}
