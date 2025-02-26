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
  rating?: number;
  costRating?: number;
  features: string[] | { title: string; icon?: string }[];
  availableFrom?: string;
  availableNow?: boolean;
  tag?: string;
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
