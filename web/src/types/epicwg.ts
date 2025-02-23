import epicwgData from '../data/epicwg.json';

export type EpicWGData = typeof epicwgData;

export interface Location {
  description: string;
  highlights: string[];
  address: string;
  images: string[];
  features: {
    grundstueck: {
      flaeche: number;
      typ: string;
      besonderheiten: string[];
    };
    gebaeude: {
      baujahr: number;
      zustand: string;
      bauweise: string;
      energieausweis: {
        typ: string;
        kennwert: string;
        klasse: string;
      };
      heizung: {
        typ: string;
        energietraeger: string;
      };
    };
    ausstattung: string[];
  };
  infrastruktur: {
    entfernungen: {
      [key: string]: string;
    };
    oepnv: {
      [key: string]: string;
    };
  };
}

export interface Room {
  id: string;
  title: string;
  description: string;
  images: string[];
  features: string[];
  type: string;
  floor: number;
  isSpecial?: boolean;
  included: boolean;
  rating: number;
  size: number;
  price: number;
  deposit: number;
  availability: string;
}

export interface CommonArea {
  id: string;
  title: string;
  description: string;
  images: string[];
  features: string[];
  type: string;
  floor: number;
  isSpecial?: boolean;
  included: boolean;
  rating: number;
}

export interface Tier {
  id: string;
  title: string;
  price: number;
  deposit: number;
  maxSlots: number;
  remainingSlots: number;
  discount: number;
  description: string;
  heroFeatures: string[];
  benefits: string[];
  availableNow: boolean;
  tag: string;
}

export interface Upsell {
  id: string;
  title: string;
  price: number;
  perks: string[];
  availableFor: string[];
}

export interface FutureAmenity {
  title: string;
  date: string;
  description: string;
  previewImage: string;
}

export interface EarlyBirdCampaign {
  goal: number;
  currentAmount: number;
  endDate: string;
  startDate: string;
  tiers: Tier[];
  upsells: Upsell[];
  futureAmenities: FutureAmenity[];
}

export interface FAQ {
  question: string;
  answer: string;
}
