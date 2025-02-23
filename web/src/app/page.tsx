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
  IconRuler 
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
  { name: 'Tech Talks', value: '24+', description: 'Community Events per Year' },
  { name: 'Members', value: '30+', description: 'Active Community Members' },
  { name: 'Projects', value: '50+', description: 'Started Side Projects' },
  { name: 'Successes', value: '5+', description: 'Successful Startups' },
];

// Example data for charts
const monthlyStats = [
  { month: "Jan 24", "Community Events": 4, "Coworking Sessions": 12 },
  { month: "Feb 24", "Community Events": 6, "Coworking Sessions": 18 },
  { month: "Mar 24", "Community Events": 8, "Coworking Sessions": 24 },
  { month: "Apr 24", "Community Events": 10, "Coworking Sessions": 28 },
];

const roomTypeData = [
  { name: "Standard", value: 3 },
  { name: "Premium", value: 2 },
  { name: "Deluxe", value: 1 },
];

const featureData = [
  {
    Icon: IconDeviceLaptop,
    name: "Remote Work Ready",
    description: "High-speed internet, dedicated workspaces, and a productive atmosphere for focused work.",
    href: "#workspaces",
    cta: "View workspaces",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10" />
    ),
    className: "lg:col-span-2 lg:row-span-1",
  },
  {
    Icon: IconBrain,
    name: "AI Innovation",
    description: "Access to cutting-edge AI tools and regular tech workshops to stay ahead.",
    href: "#ai-tools",
    cta: "Explore AI tools",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10" />
    ),
    className: "lg:row-span-2",
  },
  {
    Icon: IconUsers,
    name: "Tech Community",
    description: "Join a vibrant community of tech enthusiasts, founders, and innovators.",
    href: "#community",
    cta: "Meet the community",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10" />
    ),
    className: "lg:row-span-2",
  },
  {
    Icon: IconBuildingCommunity,
    name: "Living Space",
    description: "Modern, comfortable living spaces designed for tech professionals.",
    href: "#rooms",
    cta: "View details",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10" />
    ),
    className: "lg:row-span-2",
  },
  {
    Icon: IconCar,
    name: "Mobility",
    description: "Eco-friendly E-Trike sharing and excellent public transport connections.",
    href: "#mobility",
    cta: "Learn more",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/10" />
    ),
    className: "lg:col-span-3 lg:row-span-1",
  },
  {
    Icon: IconCalendarEvent,
    name: "Events",
    description: "Regular tech talks, networking events, and founder meetups.",
    href: "#events",
    cta: "View events",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10" />
    ),
    className: "lg:col-span-2 lg:row-span-2",
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

  console.log('Page rendering with language:', currentLanguage, 'isLoading:', isTranslationLoading);

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
      // Show error message
      alert('Failed to process your reservation. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-screen">
        <motion.div 
          className="absolute inset-0 w-full h-full"
        >
          {/* Video Background */}
          <VideoBackground
            sources={[
              '/videos/scenic/alps-sunset.mp4'
            ]}
            gradient={true}
          />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-16">
            {/* Language Picker */}
            <div className="absolute top-6 right-6 sm:top-8 sm:right-8 md:top-12 md:right-12">
              <LanguagePicker />
            </div>

            {/* Social Proof - with placeholder avatars */}
            <div className="container mx-auto px-4">
              <div className="mb-6">
                <div className="flex items-center gap-3 text-white/90">
                  <div className="flex -space-x-3">
                    {[1,2,3,4,5].map((i) => (
                      <div 
                        key={i} 
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-white/20 relative overflow-hidden"
                      >
                        <Image
                          src={`https://api.dicebear.com/7.x/personas/svg?seed=user${i}`}
                          alt={`Community member ${i}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-medium">Join our growing community of tech innovators</span>
                </div>
              </div>
            </div>

            <h1 className="text-5xl font-bold text-white mb-6">
              {isTranslationLoading ? '...' : t(TranslationKeys.EPICWG_INNSBRUCK)}
            </h1>
            
            <p className="text-xl text-white/90 mb-12 max-w-2xl leading-relaxed">
              {isTranslationLoading ? '...' : t(TranslationKeys.EPICWG_DESCRIPTION)}
            </p>

            {/* Search Bar - inspired by larsen.ee */}
            <div className="bg-white rounded-full p-2 flex items-center gap-4 mb-12 max-w-2xl shadow-lg mx-auto">
              <div className="flex-1 flex items-center gap-4 px-4">
                <IconCalendarEvent className="w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="When would you like to move in?"
                  className="w-full py-2 outline-none"
                />
              </div>
              <button className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>

            <div className="flex gap-8 items-center">
              <motion.button
                onClick={() => {
                  const roomsSection = document.getElementById('rooms');
                  roomsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white text-gray-900 px-8 py-4 rounded-full font-medium 
                  hover:bg-gray-100 transition-colors flex items-center gap-3 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconHome className="w-5 h-5" />
                {isTranslationLoading ? '...' : t(TranslationKeys.DISCOVER_ROOMS)}
              </motion.button>
              <div className="hidden md:flex gap-6">
                <IconButton icon={<IconBrandGithub />} href="https://github.com/epicwg" />
                <IconButton icon={<IconBrandDiscord />} href="https://discord.gg/epicwg" />
                <IconButton icon={<IconBrandInstagram />} href="https://instagram.com/epicwg" />
              </div>
            </div>

            {/* Stats Bar - similar to nomads.com */}
            <div className="absolute bottom-8 left-0 right-0 bg-black/30 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-4">
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-white">
                    <div className="text-2xl font-bold">10+</div>
                    <div className="text-sm text-white/80">Available Rooms</div>
                  </div>
                  <div className="text-white">
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm text-white/80">Coworking Access</div>
                  </div>
                  <div className="text-white">
                    <div className="text-2xl font-bold">30+</div>
                    <div className="text-sm text-white/80">Community Members</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/80 cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight,
              behavior: 'smooth'
            });
          }}
        >
          <IconChevronDown className="w-6 h-6" />
        </motion.div>
      </div>

      {/* Rest of the content */}
      <div className="container mx-auto px-4 py-16">
        {/* Community Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {communityStats.map((stat) => (
            <motion.div
              key={stat.name}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Card className="p-6 h-full transition-all duration-200 hover:shadow-lg">
                <Text className="text-gray-600 font-medium">{stat.name}</Text>
                <Metric className="mt-3 text-blue-600 group-hover:text-blue-700">
                  {stat.value}
                </Metric>
                <Text className="text-sm text-gray-500 mt-2 leading-relaxed">
                  {stat.description}
                </Text>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Feature Sections */}
        {features.map((feature, index) => (
          <FeatureSection
            key={feature.title}
            {...feature}
            reversed={index % 2 === 1}
          />
        ))}

        {/* Community Benefits */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-7xl mx-auto mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Unsere Benefits
          </h2>
          <BenefitValues />
        </motion.div>

        {/* Bento Grid Features mit expandierbaren Cards */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureData.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card 
                  className={`transition-all duration-300 cursor-pointer ${
                    expandedCard === feature.name ? 'lg:col-span-2 lg:row-span-2' : ''
                  }`}
                  onClick={() => toggleCard(feature.name)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <feature.Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <Title>{feature.name}</Title>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                      {expandedCard === feature.name ? (
                        <IconChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <IconChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                  
                  <Text className="text-gray-600 mb-4">
                    {feature.description}
                  </Text>

                  <AnimatePresence>
                    {expandedCard === feature.name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        {/* Statistik-Charts basierend auf Feature-Typ */}
                        {feature.name === "Community Activity" && (
                          <div className="mt-4 h-64">
                            <AreaChart
                              data={monthlyStats}
                              index="month"
                              categories={["Community Events", "Coworking Sessions"]}
                              colors={["purple", "blue"]}
                              showLegend={true}
                              showGridLines={true}
                              showAnimation={true}
                            />
                          </div>
                        )}
                        
                        {feature.name === "Room Overview" && (
                          <div className="mt-4 min-h-[16rem] h-64 relative">
                            {roomTypeData.length === 0 ? (
                              <div className="flex items-center justify-center h-full">
                                <Text>No data available</Text>
                              </div>
                            ) : (
                              <>
                                <DonutChart
                                  data={roomTypeData}
                                  category="value"
                                  index="name"
                                  colors={["blue", "cyan", "indigo"]}
                                  showLabel={true}
                                  showAnimation={true}
                                  variant="donut"
                                  valueFormatter={() => ""}
                                  className="h-full"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="text-center">
                                    <Text className="text-4xl font-bold text-gray-900">
                                      {epicwgData.rooms.length}
                                    </Text>
                                    <Text className="text-sm text-gray-600">Total rooms</Text>
                                    <Text className="text-xs text-gray-500 mt-1">
                                      {epicwgData.rooms.filter(room => room.available).length} available
                                    </Text>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        
                        {feature.name === "Amenities" && (
                          <div className="mt-4">
                            <BarList
                              data={[]} // Removed data here
                              className="mt-2"
                            />
                          </div>
                        )}
                        
                        <Button
                          size="sm"
                          variant="light"
                          className="mt-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = feature.href;
                          }}
                        >
                          {feature.cta}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Early Bird Campaign Section */}
        <div className="mb-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Badge color="blue" size="xl" className="mb-4">{isTranslationLoading ? '...' : t(TranslationKeys.LIMITED_TIME_OFFER)}</Badge>
                <Title className="text-3xl mb-2">{isTranslationLoading ? '...' : t(TranslationKeys.EARLY_BIRD_PRE_BOOKING)}</Title>
                <Text className="text-gray-600">
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
        <div className="mb-12">
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
        <div id="rooms" className="mb-12">
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
      </div>
      <footer className="py-6 bg-gray-50 border-t border-gray-100">
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