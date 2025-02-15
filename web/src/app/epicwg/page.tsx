'use client';

import { useState } from 'react';
import { Card, Text, Metric, Button, Badge, Title, AreaChart, DonutChart, BarList, Color } from "@tremor/react";
import { Room } from "../../types/room";
import { ApplicationModal } from "../../components/rooms/ApplicationModal";
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
  IconChevronUp 
} from '@tabler/icons-react';
import epicwgData from '../../data/epicwg.json';
import { BentoCard, BentoGrid } from "../../components/ui/bento-grid";
import { motion, AnimatePresence } from "framer-motion";
import { IconButton } from "../../components/ui/icon-button";
import { RoomCard } from "../../components/RoomCard";

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

const gradientVariants = {
  initial: {
    background: "linear-gradient(45deg, #00DC82 0%, #36E4DA 50%, #0047E1 100%)"
  },
  animate: {
    background: ["linear-gradient(45deg, #00DC82 0%, #36E4DA 50%, #0047E1 100%)", 
                "linear-gradient(45deg, #0047E1 0%, #00DC82 50%, #36E4DA 100%)", 
                "linear-gradient(45deg, #36E4DA 0%, #0047E1 50%, #00DC82 100%)"],
    transition: {
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror" as const
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
  { name: 'Tech Talks', value: '24+', description: 'Community Events pro Jahr' },
  { name: 'Mitglieder', value: '30+', description: 'Aktive Community Members' },
  { name: 'Projekte', value: '50+', description: 'Gestartete Side Projects' },
  { name: 'Erfolge', value: '5+', description: 'Erfolgreiche Startups' },
];

// Beispieldaten für Charts
const monthlyStats = [
  { month: "Jan 24", "Community Events": 4, "Coworking Sessions": 12 },
  { month: "Feb 24", "Community Events": 6, "Coworking Sessions": 18 },
  { month: "Mär 24", "Community Events": 8, "Coworking Sessions": 24 },
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
    description: "High-Speed Internet, dedizierte Workspaces und eine produktive Atmosphäre für fokussiertes Arbeiten.",
    href: "#workspaces",
    cta: "Workspaces ansehen",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10" />
    ),
    className: "lg:col-span-2 lg:row-span-1",
  },
  {
    Icon: IconBuildingCommunity,
    name: "Tech Community",
    description: "Vernetze dich mit anderen Entwicklern, Gründern und Digital Nomads. Weekly Meetups und Skill-Sharing Events.",
    href: "#community",
    cta: "Community kennenlernen",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10" />
    ),
    className: "lg:row-span-2",
  },
  {
    Icon: IconChartBar,
    name: "Community Aktivität",
    description: "Wachsende Anzahl an Events und Coworking Sessions",
    href: "#stats",
    cta: "Statistiken ansehen",
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
    name: "Zimmer-Übersicht",
    description: "Verschiedene Zimmertypen für unterschiedliche Bedürfnisse",
    href: "#rooms",
    cta: "Details ansehen",
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
    name: "Ausstattung",
    description: "Moderne Infrastruktur für produktives Arbeiten",
    href: "#amenities",
    cta: "Mehr erfahren",
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
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleApply = (room: Room) => {
    setSelectedRoom(room);
    setShowApplicationModal(true);
  };

  const handleCloseModal = () => {
    setShowApplicationModal(false);
    setSelectedRoom(null);
  };

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <motion.div 
          className="relative overflow-hidden rounded-3xl mb-12"
          variants={gradientVariants}
          initial="initial"
          animate="animate"
        >
          {/* Gradient overlay filter */}
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] z-0" />
          
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
              Charmantes Wohnhaus in Omes, nahe Innsbruck, mit spektakulärem Bergblick. 
              Direkt am Steilhang gelegen bietet das Haus auf drei Ebenen insgesamt 244,13m² 
              Wohnfläche und 160,25m² Nebenflächen.
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
                Zimmer entdecken
              </motion.button>
              <motion.div className="flex gap-6">
                <IconButton icon={<IconBrandGithub />} href="https://github.com/epicwg" />
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
                        {feature.name === "Community Aktivität" && (
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
                        
                        {feature.name === "Zimmer-Übersicht" && (
                          <div className="mt-4 min-h-[16rem] h-64 relative">
                            {roomTypeData.length === 0 ? (
                              <div className="flex items-center justify-center h-full">
                                <Text>Keine Daten verfügbar</Text>
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
                                    <Text className="text-sm text-gray-600">Zimmer Total</Text>
                                    <Text className="text-xs text-gray-500 mt-1">
                                      {epicwgData.rooms.filter(room => room.available).length} verfügbar
                                    </Text>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        
                        {feature.name === "Ausstattung" && (
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

        {/* Available Rooms mit Hover KPIs */}
        <div id="rooms" className="scroll-mt-8 mb-16">
          <Title className="text-2xl font-bold mb-8" id="rooms">Verfügbare Zimmer</Title>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {epicwgData.rooms.map((room) => (
              <RoomCard 
                key={room.id} 
                room={room} 
                onApply={(roomId) => handleApply(room)} 
              />
            ))}
          </div>
        </div>

        {showApplicationModal && selectedRoom && (
          <ApplicationModal
            room={selectedRoom}
            onClose={handleCloseModal}
            isOpen={showApplicationModal}
          />
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
          <span> {new Date().getFullYear()} - powered by libra innvoation flexco
          </span>
        </div>
      </footer>
    </div>
  );
}
