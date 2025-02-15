import { useState } from 'react';
import { RoomApplication } from '../types/room';

interface ApiResponse {
  success: boolean;
  application?: RoomApplication;
  error?: string;
}

export function useApplications() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitApplication = async (application: RoomApplication) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(application),
      });

      const data = await response.json() as ApiResponse;

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitApplication,
    isSubmitting,
    error,
  };
}
