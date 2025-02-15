'use client';

import { useState } from 'react';
import { RoomList } from "../components/rooms/RoomList";
import { ApplicationModal } from "../components/rooms/ApplicationModal";
import { useApplications } from "../hooks/useApplications";
import { RoomApplication } from "../types/room";
import { Card, Title, Text } from "@tremor/react";

// Sample data for MVP
const sampleRooms = [
  {
    id: "1",
    title: "Sunny Studio with Mountain View",
    description: "Bright studio apartment with amazing mountain views and modern amenities",
    size: 25,
    price: 800,
    available: true,
    amenities: ["WiFi", "Kitchen", "Balcony"],
    images: ["/rooms/room1.jpg"]
  },
  {
    id: "2",
    title: "Cozy Double Room",
    description: "Comfortable double room with shared kitchen and bathroom",
    size: 20,
    price: 600,
    available: true,
    amenities: ["WiFi", "Shared Kitchen", "Desk"],
    images: ["/rooms/room2.jpg"]
  }
];

export default function Home() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const { submitApplication, isSubmitting, error } = useApplications();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleApply = (roomId: string) => {
    setSelectedRoomId(roomId);
    setSuccessMessage(null);
  };

  const handleCloseModal = () => {
    setSelectedRoomId(null);
    setSuccessMessage(null);
  };

  const handleSubmitApplication = async (application: RoomApplication) => {
    try {
      await submitApplication(application);
      setSuccessMessage('Your application has been submitted successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      handleCloseModal();
    } catch (err) {
      console.error('Failed to submit application:', err);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Title>Welcome to LibraLab</Title>
      <Text className="mt-2">Find your perfect room in our co-living space</Text>

      {error && (
        <Card className="mt-4 bg-red-50 border-red-100">
          <Text className="text-red-700">{error}</Text>
        </Card>
      )}

      {successMessage && (
        <Card className="mt-4 bg-green-50 border-green-100">
          <Text className="text-green-700">{successMessage}</Text>
        </Card>
      )}

      <div className="mt-8">
        <Title className="text-xl">Available Rooms</Title>
        <RoomList rooms={sampleRooms} onApply={handleApply} />
      </div>
      
      <ApplicationModal
        roomId={selectedRoomId || ''}
        isOpen={!!selectedRoomId}
        onClose={handleCloseModal}
        onSubmit={handleSubmitApplication}
      />
    </main>
  );
}
