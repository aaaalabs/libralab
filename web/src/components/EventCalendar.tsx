import { Card, Title, Text, Grid } from '@tremor/react';
import { Event } from '../types/dao';

const SAMPLE_EVENTS: Event[] = [
  {
    id: '1',
    title: 'AI Workshop',
    description: 'Introduction to Large Language Models',
    date: new Date('2025-02-20'),
    location: 'Co-Working Space',
    organizer: '0x123...',
    participants: [],
    type: 'workshop',
  },
  {
    id: '2',
    title: 'Community Dinner',
    description: 'Monthly community gathering',
    date: new Date('2025-02-25'),
    location: 'Common Kitchen',
    organizer: '0x456...',
    participants: [],
    type: 'social',
  },
];

function EventCard({ event }: { event: Event }) {
  return (
    <Card>
      <Title>{event.title}</Title>
      <Text>{event.description}</Text>
      <div className="mt-4">
        <Text>📅 {event.date.toLocaleDateString()}</Text>
        <Text>📍 {event.location}</Text>
      </div>
      <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">
        Join Event
      </button>
    </Card>
  );
}

export default function EventCalendar() {
  return (
    <Card>
      <Title>Upcoming Events</Title>
      <Text>Join our community activities</Text>
      
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4 mt-4">
        {SAMPLE_EVENTS.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </Grid>
    </Card>
  );
}
