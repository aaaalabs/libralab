export interface Language {
  id: string;
  code: string;
  name: string;
  isDefault?: boolean;
}

export interface Translation {
  id: string;
  languageId: string;
  key: string;
  value: string;
  context?: string;
  lastUpdated: Date;
}

// Keys for all translatable content
export enum TranslationKey {
  // Founder's Elite Section
  FOUNDERS_ELITE_TITLE = 'founders_elite_title',
  FOUNDERS_ELITE_PRICE_MONTH = 'founders_elite_price_month',
  FOUNDERS_ELITE_SPOTS_LEFT = 'founders_elite_spots_left',
  FOUNDERS_ELITE_VALUE = 'founders_elite_value',
  FOUNDERS_ELITE_READY_BY = 'founders_elite_ready_by',
  FOUNDERS_ELITE_APPLY_NOW = 'founders_elite_apply_now',
  FOUNDERS_ELITE_LOOKING_FOR = 'founders_elite_looking_for',
  
  // Benefits
  BENEFIT_INTERIOR_DESIGN = 'benefit_interior_design',
  BENEFIT_COMMUNITY = 'benefit_community',
  BENEFIT_PRIORITY = 'benefit_priority',
  BENEFIT_AI_CONSULTING = 'benefit_ai_consulting',
  BENEFIT_WORKSPACE = 'benefit_workspace',
  BENEFIT_EVENTS = 'benefit_events',
  BENEFIT_PIONEER = 'benefit_pioneer',
  BENEFIT_PARKING = 'benefit_parking',
  BENEFIT_CLEANING = 'benefit_cleaning',

  // Common
  DEPOSIT = 'deposit',
  MONTH = 'month',
  SPOTS_LEFT = 'spots_left',

  // Header
  LIBRA_INNOVATION_FLEXCO = 'libra_innovation_flexco',
  EPICWG_INNSBRUCK = 'epicwg_innsbruck',
  EPICWG_DESCRIPTION = 'epicwg_description',
  DISCOVER_ROOMS = 'discover_rooms',

  // Early Bird Campaign
  LIMITED_TIME_OFFER = 'limited_time_offer',
  EARLY_BIRD_PRE_BOOKING = 'early_bird_pre_booking',
  EARLY_BIRD_DESCRIPTION = 'early_bird_description',
  CAMPAIGN_ENDS = 'campaign_ends',
  BEST_VALUE = 'best_value',
  OFF_RENT = 'off_rent',
  SOLD_OUT = 'sold_out',
  RESERVE_NOW = 'reserve_now',

  // Sections
  FAQ = 'faq',
  COMMON_AREAS = 'common_areas',
  AVAILABLE_ROOMS = 'available_rooms',

  // Reservation Modal
  CONFIRM_RESERVATION = 'confirm_reservation',
  CONFIRM_RESERVATION_DESCRIPTION = 'confirm_reservation_description',
  CANCEL = 'cancel',
  PROCESSING = 'processing',

  // Footer
  POWERED_BY = 'powered_by',
}

export interface TranslationSet {
  [key: string]: string;
}
