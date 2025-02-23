export interface Room {
  id: string;
  title: string;
  description: string;
  size: number;
  price: number;
  deposit: number;
  floor: string;
  available: boolean;
  amenities: string[];
  images: string[];
  rating?: number;
  costRating?: number;
  features: string[];
  availableFrom?: string;
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
