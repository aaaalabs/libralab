export interface TierSlot {
  id: string;
  tierId: string;
  maxSlots: number;
  usedSlots: number;
  remainingSlots: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tier {
  id: string;
  name: string;
  price: number;
  maxSlots: number;
  benefits: string[];
  description: string;
  isPopular?: boolean;
  discount?: number;
  remainingSlots: number;
}

export interface EarlyBirdCampaign {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goal: number;
  currentAmount: number;
  tiers: Tier[];
}
