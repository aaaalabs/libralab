'use client';

import React from 'react';
import { Card, Title, Text, TextInput, Button, Badge } from "@tremor/react";
import { Room } from "../../types/room";

interface ApplicationModalProps {
  room: Room;
  onClose: () => void;
}

export function ApplicationModal({ room, onClose }: ApplicationModalProps) {
  const [formData, setFormData] = React.useState({
    applicantName: '',
    email: '',
    phone: '',
    message: '',
    occupation: '',
    moveInDate: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: room.id,
          ...formData,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Senden der Bewerbung');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <Title className="mb-4">Bewerbung erfolgreich!</Title>
          <Text>
            Vielen Dank für deine Bewerbung für das Zimmer "{room.title}". 
            Wir werden uns schnellstmöglich bei dir melden.
          </Text>
          <Button className="mt-4 w-full" onClick={onClose}>
            Schließen
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title>Bewerbung für {room.title}</Title>
            <Text className="mt-1">
              {room.size}m² • {room.price}€/Monat
            </Text>
          </div>
          <Button variant="secondary" onClick={onClose}>
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text>Name</Text>
              <TextInput
                name="applicantName"
                value={formData.applicantName}
                onChange={handleChange}
                placeholder="Dein vollständiger Name"
                required
              />
            </div>
            <div>
              <Text>E-Mail</Text>
              <TextInput
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="deine@email.com"
                required
              />
            </div>
            <div>
              <Text>Telefon</Text>
              <TextInput
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+49 123 45678"
                required
              />
            </div>
            <div>
              <Text>Beruf/Beschäftigung</Text>
              <TextInput
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="Student, Berufstätig, etc."
                required
              />
            </div>
          </div>

          <div>
            <Text>Gewünschtes Einzugsdatum</Text>
            <input
              name="moveInDate"
              type="date"
              value={formData.moveInDate}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <Text>Nachricht</Text>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Erzähle uns etwas über dich und warum du gerne hier einziehen möchtest..."
              className="w-full p-2 border rounded-lg"
              rows={4}
              required
            />
          </div>

          {error && (
            <Badge color="red" className="w-full">
              {error}
            </Badge>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Wird gesendet...' : 'Bewerbung absenden'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
