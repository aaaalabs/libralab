'use client';

import { useState, useEffect } from 'react';
import { RoomList } from "../components/RoomList";
import { Card, Title, Text, Grid, Metric, Badge } from "@tremor/react";

interface Room {
  id: string;
  title: string;
  description: string;
  size: number;
  price: number;
  floor: number;
  available: boolean;
  amenities: string[];
  images: string[];
}

interface CommonArea {
  id: string;
  title: string;
  description: string;
  features: string[];
  type: string;
  floor: number;
  size: number;
  images: string[];
}

interface Location {
  description: string;
  highlights: string[];
  address: string;
  images: string[];
}

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [commonAreas, setCommonAreas] = useState<CommonArea[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [roomsRes, areasRes, locationRes] = await Promise.all([
          fetch('/api/rooms'),
          fetch('/api/common-areas'),
          fetch('/api/location')
        ]);

        const roomsData = await roomsRes.json();
        const areasData = await areasRes.json();
        const locationData = await locationRes.json();

        setRooms(roomsData.rooms);
        setCommonAreas(areasData.commonAreas);
        setLocation(locationData.location);
      } catch (err) {
        setError('Fehler beim Laden der Daten');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleApply = async (roomId: string) => {
    // TODO: Implement application modal
    console.log('Applying for room:', roomId);
  };

  if (loading) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Card>
          <Text>Lädt...</Text>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Card>
          <Text color="red">{error}</Text>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      {/* Hero Section */}
      <Card className="mb-8">
        <Title>Willkommen bei EpicWG in Omes</Title>
        <Text className="mt-2">
          {location?.description}
        </Text>
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4 mt-4">
          {location?.highlights.map((highlight, index) => (
            <Card key={index} decoration="top" decorationColor="blue">
              <Text>{highlight}</Text>
            </Card>
          ))}
        </Grid>
      </Card>

      {/* Gemeinschaftsbereiche */}
      <Card className="mb-8">
        <Title className="mb-4">Gemeinschaftsbereiche</Title>
        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
          {commonAreas.map((area) => (
            <Card key={area.id} decoration="left" decorationColor="green">
              <Title className="text-lg">{area.title}</Title>
              <Text className="mt-2">{area.description}</Text>
              <div className="mt-4 space-y-2">
                <Text className="text-sm text-gray-500">
                  {area.size}m² • {area.type}
                </Text>
                <div className="flex flex-wrap gap-2">
                  {area.features.map((feature, index) => (
                    <Badge key={index} color="blue">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </Grid>
      </Card>

      {/* Verfügbare Zimmer */}
      <Card>
        <Title className="mb-4">Verfügbare Zimmer</Title>
        <RoomList rooms={rooms} onApply={handleApply} />
      </Card>
    </main>
  );
}
