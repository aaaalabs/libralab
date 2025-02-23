'use client';

import { useState } from 'react';
import { useCampaign } from '../context/CampaignContext';
import { Card, Text, Metric, Button, Badge, Title, AreaChart, DonutChart, BarList, Color } from "@tremor/react";
import { LanguagePicker } from "../components/ui/language-picker";
import { Room } from "../types/room";
import { ApplicationModal } from "../components/rooms/ApplicationModal";
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
  IconStar
} from '@tabler/icons-react';
import epicwgData from '../data/epicwg.json';
import { BentoCard, BentoGrid } from "../components/ui/bento-grid";
import { motion, AnimatePresence } from "framer-motion";
import { IconButton } from "../components/ui/icon-button";
import { RoomCard } from "../components/RoomCard";
import { CampaignProgress } from "../components/ui/campaign-progress";
import { useToast } from "../components/ui/use-toast";
import { FoundersEliteCard } from "../components/FoundersEliteCard";
import { useTranslation } from '@/context/TranslationContext';
import { TranslationKeys } from '@/types/i18n';
import { TierSlot } from '../types/tier';
import { AiFaq } from '@/components/AiFaq';
import { BenefitValues } from '@/components/BenefitValues';
import { VideoBackground } from "../components/ui/video-background";
import { FeatureSection } from '@/components/features/FeatureSection';
import { features } from '@/data/features';
import { FloatingNav } from '@/components/navigation/FloatingNav';
import Link from 'next/link';
import { VideoPlayer } from "../components/ui/video-player";

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

export default function EpicWGPage() {
  const { t, currentLanguage, isLoading: isTranslationLoading } = useTranslation();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const { currentAmount, addDeposit, isLoading: isLoadingCampaign, tierSlots } = useCampaign();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const handleReserve = async (tier: Tier) => {
    setIsProcessing(true);
    try {
      const success = await addDeposit(tier.id, tier.deposit);
      if (success) {
        setSelectedTier(tier);
        setShowApplicationModal(true);
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
    if (!selectedTier) return;
    
    setIsProcessing(true);
    const success = await addDeposit(selectedTier.id, selectedTier.deposit);
    setIsProcessing(false);
    
    if (success) {
      setShowApplicationModal(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to process your reservation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Improved */}
      <div className="relative h-screen">
        <VideoBackground
          sources={['/videos/scenic/alps-sunset.mp4']}
          gradient={true}
        />
        
        <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-16">
          {/* Top Navigation Bar */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 sm:px-8 md:px-12 lg:px-16 py-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/sync_logo03.svg"
                alt="Libra Lab Logo"
                width={64}
                height={64}
                className="w-16 h-16"
              />
            </Link>
            <LanguagePicker />
          </div>

          {/* Sticky Navigation */}
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 hidden"
            style={{
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }}
            id="stickyNav"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/sync_logo02.svg"
                  alt="Libra Lab Logo"
                  width={64}
                  height={64}
                  className="w-16 h-16"
                />
              </Link>
              
              <div className="flex items-center gap-6">
                <nav className="hidden md:flex items-center gap-6">
                  <Link href="#tiers" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                    Pricing
                  </Link>
                  <Link href="#rooms" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                    Rooms
                  </Link>
                  <Link href="#tech-hub" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                    Tech Hub
                  </Link>
                </nav>
                <Link
                  href="#rooms"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Explore rooms
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Main Value Proposition */}
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <motion.h1 
                className="text-5xl md:text-7xl lg:text-[90px] font-bold mb-8 tracking-tight leading-[1.1]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="block">Where</span>
                <motion.span 
                  className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text inline-block"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  AI Innovators
                </motion.span>
                <span className="block">Shape Tomorrow's Living</span>
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl lg:text-3xl text-white/90 font-light max-w-3xl mx-auto mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                A tech-powered coliving space in the heart of the Alps
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-3"
              >
                {aiTrends.slice(0, 3).map((trend, index) => (
                  <motion.span
                    key={trend.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="px-4 py-1 rounded-full text-sm bg-white/10 backdrop-blur-sm border border-white/20"
                  >
                    {trend.label}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 cursor-pointer"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <IconChevronDown className="w-6 h-6" />
          </motion.div>
        </div>
      </div>

      {/* Add scroll listener for sticky nav */}
      <script dangerouslySetInnerHTML={{
        __html: `
          window.addEventListener('scroll', () => {
            const nav = document.getElementById('stickyNav');
            if (nav) {
              if (window.scrollY > window.innerHeight - 100) {
                nav.classList.remove('hidden');
              } else {
                nav.classList.add('hidden');
              }
            }
          });
        `
      }} />

      {/* Featured Rooms Section */}
      <div className="py-24 px-6 sm:px-8 md:px-12 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Featured Spaces</h2>
              <p className="text-gray-600">Handpicked rooms for tech professionals</p>
            </div>
            <Link
              href="#rooms"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              View all spaces
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Availability Badge */}
                  <div className="absolute top-4 right-4">
                    {room.available ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/90 text-white">
                        Available Now
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/90 text-white">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                            {room.floor}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">{room.title}</h3>
                        <div className="flex items-center gap-4">
                          <span className="text-white/90 text-sm flex items-center gap-1">
                            <IconRuler className="w-4 h-4" />
                            {room.size}m²
                          </span>
                          {/* Room-specific highlight */}
                          <span className="text-white/90 text-sm flex items-center gap-1">
                            {room.features[0] && (
                              <>
                                <IconStar className="w-4 h-4" />
                                {room.features[0]}
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-white font-medium">
                        from {room.price}€
                        <span className="text-white/80 text-sm">/month</span>
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
      <div className="py-24 px-6 sm:px-8 md:px-12 lg:px-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Tech Innovation Hub
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Join a thriving community of tech founders, AI researchers, and innovators
            </motion.p>
          </div>

          {/* Tech Community Stats - Integrated with Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {communityStats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <stat.icon className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-blue-500 mb-1">{stat.value}</div>
                    <div className="text-gray-600">{stat.description}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{stat.name}</p>
              </motion.div>
            ))}
          </div>

          {/* Tech Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureData.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <feature.Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.name}</h3>
                </div>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <Link
                  href={feature.href}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 text-sm"
                >
                  {feature.cta}
                  <IconArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Sections */}
      <div className="mb-32">
        {features.map((feature, index) => {
          // Special handling for Innsbruck section with video
          if (feature.title.includes("Innsbruck")) {
            return (
              <div key={feature.title} className="py-24 overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      <h2 className="text-3xl font-bold">{feature.title}</h2>
                      <p className="text-gray-600 text-lg">{feature.description}</p>
                      <div className="grid sm:grid-cols-2 gap-8 mt-8">
                        {feature.groups.map((group) => (
                          <div key={group.title}>
                            <h3 className="font-semibold mb-4">{group.title}</h3>
                            <ul className="space-y-3">
                              {group.features.map((item) => (
                                <li key={item.title} className="flex items-center gap-2">
                                  {item.icon && <item.icon className="w-5 h-5 text-blue-500" />}
                                  <span>{item.title}</span>
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
                        src="/videos/scenic/alps-ski.mp4"
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
              {...feature}
              reversed={index % 2 === 1}
            />
          );
        })}
      </div>

      {/* Community Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-24"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Unsere Benefits
        </h2>
        <BenefitValues />
      </motion.div>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {epicwgData.rooms.map((room) => (
            <RoomCard 
              key={room.id} 
              room={room}
            />
          ))}
        </div>
      </div>

      {/* Early Bird Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="mb-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Badge color="blue" size="xl" className="mb-4">{isTranslationLoading ? '...' : t(TranslationKeys.LIMITED_TIME_OFFER)}</Badge>
                <Title className="text-3xl mb-2">{isTranslationLoading ? '...' : t(TranslationKeys.EARLY_BIRD_PRE_BOOKING)}</Title>
                <Text className="mb-6">
                  {isTranslationLoading ? '...' : t(TranslationKeys.EARLY_BIRD_DESCRIPTION)}
                </Text>
              </div>
              <div className="text-right">
                <Text className="text-sm text-gray-500">{isTranslationLoading ? '...' : t(TranslationKeys.CAMPAIGN_ENDS)}</Text>
                <Text className="text-xl font-semibold text-gray-900">March 31st, 2025</Text>
              </div>
            </div>

            {/* Progress Bar */}
            <CampaignProgress 
              currentAmount={currentAmount}
              goal={epicwgData.earlyBirdCampaign.goal}
              endDate={epicwgData.earlyBirdCampaign.endDate}
              isLoading={isLoadingCampaign}
            />

            {/* Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {epicwgData.earlyBirdCampaign.tiers.map((tier: Tier) => {
                const tierSlot = tierSlots.find((slot) => slot.tierId === tier.id);
                const isSoldOut = tierSlot ? tierSlot.usedSlots >= tierSlot.maxSlots : false;
                const remainingSlots = tierSlot ? tierSlot.maxSlots - tierSlot.usedSlots : tier.maxSlots;

                return (
                  <Card 
                    key={tier.id}
                    className={`overflow-hidden transition-all duration-200 ${
                      tier.id === 'pioneer' ? 'border-2 border-blue-500 shadow-lg' : ''
                    } ${isSoldOut ? 'opacity-50' : ''}`}
                  >
                    {tier.id === 'pioneer' && (
                      <div className="bg-blue-500 text-white text-center text-sm py-1">
                        {isTranslationLoading ? '...' : t(TranslationKeys.BEST_VALUE)}
                      </div>
                    )}
                    <div className="p-6">
                      <Title className="text-xl mb-2">{tier.title}</Title>
                      <div className="flex items-baseline mb-4">
                        <Text className="text-3xl font-bold">€{tier.deposit}</Text>
                        <Text className="text-gray-500 ml-2">{isTranslationLoading ? '...' : t(TranslationKeys.DEPOSIT)}</Text>
                      </div>
                      <div className="mb-4">
                        <Badge color="green" className="mb-2">{tier.discount}% {isTranslationLoading ? '...' : t(TranslationKeys.OFF_RENT)}</Badge>
                        <Text className={`text-sm ${isSoldOut ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                          {isSoldOut ? isTranslationLoading ? '...' : t(TranslationKeys.SOLD_OUT) : `${remainingSlots} of ${tierSlot?.maxSlots || tier.maxSlots} spots left`}
                        </Text>
                      </div>
                      <div className="space-y-2 mb-6">
                        {tier.benefits.map((benefit: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <IconChevronRight className="w-4 h-4 text-blue-500 mt-1" />
                            <Text className="text-sm text-gray-600">{benefit}</Text>
                          </div>
                        ))}
                      </div>
                      <Button 
                        size="lg" 
                        color={tier.id === 'pioneer' ? 'blue' : 'gray'}
                        className="w-full"
                        onClick={() => handleReserve(tier)}
                        disabled={isSoldOut || isProcessing}
                      >
                        {isSoldOut ? isTranslationLoading ? '...' : t(TranslationKeys.SOLD_OUT) : isTranslationLoading ? '...' : t(TranslationKeys.RESERVE_NOW)}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* AI FAQ section */}
      <section className="relative py-24 bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden rounded-3xl mx-4 mb-32">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:32px] contrast-50 opacity-10 rounded-3xl" />
        <div className="relative h-full">
          <div className="w-full h-full bg-gray-900/80 backdrop-blur-sm -my-24">
            <AiFaq />
          </div>
        </div>
      </section>

      {/* Common Areas */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {epicwgData.commonAreas.map((area) => (
            <Card 
              key={area.id}
              className={`transition-all duration-300 cursor-pointer ${
                expandedCard === area.title ? 'lg:col-span-2 lg:row-span-2' : ''
              }`}
              onClick={() => toggleCard(area.title)}
            >
              <div className="p-6">
                <Title className="text-lg mb-2">{area.title}</Title>
                <Text className="mb-4">{area.description}</Text>
                {area.amenities && area.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {area.amenities.map((amenity, index) => (
                      <Badge key={index} color="blue">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Available Rooms */}
      <div id="rooms" className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {epicwgData.rooms.map((room) => (
            <RoomCard 
              key={room.id} 
              room={room}
            />
          ))}
        </div>
      </div>

      {showApplicationModal && selectedTier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <div className="p-6">
              <Title className="text-2xl mb-4">{isTranslationLoading ? '...' : t(TranslationKeys.CONFIRM_RESERVATION)}</Title>
              <Text className="mb-6">
                {isTranslationLoading ? '...' : t(TranslationKeys.CONFIRM_RESERVATION_DESCRIPTION, { tier: selectedTier.title, deposit: selectedTier.deposit })}
              </Text>
              <div className="flex justify-end gap-4">
                <Button
                  color="gray"
                  onClick={() => setShowApplicationModal(false)}
                  disabled={isProcessing}
                >
                  {isTranslationLoading ? '...' : t(TranslationKeys.CANCEL)}
                </Button>
                <Button
                  color="blue"
                  onClick={handleConfirmReservation}
                  disabled={isProcessing}
                >
                  {isProcessing ? isTranslationLoading ? '...' : t(TranslationKeys.PROCESSING) : isTranslationLoading ? '...' : t(TranslationKeys.CONFIRM_RESERVATION)}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-4">
            {/* Social icons for mobile */}
            <div className="flex md:hidden gap-6 mb-4">
              <IconButton icon={<IconBrandGithub />} href="https://github.com/epicwg" />
              <IconButton icon={<IconBrandDiscord />} href="https://discord.gg/epicwg" />
              <IconButton icon={<IconBrandInstagram />} href="https://instagram.com/epicwg" />
            </div>
            <div className="flex items-center justify-center text-gray-500 text-sm">
              <Image 
                src="/libralab.svg" 
                alt="libralab" 
                width={16} 
                height={16} 
                className="mr-2 opacity-70" 
              />
              <span>{new Date().getFullYear()} - {isTranslationLoading ? '...' : t(TranslationKeys.POWERED_BY)} libra innovation flexco</span>
            </div>
          </div>
        </div>
      </footer>
      <FloatingNav />
    </div>
  );
}