import { useState } from 'react';
import { Card, Text, TextInput, Textarea, Button } from '@tremor/react';
import { RoomApplication } from '../../types/room';

interface ApplicationModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (application: RoomApplication) => void;
}

export function ApplicationModal({ roomId, isOpen, onClose, onSubmit }: ApplicationModalProps) {
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const application: RoomApplication = {
      roomId,
      ...formData,
      submittedAt: new Date()
    };
    onSubmit(application);
    // Reset form
    setFormData({
      applicantName: '',
      email: '',
      phone: '',
      message: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center">
            <Text className="text-xl font-bold">Apply for Room</Text>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          
          <div>
            <Text>Name</Text>
            <TextInput
              placeholder="Your full name"
              value={formData.applicantName}
              onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
              required
              maxLength={100}
            />
          </div>

          <div>
            <Text>Email</Text>
            <TextInput
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              maxLength={100}
            />
          </div>

          <div>
            <Text>Phone</Text>
            <TextInput
              type="tel"
              placeholder="+43 123 456789"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              maxLength={20}
            />
          </div>

          <div>
            <Text>Message</Text>
            <Textarea
              placeholder="Tell us a bit about yourself..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              maxLength={1000}
            />
            <Text className="text-xs text-gray-500 mt-1">
              {formData.message.length}/1000 characters
            </Text>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit">
              Submit Application
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
