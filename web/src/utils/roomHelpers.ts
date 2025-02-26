import { Room } from '@/types/room';

/**
 * Helper function to translate room titles
 */
export const translateRoomTitle = (title: string): string => {
  const translations: Record<string, string> = {
    "VIP-Platz mit Balkon": "VIP Spot with Balcony",
    "Gemütlich unterm Dach": "Cozy Under the Roof",
    "Großes Eck-Zimmer": "Large Corner Room",
    "Studio mit Aussicht": "Studio with a View",
    "XXL-Format mit Terrasse": "XXL Size with Terrace",
    "Helles Gartenzimmer": "Bright Garden Room", 
    "Clever & Kompakt": "Clever & Compact",
    "Smart Living Studio": "Smart Living Studio",
    "Mini-Apartment": "Mini Apartment",
    "Lichtdurchflutet & Ruhig": "Light-flooded & Quiet"
  };
  
  return translations[title] || title;
};

/**
 * Helper function to translate room features
 */
export const translateRoomFeature = (feature: string): string => {
  const translations: Record<string, string> = {
    "Balkon": "Balcony",
    "Bergblick": "Mountain view",
    "Küche nebenan": "Kitchen nearby",
    "Direkte Küchennähe": "Direct kitchen access",
    "Bergpanorama": "Mountain panorama",
    "Dachschräge": "Sloped ceiling",
    "Gemütlich": "Cozy",
    "Preiswert": "Affordable",
    "Viel Platz": "Spacious",
    "Eckzimmer": "Corner room",
    "Hell": "Bright",
    "Sonnig": "Sunny",
    "Ruhige Lage": "Quiet location",
    "Terrasse": "Terrace",
    "XXL-Format": "XXL size",
    "Gartenzugang": "Garden access",
    "Garten Ausblick": "Garden view",
    "Erdgeschoss": "Ground floor",
    "Kompakt": "Compact",
    "Effizient geschnitten": "Efficiently designed",
    "Smart Furniture": "Smart furniture",
    "Funktional": "Functional",
    "Hochwertige Ausstattung": "High-quality furnishings",
    "Helle Räume": "Bright rooms"
  };
  
  return translations[feature] || feature;
};

/**
 * Helper function to translate floor names
 */
export const translateFloorName = (floor: string): string => {
  const translations: Record<string, string> = {
    "Zimmer 1": "Room 1",
    "Zimmer 2": "Room 2",
    "Zimmer 3": "Room 3",
    "Zimmer 4": "Room 4",
    "Zimmer 5": "Room 5",
    "Zimmer 6": "Room 6",
    "Zimmer 7": "Room 7",
    "Zimmer 8": "Room 8",
    "Zimmer 9": "Room 9",
    "Zimmer 10": "Room 10",
    "Erdgeschoss": "Ground Floor",
    "1. Stock": "1st Floor",
    "Dachgeschoss": "Attic Floor",
    "Untergeschoss": "Basement"
  };
  
  return translations[floor] || floor;
};

/**
 * Helper function to translate room descriptions
 */
export const translateRoomDescription = (description: string): string => {
  const translations: Record<string, string> = {
    "Dein VIP-Platz: Balkon mit Bergkino inklusive und die Küche direkt nebenan – schneller kommst du nicht an deinen morgendlichen Kaffee!": 
      "Your VIP spot: Balcony with mountain cinema included and the kitchen right next door - you can't get to your morning coffee faster!",
    "Gemütlich unterm Dach: Die Schräge macht's schräg, aber der Preis macht alles wieder gerade. Sparfüchse, greift zu!": 
      "Cozy under the roof: The slope makes it quirky, but the price makes everything straight again. Bargain hunters, grab it!"
  };
  
  return translations[description] || description;
};
