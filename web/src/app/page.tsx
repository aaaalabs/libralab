'use client';

// Start IMPORTS COMPONENT
import { useState } from 'react';
import { useCampaign } from '../context/CampaignContext';
import { Card, Text, Metric, Button, Badge, Title, AreaChart, DonutChart, BarList, Color } from "@tremor/react";
import { LanguagePicker } from "../components/ui/language-picker";
import { Room } from "../types/room";
import { ApplicationForm } from "../components/application/ApplicationForm";
import Image from "next/image";
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
  IconStairs
} from '@tabler/icons-react';
import epicwgData from '../data/epicwg.json';
import { BentoCard, BentoGrid } from "../components/ui/bento-grid";
import { motion, AnimatePresence } from "framer-motion";
import { IconButton } from "../components/ui/icon-button";
import { RoomCard } from "../components/RoomCard";
import { CampaignProgress } from "../components/ui/campaign-progress";
import { useToast } from "../components/ui/use-toast";
import { useTranslation } from '@/context/TranslationContext';
import { TranslationKeys } from '@/types/i18n';
import { AiFaq } from '@/components/AiFaq';
import { VideoBackground } from "../components/ui/video-background";
import { FeatureSection } from '@/components/features/FeatureSection';
import { features } from '@/data/features';
import { ApplyNowSection } from '@/components/application/ApplyNowSection';
import Link from 'next/link';
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

export default function LibraLabPage() {
  // Start STATE AND HOOKS COMPONENT
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { currentAmount, addDeposit, isLoading: isLoadingCampaign } = useCampaign();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
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
      } else {
        toast({
          title: "Error",
          description: "Failed to reserve spot. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
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
        title: "Error",
        description: "Failed to process your reservation. Please try again.",
        variant: "destructive",
      });
    }
  };
  // End HANDLERS COMPONENT

  return (
    // Start MAIN LAYOUT COMPONENT
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <AnimatedHero />

      {/* Featured Rooms Section */}
      <div className="py-16 px-6 sm:px-8 md:px-12 lg:px-16 bg-[#EBDBC3]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-[#2E4555]">Featured Spaces</h2>
              <p className="text-[#979C94]">Handpicked rooms for tech professionals</p>
            </div>
            <Link
              href="#rooms"
              className="text-[#D09467] hover:text-[#E1B588] font-medium flex items-center gap-2 transition-colors duration-300"
            >
              View all spaces
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {epicwgData.rooms.slice(0, 3).map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="group"
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                  <Image
                    src={room.images[0]}
                    alt={room.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2E4555]/80 to-transparent" />
                  {/* Availability Badge */}
                  <div className="absolute top-4 right-4">
                    {room.available ? (
                      <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#D09467]/90 text-white backdrop-blur-sm">
                        Available Now
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#979C94]/90 text-white backdrop-blur-sm">
                        Available: {new Date(room.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2E4555]/60 text-[#EBDBC3] backdrop-blur-sm">
                            {room.floor}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-[#EBDBC3] mb-2">{room.title}</h3>
                        <div className="flex items-center gap-4">
                          <span className="text-[#EBDBC3]/90 text-sm flex items-center gap-1">
                            <IconRuler className="w-4 h-4" />
                            {room.size}m²
                          </span>
                          {/* Room-specific highlight */}
                          <span className="text-[#EBDBC3]/90 text-sm flex items-center gap-1">
                            {room.features[0] && (
                              <>
                                <IconStar className="w-4 h-4" />
                                {room.features[0]}
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
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
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-[#D09467] text-4xl font-bold mb-2">24+</div>
            <div className="text-[#2E4555] font-medium mb-2">
              Monthly AI research presentations and hands-on workshops
            </div>
            <div className="text-gray-600">Tech Talks & Workshops</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-[#D09467] text-4xl font-bold mb-2">30+</div>
            <div className="text-[#2E4555] font-medium mb-2">
              Active community members working in AI and tech
            </div>
            <div className="text-gray-600">Tech Professionals</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-[#D09467] text-4xl font-bold mb-2">50+</div>
            <div className="text-[#2E4555] font-medium mb-2">
              Collaborative projects launched by our community
            </div>
            <div className="text-gray-600">Side Projects</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-[#D09467] text-4xl font-bold mb-2">5+</div>
            <div className="text-[#2E4555] font-medium mb-2">
              Successful ventures founded by community members
            </div>
            <div className="text-gray-600">Startup Exits</div>
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
            <a href="#" className="text-[#D09467] hover:text-[#E1B588] flex items-center gap-1 font-medium">
              View rooms <IconArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-gradient-to-br from-[#2E4555] to-[#1a2831] rounded-xl p-8 text-white">
            <div className="bg-[#D09467]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <IconCar className="w-6 h-6 text-[#D09467]" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Mobility</h3>
            <p className="text-gray-300 mb-4">
              Eco-friendly E-Trike sharing and excellent public transport connections.
            </p>
            <a href="#" className="text-[#D09467] hover:text-[#E1B588] flex items-center gap-1 font-medium">
              Learn more <IconArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-gradient-to-br from-[#2E4555] to-[#1a2831] rounded-xl p-8 text-white">
            <div className="bg-[#D09467]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <IconCalendarEvent className="w-6 h-6 text-[#D09467]" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Events</h3>
            <p className="text-gray-300 mb-4">
              Regular tech talks, networking events, and founder meetups.
            </p>
            <a href="#" className="text-[#D09467] hover:text-[#E1B588] flex items-center gap-1 font-medium">
              View calendar <IconArrowRight className="w-4 h-4" />
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
        <div className="relative h-[300px]">
          <AiFaq />
        </div>
      </section>

      {/* Complete Rooms List */}
      <div id="rooms" className="py-16 px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-[#2E4555]">Featured Spaces</h2>
              <p className="text-[#979C94]">Handpicked rooms for tech professionals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {epicwgData.rooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="group"
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                  <Image
                    src={room.images[0]}
                    alt={room.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2E4555]/80 to-transparent" />
                  {/* Availability Badge */}
                  <div className="absolute top-4 right-4">
                    {room.available ? (
                      <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#D09467]/90 text-white backdrop-blur-sm">
                        Available Now
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#979C94]/90 text-white backdrop-blur-sm">
                        Available: {new Date(room.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2E4555]/60 text-[#EBDBC3] backdrop-blur-sm">
                            {room.floor}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-[#EBDBC3] mb-2">{room.title}</h3>
                        <div className="flex items-center gap-4">
                          <span className="text-[#EBDBC3]/90 text-sm flex items-center gap-1">
                            <IconRuler className="w-4 h-4" />
                            {room.size}m²
                          </span>
                          {/* Room-specific highlight */}
                          <span className="text-[#EBDBC3]/90 text-sm flex items-center gap-1">
                            {room.features[0] && (
                              <>
                                <IconStar className="w-4 h-4" />
                                {room.features[0]}
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-[#D09467] font-medium backdrop-blur-sm bg-[#2E4555]/30 px-3 py-1.5 rounded-full">
                        from {room.price}€
                        <span className="text-[#EBDBC3]/80 text-sm">/month</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Communal Areas Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
          Communal Areas
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Experience our thoughtfully designed shared spaces that foster collaboration and community
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coworking Space */}
          <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#EBDBC3]/30">
            <h3 className="text-xl font-semibold text-[#2E4555] mb-3 flex items-center gap-2">
              <IconDeviceLaptop className="w-6 h-6 text-[#D09467]" />
              Coworking Space
            </h3>
            <p className="text-[#979C94] mb-4">
              Spacious coworking area in the basement with kitchen facilities
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                24/7 access
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                High-speed WiFi
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                Coffee & Tea
              </span>
            </div>
          </div>

          {/* Community Kitchen */}
          <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#EBDBC3]/30">
            <h3 className="text-xl font-semibold text-[#2E4555] mb-3 flex items-center gap-2">
              <IconCoffee className="w-6 h-6 text-[#D09467]" />
              Community Kitchen
            </h3>
            <p className="text-[#979C94] mb-4">
              Modern, fully equipped kitchen and social hub
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                Full equipment
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                Social events
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                Storage space
              </span>
            </div>
          </div>

          {/* Ground Floor Bathrooms */}
          <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#EBDBC3]/30">
            <h3 className="text-xl font-semibold text-[#2E4555] mb-3 flex items-center gap-2">
              <IconBath className="w-6 h-6 text-[#D09467]" />
              Ground Floor Bathrooms
            </h3>
            <p className="text-[#979C94] mb-4">
              Two modern bathrooms on the ground floor
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                Modern fixtures
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                Well-maintained
              </span>
            </div>
          </div>

          {/* Attic Area */}
          <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#EBDBC3]/30">
            <h3 className="text-xl font-semibold text-[#2E4555] mb-3 flex items-center gap-2">
              <IconStairs className="w-6 h-6 text-[#D09467]" />
              Attic Area
            </h3>
            <p className="text-[#979C94] mb-4">
              Spacious entrance area and bathroom under the roof
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                Bright space
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
                Modern bathroom
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
      <Footer />
    </div>
    // End MAIN LAYOUT COMPONENT
  );
}