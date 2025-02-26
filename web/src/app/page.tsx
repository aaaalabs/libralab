'use client';

// Start IMPORTS COMPONENT
import { useState } from 'react';
import { useCampaign } from '../context/CampaignContext';
import { Card, Text, Metric, Button, Badge, Title, AreaChart, DonutChart, BarList, Color } from "@tremor/react";
import { LanguagePicker } from "../components/ui/language-picker";
import { Room } from "../types/room";
import { ApplicationForm } from "../components/application/ApplicationForm";
import Image from "next/image";
import Link from "next/link";
import { 
  IconMapPin, 
  IconWifi,
  IconMountain, 
  IconTrain, 
  IconBuildingCommunity, 
  IconDeviceLaptop, 
  IconUsers,
  IconChartBar, 
  IconHome, 
  IconBrandGithub, 
  IconBrandDiscord, 
  IconBrandInstagram, 
  IconChevronDown, 
  IconChevronUp, 
  IconChevronRight,
  IconBrain,
  IconCar,
  IconCalendarEvent,
  IconRuler,
  IconSearch,
  IconArrowRight,
  IconCode,
  IconRocket,
  IconServer,
  IconStar,
  IconCoffee,
  IconBath,
  IconStairs,
  IconExternalLink,
  IconMap,
  IconPlayerPlay,
  IconArrowDown,
  IconCalendar,
  IconX
} from '@tabler/icons-react';
import epicwgData from '../data/epicwg.json';
import { BentoCard, BentoGrid } from "../components/ui/bento-grid";
import { motion, AnimatePresence } from "framer-motion";
import { IconButton } from "../components/ui/icon-button";
import { useToast } from "../components/ui/use-toast";
import { useTranslation } from '@/context/TranslationContext';
import { TranslationKeys } from '@/types/i18n';
import { AiFaq } from '@/components/AiFaq';
import { VideoBackground } from "../components/ui/video-background";
import { FeatureSection } from '@/components/features/FeatureSection';
import { features } from '@/data/features';
import { ApplyNowSection } from '@/components/application/ApplyNowSection';
import { VideoPlayer } from "../components/ui/video-player";
import { Footer } from "../components/layout/Footer";
import { TopNav } from '@/components/navigation/TopNav';
import { AnimatedHero } from "@/components/hero/AnimatedHero";
// End IMPORTS COMPONENT

// Start ANIMATION VARIANTS COMPONENT
// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};
// End ANIMATION VARIANTS COMPONENT

// Start DATA COMPONENT
const aiTrends = [
  { label: "#MultimodalAI", color: "bg-indigo-500" },
  { label: "#AIAgents", color: "bg-purple-500" },
  { label: "#GenAI", color: "bg-blue-500" },
  { label: "#FutureOfWork", color: "bg-pink-500" },
  { label: "#AIInnovation", color: "bg-cyan-500" }
];

const techStack = [
  { name: 'TypeScript', color: 'blue' },
  { name: 'React', color: 'cyan' },
  { name: 'Next.js', color: 'gray' },
  { name: 'Node.js', color: 'green' },
  { name: 'Python', color: 'yellow' },
] as const;

const socialLinks = [
  { name: 'GitHub', icon: IconBrandGithub, url: 'https://github.com/epicwg' },
  { name: 'Discord', icon: IconBrandDiscord, url: 'https://discord.gg/epicwg' },
  { name: 'Instagram', icon: IconBrandInstagram, url: 'https://instagram.com/epicwg' },
];

// Community Stats
const communityStats = [
  { 
    name: 'Tech Talks & Workshops',
    value: '24+',
    description: 'Monthly AI research presentations and hands-on workshops',
    icon: IconCalendarEvent
  },
  { 
    name: 'Tech Professionals',
    value: '30+',
    description: 'Active community members working in AI and tech',
    icon: IconUsers
  },
  { 
    name: 'Side Projects',
    value: '50+',
    description: 'Collaborative projects launched by our community',
    icon: IconCode
  },
  { 
    name: 'Startup Exits',
    value: '5+',
    description: 'Successful ventures founded by community members',
    icon: IconRocket
  },
];

// Feature data represents our core offerings
const featureData = [
  {
    Icon: IconDeviceLaptop,
    name: "Remote Work Ready",
    description: "High-speed internet, dedicated workspaces, and a productive atmosphere for focused work.",
    href: "#workspaces",
    cta: "View workspaces"
  },
  {
    Icon: IconBrain,
    name: "AI Innovation",
    description: "Access to cutting-edge AI tools and regular tech workshops to stay ahead.",
    href: "#ai-tools",
    cta: "Explore AI tools"
  },
  {
    Icon: IconUsers,
    name: "Tech Community",
    description: "Join a vibrant community of tech enthusiasts, founders, and innovators.",
    href: "#community",
    cta: "Meet the community"
  },
  {
    Icon: IconBuildingCommunity,
    name: "Living Space",
    description: "Modern, comfortable living spaces designed for tech professionals.",
    href: "#rooms",
    cta: "View rooms"
  },
  {
    Icon: IconCar,
    name: "Mobility",
    description: "Eco-friendly E-Trike sharing and excellent public transport connections.",
    href: "#mobility",
    cta: "Learn more"
  },
  {
    Icon: IconCalendarEvent,
    name: "Events",
    description: "Regular tech talks, networking events, and founder meetups.",
    href: "#events",
    cta: "View calendar"
  },
];
// End DATA COMPONENT

// Start TYPES COMPONENT
type Tier = {
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
};
// End TYPES COMPONENT

// Helper function to translate room titles
const translateRoomTitle = (title: string): string => {
  const translations: Record<string, string> = {
    "VIP-Platz mit Balkon": "VIP Spot with Balcony",
    "Gemütlich unterm Dach": "Cozy Under the Roof",
    "Fashion-Profi Zimmer": "Fashion Pro Room",
    "Berghütten-Vibes": "Mountain Cabin Vibes",
    "Ruhe-Oase mit Aussicht": "Quiet Oasis with a View",
    "Dein Rückzugsort": "Your Retreat",
    "Urlaubsfeeling garantiert": "Vacation Feeling Guaranteed",
    "Dein Startup-Zimmer": "Your Startup Room",
    "Zimmer 9": "Room 9",
    "Zimmer 10": "Room 10",
    "Zimmer 11": "Room 11",
    "Zimmer 12": "Room 12"
  };
  return translations[title] || title;
};

// Helper function to translate room features
const translateRoomFeature = (feature: string): string => {
  const translations: Record<string, string> = {
    "Balkon": "Balcony",
    "Direkte Küchennähe": "Direct kitchen access",
    "Bergpanorama": "Mountain panorama",
    "Günstigster Preis": "Lowest price",
    "Ruhige Lage": "Quiet location",
    "Dachschräge": "Sloped ceiling",
    "Kleiderschrank": "Large wardrobe",
    "Geräumig": "Spacious",
    "Kachelofen": "Tiled stove",
    "Aussicht": "View",
    "Eigenes Bad": "Private bathroom",
    "Eigene Terrasse": "Private terrace",
    "Gartenzugang": "Garden access",
    "Großes Fenster": "Large window",
    "Gemütlich": "Cozy",
    "Helles Zimmer": "Bright room",
    "Wassergeheizter Kachelofen": "Water-heated tiled stove",
    "Panoramablick": "Panoramic view",
    "Terrasse": "Terrace",
    "XXL-Format": "XXL size",
    "Eigene Dusche": "Private shower",
    "Eigenes WC": "Private toilet",
    "Garten": "Garden"
  };
  return translations[feature] || feature;
};

// Helper function to translate floor names
const translateFloorName = (floor: string): string => {
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
    "Zimmer 11": "Room 11",
    "Zimmer 12": "Room 12",
    "Dachgeschoß": "Top Floor",
    "Erdgeschoß": "Ground Floor",
    "Untergeschoß": "Basement"
  };
  return translations[floor] || floor;
};

// Helper function to translate room descriptions
const translateRoomDescription = (description: string): string => {
  const translations: Record<string, string> = {
    "Leben wie ein Fashion-Profi: Riesiger Kleiderschrank, Dachschräge für extra Charme und genug Platz für deine private Modenschau (oder dein privates Labor in dem du daran arbeitest die Weltherrschaft zu übernehmen).": "Live like a fashion pro: Huge wardrobe, sloped ceiling for extra charm and enough space for your private fashion show (or your private lab where you work on taking over the world).",
    "Berghütten-Vibes ohne Holz hacken: Dein wassergeheizter Kachelofen ist der Star – plus Aussicht, die das Herz höherschlagen lässt.": "Mountain cabin vibes without chopping wood: Your water-heated tiled stove is the star - plus a view that will make your heart beat faster.",
    "Terrassentür auf, Berge rein: Dein Leben im XXL-Format – Platz, Panorama und Luft ohne Ende. Hier bist du der Boss!": "Open the terrace door, let the mountains in: Your life in XXL format - space, panorama and endless fresh air. Here you're the boss!",
    "Perfekt balanciert: Nicht zu groß, nicht zu klein, aber mit Aussicht, die alles andere vergessen lässt. Ein echter Allrounder!": "Perfectly balanced: Not too big, not too small, but with a view that makes you forget everything else. A true all-rounder!",
    "Minimalismus deluxe: Klein, günstig und mit der Nische so clever, dass du dich wie ein Stauraum-Genie fühlen wirst!": "Minimalism deluxe: Small, affordable, and with a niche so clever that you'll feel like a storage genius!",
    "Urlaubsfeeling garantiert: Terrasse, Garten und eine Aussicht, die dich jeden Morgen auf Wolke sieben weckt. Raum für alles, was Spaß macht!": "Vacation feeling guaranteed: Terrace, garden, and a view that wakes you up on cloud nine every morning. Room for everything that's fun!",
    "Clever & Kompakt: Dein Mini-Loft mit allem, was du brauchst. Perfekt für Minimalisten und Sparfüchse!": "Clever & Compact: Your mini-loft with everything you need. Perfect for minimalists and bargain hunters!",
    "Tiny House Feeling: Klein aber oho! Mit Terrassenzugang und clever durchdachtem Layout machst du aus jedem Quadratmeter das Maximum.": "Tiny House Feeling: Small but mighty! With terrace access and cleverly thought-out layout, you'll make the most of every square meter."
  };
  return translations[description] || description;
};

// Helper functions for room cards
const renderRoomStatusBadge = (room: Room, currentLanguage: string, t: any) => {
  if (room.available) {
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#D09467]/80 text-white backdrop-blur-sm">
        {t('rooms.available_now')}
      </span>
    );
  } else if (room.availableFrom) {
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#979C94]/80 text-white backdrop-blur-sm">
        {t('rooms.available_from')} {new Date(room.availableFrom).toLocaleDateString(
          currentLanguage === 'de' ? 'de-DE' : 'en-US', 
          { month: 'short', day: 'numeric', year: 'numeric' }
        )}
      </span>
    );
  }
  return null;
};

const renderRoomTitle = (room: Room, currentLanguage: string) => {
  return typeof room.title === 'object' 
    ? room.title[currentLanguage as 'en' | 'de'] 
    : currentLanguage === 'en' ? translateRoomTitle(room.title) : room.title;
};

const renderRoomDescription = (room: Room, currentLanguage: string) => {
  return typeof room.description === 'object' 
    ? room.description[currentLanguage as 'en' | 'de'] 
    : currentLanguage === 'en' ? translateRoomDescription(room.description) : room.description;
};

const renderRoomFeature = (feature: string | Record<string, string>, currentLanguage: string) => {
  return typeof feature === 'object' 
    ? feature[currentLanguage as 'en' | 'de'] 
    : currentLanguage === 'en' ? translateRoomFeature(feature) : feature;
};

// Room card component (for inline use)
const RoomCardInline = ({ 
  room, 
  index, 
  currentLanguage, 
  t, 
  activeRoomId, 
  toggleRoomDetail, 
  handleApplyForRoom 
}: { 
  room: Room; 
  index: number; 
  currentLanguage: string; 
  t: any; 
  activeRoomId: string | null; 
  toggleRoomDetail: (roomId: string) => void; 
  handleApplyForRoom: (room: Room) => void; 
}) => {
  return (
    <motion.div
      key={room.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="relative aspect-square rounded-xl overflow-hidden group"
    >
      {/* Overlay gradients */}
      <div className="absolute inset-0 bg-black/20 z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#2E4555]/80 to-transparent z-10"></div>
      
      {/* Room image */}
      <Image
        src={room.images[0]}
        alt={typeof room.title === 'string' ? room.title : 'Room image'}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      
      {/* Room info overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2E4555]/60 text-[#EBDBC3] backdrop-blur-sm">
            {currentLanguage === 'en' ? translateFloorName(room.floor) : room.floor}
          </span>
          {renderRoomStatusBadge(room, currentLanguage, t)}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {renderRoomTitle(room, currentLanguage)}
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-[#EBDBC3]/90 text-sm flex items-center gap-1">
            <IconRuler className="w-4 h-4" />
            {room.size}m²
          </span>
          {/* Room-specific highlight */}
          {room.features.slice(0, 1).map((feature, idx) => (
            <span key={idx} className="text-[#EBDBC3]/90 text-sm flex items-center gap-1">
              <IconStar className="w-4 h-4" />
              {renderRoomFeature(feature, currentLanguage)}
            </span>
          ))}
        </div>
      </div>
      
      {/* Bottom actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex justify-between items-center">
        <div className="text-white font-medium backdrop-blur-sm bg-[#2E4555]/30 px-3 py-1.5 rounded-full">
          €{room.price}<span className="text-[#EBDBC3]/80">{t('rooms.per_month')}</span>
        </div>
        <button 
          onClick={() => toggleRoomDetail(room.id)}
          className="text-white backdrop-blur-sm bg-[#D09467]/70 hover:bg-[#D09467]/90 transition-colors px-4 py-1.5 rounded-full font-medium cursor-pointer"
        >
          {t('rooms.view_details')}
        </button>
      </div>
      
      {/* Room Detail Overlay */}
      <div 
        className={`absolute inset-0 bg-[#2E4555]/95 z-30 p-6 transition-all duration-300 flex flex-col overflow-y-auto ${
          activeRoomId === room.id ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button 
          onClick={() => toggleRoomDetail(room.id)} 
          className="absolute top-4 right-4 text-white hover:text-[#D09467] transition-colors z-40"
        >
          <IconX className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col h-full overflow-y-auto">
          <h3 className="text-2xl font-bold text-white mb-4">
            {renderRoomTitle(room, currentLanguage)}
          </h3>
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#D09467]/80 text-white">
              {currentLanguage === 'en' ? translateFloorName(room.floor) : room.floor}
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2E4555]/60 text-[#EBDBC3]">
              {room.size}m²
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2E4555]/60 text-[#EBDBC3]">
              €{room.price}{t('rooms.per_month')}
            </span>
          </div>
          
          <p className="text-[#EBDBC3] mb-4">
            {renderRoomDescription(room, currentLanguage)}
          </p>
          
          <div className="mb-4">
            <h4 className="text-white font-medium mb-2">{t('rooms.features')}</h4>
            <div className="flex flex-wrap gap-2">
              {room.features.map((feature, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2E4555]/60 text-[#EBDBC3] flex items-center gap-1">
                  <IconStar className="w-4 h-4" />
                  {renderRoomFeature(feature, currentLanguage)}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-auto pt-4">
            <button 
              onClick={() => handleApplyForRoom(room)}
              className="w-full bg-[#D09467] hover:bg-[#D09467]/80 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {t('hero.apply_now')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function LibraLabPage() {
  // Start STATE AND HOOKS COMPONENT
  const { t, currentLanguage } = useTranslation();
  const { toast } = useToast();
  const { currentAmount, addDeposit, isLoading: isLoadingCampaign } = useCampaign();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [aiFaqFocused, setAiFaqFocused] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  // End STATE AND HOOKS COMPONENT

  // Start HANDLERS COMPONENT
  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const handleReserve = async (tier: Tier) => {
    setIsProcessing(true);
    try {
      const success = await addDeposit(tier.id, tier.deposit);
      if (success) {
        setSelectedRoom(null);
        setShowApplicationForm(true);
        toast({
          title: t('reservation_notification.successful'),
          description: t('reservation_notification.successful_description'),
        });
      }
    } catch (error) {
      console.error('Failed to reserve:', error);
      toast({
        title: t('reservation_notification.error'),
        description: t('reservation_notification.process_error'),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReservation = async () => {
    if (!selectedRoom) return;
    
    setIsProcessing(true);
    const success = await addDeposit(selectedRoom.id, selectedRoom.deposit);
    setIsProcessing(false);
    
    if (success) {
      setShowApplicationForm(false);
    } else {
      toast({
        title: t('reservation_notification.error'),
        description: t('reservation_notification.process_error'),
        variant: "destructive",
      });
    }
  };

  const toggleRoomDetail = (roomId: string) => {
    setActiveRoomId(activeRoomId === roomId ? null : roomId);
  };

  const handleApplyForRoom = (room: Room) => {
    setSelectedRoom(room);
    setShowApplicationForm(true);
    setActiveRoomId(null); // Close the detail overlay
  };
  // End HANDLERS COMPONENT

  return (
    // Start MAIN LAYOUT COMPONENT
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <AnimatedHero />

      {/* Showcase Section - Featured Rooms Highlight */}
      <div className="py-16 px-6 sm:px-8 md:px-12 lg:px-16 bg-gradient-to-b from-white to-[#EBDBC3]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-[#2E4555]">{t('featured_spaces')}</h2>
              <p className="text-[#979C94]">{t('handpicked_rooms')}</p>
            </div>
            <Link
              href="#rooms"
              className="text-[#D09467] hover:text-[#E1B588] font-medium flex items-center gap-2 transition-colors duration-300"
            >
              {t('view_all_spaces')}
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {epicwgData.rooms
              .filter(room => [1, 4, 5].includes(room.roomNumber))
              .map((room, index) => (
                <RoomCardInline 
                  key={room.id} 
                  room={room} 
                  index={index} 
                  currentLanguage={currentLanguage} 
                  t={t} 
                  activeRoomId={activeRoomId} 
                  toggleRoomDetail={toggleRoomDetail} 
                  handleApplyForRoom={handleApplyForRoom} 
                />
              ))}
          </div>
        </div>
      </div>

      {/* Tech Innovation Hub Section */}
      <div className="py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-[#2E4555] mb-4">
          Tech Innovation Hub
        </h1>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Join a thriving community of tech founders, AI researchers, and innovators
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow group cursor-pointer relative">
            <div className="absolute top-4 right-4 text-[#D09467] group-hover:text-[#E1B588] transition-colors">
              <IconExternalLink size={20} />
            </div>
            <a 
              href="https://ai-shift.de" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <div className="text-[#D09467] text-4xl font-bold mb-2 group-hover:text-[#E1B588] transition-colors">6+</div>
              <div className="text-[#2E4555] font-medium mb-2">
                Monthly AI workshop modules in our ai_shift community
              </div>
              <div className="text-gray-600">Tech Education</div>
            </a>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow group cursor-pointer relative">
            <div className="absolute top-4 right-4 text-[#D09467] group-hover:text-[#E1B588] transition-colors">
              <IconMap size={20} />
            </div>
            <button 
              onClick={() => setShowMapModal(true)}
              className="block w-full text-left"
            >
              <div className="text-[#D09467] text-4xl font-bold mb-2 group-hover:text-[#E1B588] transition-colors">500+</div>
              <div className="text-[#2E4555] font-medium mb-2">
                AI Agency founders in our global AAA network
              </div>
              <div className="text-gray-600">Network Reach</div>
            </button>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow group cursor-pointer relative">
            <div className="absolute top-4 right-4 text-[#D09467] group-hover:text-[#E1B588] transition-colors">
              <IconArrowDown size={20} />
            </div>
            <a 
              href="#available-rooms" 
              className="block"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('available-rooms')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className="text-[#D09467] text-4xl font-bold mb-2 group-hover:text-[#E1B588] transition-colors">10</div>
              <div className="text-[#2E4555] font-medium mb-2">
                Tech-ready rooms launching in 2025
              </div>
              <div className="text-gray-600">Living Spaces</div>
            </a>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow group cursor-pointer relative">
            <div className="absolute top-4 right-4 text-[#D09467] group-hover:text-[#E1B588] transition-colors">
              <IconPlayerPlay size={20} />
            </div>
            <a 
              href="https://open.spotify.com/show/1BD4pUfxWWyj9yYGpvE9Oe" 
              target="_blank"
              rel="noopener noreferrer" 
              className="block"
            >
              <div className="text-[#D09467] text-4xl font-bold mb-2 group-hover:text-[#E1B588] transition-colors">5</div>
              <div className="text-[#2E4555] font-medium mb-2">
                Episodes of our "Spark" AI founders podcast
              </div>
              <div className="text-gray-600">Community Content</div>
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 mt-16">
          <div className="bg-gradient-to-br from-[#2E4555] to-[#1a2831] rounded-xl p-8 text-white">
            <div className="bg-[#D09467]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <IconHome className="w-6 h-6 text-[#D09467]" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Living Space</h3>
            <p className="text-gray-300 mb-4">
              Modern, comfortable living spaces designed for tech professionals.
            </p>
            <button 
              onClick={() => document.getElementById('available-rooms')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-[#D09467] hover:text-[#E1B588] flex items-center gap-1 font-medium transition-colors"
            >
              View rooms <IconArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-[#2E4555] to-[#1a2831] rounded-xl p-8 text-white">
            <div className="bg-[#D09467]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <IconCar className="w-6 h-6 text-[#D09467]" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Mobility</h3>
            <p className="text-gray-300 mb-4">
              Sustainable transportation solutions for our community.
            </p>
            <a 
              href="https://www.wemovenow.com/e-trike/"
              target="_blank"
              rel="noopener noreferrer" 
              className="text-[#D09467] hover:text-[#E1B588] flex items-center gap-1 font-medium transition-colors"
            >
              Learn more <IconArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-gradient-to-br from-[#2E4555] to-[#1a2831] rounded-xl p-8 text-white">
            <div className="bg-[#D09467]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <IconCalendar className="w-6 h-6 text-[#D09467]" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Events</h3>
            <p className="text-gray-300 mb-4">
              Regular community events and tech meetups.
            </p>
            <a 
              href="https://aiaustria.com/event-calendar"
              target="_blank"
              rel="noopener noreferrer" 
              className="text-[#D09467] hover:text-[#E1B588] flex items-center gap-1 font-medium transition-colors"
            >
              Learn more <IconArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* First Apply Now Section */}
      <ApplyNowSection 
        onApply={() => setShowApplicationForm(true)}
        variant="compact"
        subtitle="Join our community of tech professionals in the heart of the Alps."
      />

      {/* Feature Sections */}
      <div className="mb-16">
        {features.map((feature, index) => {
          // Special handling for video sections
          const videoMap = {
            "Deep Work, Maximum Focus": "/videos/deepwork.mp4",
            "AI Innovation Hub & Tech Community": "/videos/startup.mp4",
            "Innsbruck – Where Innovation Meets Adventure": "/videos/scenic/alps-ski.mp4"
          };
          
          const videoSrc = videoMap[feature.title];
          if (videoSrc) {
            const isMiddleSection = feature.title === "AI Innovation Hub & Tech Community";
            
            return (
              <div key={feature.title} className="py-24 overflow-hidden">
                <div className="container mx-auto px-4">
                  <div className={`flex flex-col lg:flex-row items-center gap-12 ${isMiddleSection ? 'lg:flex-row-reverse' : ''}`}>
                    {/* Content */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      <h2 className="text-3xl font-bold text-[#2E4555]">{feature.title}</h2>
                      <p className="text-[#979C94] text-lg">{feature.description}</p>
                      <div className="grid sm:grid-cols-2 gap-8 mt-8">
                        {feature.groups.map((group) => (
                          <div key={group.title}>
                            <h3 className="font-semibold mb-4 text-[#2E4555]">{group.title}</h3>
                            <ul className="space-y-3">
                              {group.features.map((item) => (
                                <li key={item.title} className="flex items-center gap-2">
                                  {item.icon && <item.icon className="w-5 h-5 text-[#D09467]" />}
                                  <span className="text-[#979C94]">{item.title}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <VideoPlayer
                        src={videoSrc}
                        aspectRatio="2.35:1"
                        className="shadow-2xl rounded-2xl overflow-hidden"
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            );
          }
          
          // Regular feature sections
          return (
            <FeatureSection
              key={feature.title}
              title={feature.title}
              description={feature.description}
              groups={feature.groups}
              imageUrl={feature.imageUrl}
              reversed={index % 2 === 1}
            />
          );
        })}
      </div>

      {/* AI FAQ section */}
      <section className="relative bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden rounded-3xl mx-4 mb-16">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:32px] contrast-50 opacity-10 rounded-3xl" />
        <motion.section
          animate={{ 
            height: aiFaqFocused ? "500px" : "300px",
            transition: {
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }
          }}
          className="w-full flex flex-col justify-center items-center relative overflow-hidden"
        >
          <AiFaq onFocusChange={setAiFaqFocused} />
        </motion.section>
      </section>

      {/* Complete Rooms List */}
      <section id="available-rooms" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#2E4555] mb-2">{t('all_available_space')}</h2>
              <p className="text-gray-600">{t('choose_room')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {epicwgData.rooms.map((room, index) => (
              <RoomCardInline 
                key={room.id} 
                room={room} 
                index={index} 
                currentLanguage={currentLanguage} 
                t={t} 
                activeRoomId={activeRoomId} 
                toggleRoomDetail={toggleRoomDetail} 
                handleApplyForRoom={handleApplyForRoom} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Communal Areas Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-[#D09467] mb-8 text-center">
          {t('communal_areas.title')}
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          {t('communal_areas.description')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coworking Space */}
          <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#EBDBC3]/30">
            <h3 className="text-xl font-semibold text-[#2E4555] mb-3 flex items-center gap-2">
              <IconDeviceLaptop className="w-6 h-6 text-[#D09467]" />
              {t('communal_areas.coworking.title')}
            </h3>
            <p className="text-[#979C94] mb-4">
              {t('communal_areas.coworking.description')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                {t('communal_areas.coworking.features.access')}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                {t('communal_areas.coworking.features.wifi')}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                {t('communal_areas.coworking.features.coffee')}
              </span>
            </div>
          </div>
          
          {/* Community Kitchen */}
          <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#EBDBC3]/30">
            <h3 className="text-xl font-semibold text-[#2E4555] mb-3 flex items-center gap-2">
              <IconCoffee className="w-6 h-6 text-[#D09467]" />
              {t('communal_areas.kitchen.title')}
            </h3>
            <p className="text-[#979C94] mb-4">
              {t('communal_areas.kitchen.description')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                {t('communal_areas.kitchen.features.equipment')}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                {t('communal_areas.kitchen.features.events')}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                {t('communal_areas.kitchen.features.storage')}
              </span>
            </div>
          </div>
          
          {/* Ground Floor Bathrooms */}
          <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#EBDBC3]/30">
            <h3 className="text-xl font-semibold text-[#2E4555] mb-3 flex items-center gap-2">
              <IconBath className="w-6 h-6 text-[#D09467]" />
              {t('communal_areas.bathrooms.title')}
            </h3>
            <p className="text-[#979C94] mb-4">
              {t('communal_areas.bathrooms.description')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                {t('communal_areas.bathrooms.features.fixtures')}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                {t('communal_areas.bathrooms.features.maintained')}
              </span>
            </div>
          </div>
          
          {/* Attic Area */}
          <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#EBDBC3]/30">
            <h3 className="text-xl font-semibold text-[#2E4555] mb-3 flex items-center gap-2">
              <IconStairs className="w-6 h-6 text-[#D09467]" />
              {t('communal_areas.attic.title')}
            </h3>
            <p className="text-[#979C94] mb-4">
              {t('communal_areas.attic.description')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                {t('communal_areas.attic.features.bright')}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                {t('communal_areas.attic.features.modern')}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                {t('communal_areas.attic.features.views')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Final Apply Now Section */}
      <ApplyNowSection 
        onApply={() => setShowApplicationForm(true)}
      />

      {/* Application Form Modal */}
      <ApplicationForm 
        isOpen={showApplicationForm}
        onClose={() => setShowApplicationForm(false)}
      />
      
      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl relative">
            <button 
              onClick={() => setShowMapModal(false)}
              className="absolute -top-4 -right-4 w-8 h-8 bg-[#D09467] text-white rounded-full flex items-center justify-center hover:bg-[#E1B588] transition-colors"
            >
              ×
            </button>
            <div className="w-full h-[500px] rounded-xl overflow-hidden">
              <iframe 
                src="https://mapper.voiceloop.io/embed/e40d4010-a914-4164-b1a4-4ffba470f531" 
                width="100%" 
                height="500" 
                frameBorder="0"
                title="AAA Network Map"
              />
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
    // End MAIN LAYOUT COMPONENT
  );
}