export interface Room {
  id: string;
  title: string | { en: string; de: string };
  description: string | { en: string; de: string };
  size: number;
  price: number;
  deposit: number;
  floor: string;
  roomNumber?: number;
  available: boolean;
  amenities: string[];
  images: string[];
  // Before and after images for rooms in progress
  imagesBefore?: string[];
  imagesAfter?: string[];
  rating?: number;
  costRating?: number;
  features: string[] | { title: string; icon?: string }[];
  availableFrom?: string;
  availableNow?: boolean;
  tag?: string;
  
  // New fields for room status visualization
  status?: 'backlog' | 'in-progress' | 'completed'; // Default is 'completed' if not specified
  progressPercentage?: number; // Only relevant for status 'in-progress'
  kickoffDate?: string; // Date when renovation/preparation started
}

export interface RoomApplication {
  roomId: string;
  applicantName: string;
  email: string;
  phone: string;
  message: string;
  occupation: string;
  moveInDate: string;
  submittedAt: string;
}
