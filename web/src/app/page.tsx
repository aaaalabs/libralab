'use client';

import { useState } from 'react';
import { useCampaign } from '../context/CampaignContext';
import { Card, Text, Metric, Button, Badge, Title, AreaChart, DonutChart, BarList, Color } from "@tremor/react";
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
  IconChevronRight 
} from '@tabler/icons-react';
import epicwgData from '../data/epicwg.json';
import { BentoCard, BentoGrid } from "../components/ui/bento-grid";
import { motion, AnimatePresence } from "framer-motion";
import { IconButton } from "../components/ui/icon-button";
import { RoomCard } from "../components/RoomCard";
import { CampaignProgress } from "../components/ui/campaign-progress";
import { useToast } from "../components/ui/use-toast";

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

// Beispieldaten für Charts
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

const amenityStats = [
  { name: "Gigabit Internet", value: 1000, icon: IconWifi },
  { name: "Workspaces", value: 6, icon: IconDeviceLaptop },
  { name: "Community Size", value: 12, icon: IconUsers },
  { name: "Available Rooms", value: epicwgData.rooms.filter(r => r.available).length, icon: IconHome },
];

const features = [
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
    Icon: IconBuildingCommunity,
    name: "Tech Community",
    description: "Connect with other developers, founders, and digital nomads. Weekly meetups and skill-sharing events.",
    href: "#community",
    cta: "Meet the community",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10" />
    ),
    className: "lg:row-span-2",
  },
  {
    Icon: IconChartBar,
    name: "Community Activity",
    description: "Growing number of events and coworking sessions",
    href: "#stats",
    cta: "View statistics",
    background: (
      <div className="absolute inset-0">
        <AreaChart
          className="h-full mt-4 opacity-30"
          data={monthlyStats}
          index="month"
          categories={["Community Events", "Coworking Sessions"]}
          colors={["purple", "blue"]}
          showXAxis={false}
          showYAxis={false}
          showLegend={false}
          showGridLines={false}
        />
      </div>
    ),
    className: "lg:col-span-2 lg:row-span-2",
  },
  {
    Icon: IconHome,
    name: "Room Overview",
    description: "Various room types for different needs",
    href: "#rooms",
    cta: "View details",
    background: (
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <DonutChart
          data={roomTypeData}
          category="value"
          index="name"
          colors={["blue", "cyan", "indigo"]}
          variant="pie"
          valueFormatter={(value) => value.toString()}
          showAnimation={true}
          label={`${roomTypeData.reduce((acc, curr) => acc + curr.value, 0)} Total`}
        />
      </div>
    ),
    className: "lg:row-span-2",
  },
  {
    Icon: IconWifi,
    name: "Amenities",
    description: "Modern infrastructure for productive work",
    href: "#amenities",
    cta: "Learn more",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/10">
        <div className="p-6 pt-16 opacity-30">
          <BarList data={amenityStats} className="mt-2" />
        </div>
      </div>
    ),
    className: "lg:col-span-3 lg:row-span-1",
  },
];

export default function EpicWGPage() {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<typeof epicwgData.earlyBirdCampaign.tiers[0] | null>(null);
  const { currentAmount, addDeposit, isLoading, tierSlots } = useCampaign();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const handleReserve = async (tier: typeof epicwgData.earlyBirdCampaign.tiers[0]) => {
    setIsProcessing(true);
    try {
      const success = await addDeposit(tier.id, tier.minDeposit);
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
    const success = await addDeposit(selectedTier.id, selectedTier.minDeposit);
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
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <motion.div 
          className="relative overflow-hidden rounded-3xl mb-12"
        >
          {/* Video Background */}
          <div className="absolute inset-0 w-full h-full">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/videos/pano_01.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Animated colorful gradient with transparency */}
          <motion.div 
            className="absolute inset-0"
            animate={{
              background: [
                "linear-gradient(15deg, rgba(0, 190, 130, 1) 0%, rgba(54, 190, 218, 1) 40%, rgba(0, 71, 225, 0) 100%)",
                "linear-gradient(30deg, rgba(0, 71, 225, 1) 0%, rgba(0, 190, 130, 1) 40%, rgba(54, 190, 218, 0) 100%)",
                "linear-gradient(45deg, rgba(54, 190, 218, 1) 0%, rgba(0, 71, 225, 1) 40%, rgba(0, 190, 130, 0) 100%)",
                "linear-gradient(30deg, rgba(0, 190, 130, 1) 0%, rgba(54, 190, 218, 1) 40%, rgba(0, 71, 225, 0) 100%)",
                "linear-gradient(15deg, rgba(0, 71, 225, 1) 0%, rgba(0, 190, 130, 1) 40%, rgba(54, 190, 218, 0) 100%)"
              ]
            }}
            initial={{
              background: "linear-gradient(15deg, rgba(0, 190, 130, 1) 0%, rgba(54, 190, 218, 1) 40%, rgba(0, 71, 225, 0) 100%)"
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            <div className="gradient-shimmer" />
          </motion.div>
          
          <motion.div 
            className="relative z-10 px-8 py-24 text-white"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              className="text-sm font-medium mb-2 opacity-80"
              variants={containerVariants}
            >
              libra innovation flexco  
            </motion.p>
            <motion.h1 
              className="text-5xl font-bold mb-6"
              variants={containerVariants}
            >
              EpicWG Innsbruck
            </motion.h1>
            
            <motion.p 
              className="text-lg text-white/90 mb-12 max-w-2xl leading-relaxed"
              variants={containerVariants}
            >
              Charming residential house in Omes, near Innsbruck, with spectacular mountain views. 
              Located directly on the hillside, the house offers a total of 244.13m² of living space 
              and 160.25m² of additional space across three levels.
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-4 mb-12"
              variants={containerVariants}
            >
              {aiTrends.map((trend, index) => (
                <motion.span
                  key={trend.label}
                  className={`${trend.color} px-6 py-2.5 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm 
                    hover:scale-105 transition-transform cursor-pointer`}
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {trend.label}
                </motion.span>
              ))}
            </motion.div>

            <motion.div 
              className="flex gap-8 items-center"
              variants={containerVariants}
            >
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
                Discover Rooms
              </motion.button>
              <motion.div className="flex gap-6">
                <div className="hidden md:block">
                  <IconButton icon={<IconBrandGithub />} href="https://github.com/epicwg" />
                </div>
                <IconButton icon={<IconBrandDiscord />} href="https://discord.gg/epicwg" />
                <IconButton icon={<IconBrandInstagram />} href="https://instagram.com/epicwg" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent 
            mix-blend-overlay pointer-events-none" />
        </motion.div>

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

        {/* Quick Stats als kompakte Badges */}
        <div className="bg-white rounded-xl p-4 mb-12 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center">
            {amenityStats.map((stat) => (
              <div
                key={stat.name}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg"
              >
                <div className="bg-blue-50 p-1.5 rounded-md">
                  <stat.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <Text className="text-sm text-gray-600">{stat.name}</Text>
                  <Text className="font-semibold">{stat.value}</Text>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bento Grid Features mit expandierbaren Cards */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
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
                              data={amenityStats.map(stat => ({
                                name: stat.name,
                                value: stat.value
                              }))}
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
                <Badge color="blue" size="xl" className="mb-4">Limited Time Offer</Badge>
                <Title className="text-3xl mb-2">Early Bird Pre-booking</Title>
                <Text className="text-gray-600">
                  Be part of our community from the start and enjoy exclusive benefits
                </Text>
              </div>
              <div className="text-right">
                <Text className="text-sm text-gray-500">Campaign ends</Text>
                <Text className="text-xl font-semibold text-gray-900">March 31st, 2025</Text>
              </div>
            </div>

            {/* Progress Bar */}
            <CampaignProgress 
              currentAmount={currentAmount}
              goal={epicwgData.earlyBirdCampaign.goal}
              endDate={epicwgData.earlyBirdCampaign.endDate}
              isLoading={isLoading}
            />

            {/* Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {epicwgData.earlyBirdCampaign.tiers.map((tier) => {
                const tierSlot = tierSlots.find(slot => slot.tierId === tier.id);
                const isSoldOut = tierSlot ? tierSlot.remainingSlots <= 0 : false;
                const remainingSlots = tierSlot ? tierSlot.remainingSlots : tier.maxSlots;

                return (
                  <Card 
                    key={tier.id}
                    className={`overflow-hidden transition-all duration-200 ${
                      tier.id === 'pioneer' ? 'border-2 border-blue-500 shadow-lg' : ''
                    } ${isSoldOut ? 'opacity-50' : ''}`}
                  >
                    {tier.id === 'pioneer' && (
                      <div className="bg-blue-500 text-white text-center text-sm py-1">
                        Best Value
                      </div>
                    )}
                    <div className="p-6">
                      <Title className="text-xl mb-2">{tier.title}</Title>
                      <div className="flex items-baseline mb-4">
                        <Text className="text-3xl font-bold">€{tier.minDeposit}</Text>
                        <Text className="text-gray-500 ml-2">deposit</Text>
                      </div>
                      <div className="mb-4">
                        <Badge color="green" className="mb-2">{tier.discount}% off rent</Badge>
                        <Text className={`text-sm ${isSoldOut ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                          {isSoldOut ? 'SOLD OUT' : `${remainingSlots} of ${tierSlot?.maxSlots || tier.maxSlots} spots left`}
                        </Text>
                      </div>
                      <div className="space-y-2 mb-6">
                        {tier.perks.map((perk, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <IconChevronRight className="w-4 h-4 text-blue-500 mt-1" />
                            <Text className="text-sm text-gray-600">{perk}</Text>
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
                        {isSoldOut ? 'Sold Out' : 'Reserve Now'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* FAQ Section */}
            <div className="space-y-4">
              <Title className="text-xl mb-4">Frequently Asked Questions</Title>
              {epicwgData.earlyBirdCampaign.faq.map((item, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="p-4">
                    <Text className="font-medium mb-2">{item.question}</Text>
                    <Text className="text-gray-600">{item.answer}</Text>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Common Areas */}
        <div className="mb-12">
          <Title className="text-2xl mb-6">Common Areas</Title>
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
        <div className="mb-12">
          <Title className="text-2xl mb-6">Available Rooms</Title>
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
                <Title className="text-2xl mb-4">Confirm Reservation</Title>
                <Text className="mb-6">
                  You are about to reserve a spot in the {selectedTier.title} tier with a deposit of €{selectedTier.minDeposit}.
                  This amount will be deducted from your first month's rent.
                </Text>
                <div className="flex justify-end gap-4">
                  <Button
                    color="gray"
                    onClick={() => setShowApplicationModal(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="blue"
                    onClick={handleConfirmReservation}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Reservation'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
      <footer className="py-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-center text-gray-500 text-sm">
          <Image 
            src="/libralab.svg" 
            alt="libralab" 
            width={16} 
            height={16} 
            className="mr-2 opacity-70" 
          />
          <span> {new Date().getFullYear()} - powered by libra innovation flexco
          </span>
        </div>
      </footer>
    </div>
  );
}
