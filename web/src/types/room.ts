export interface Room {
  id: string;
  title: string;
  description: string;
  size: number;
  price: number;
  available: boolean;
  amenities: string[];
  images: string[];
}

export interface RoomApplication {
  roomId: string;
  applicantName: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: Date;
}
