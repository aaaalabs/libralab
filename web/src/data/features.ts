import {
  IconBrain,
  IconMountain,
  IconDevices,
  IconHome,
  IconUsers,
  IconCalendarEvent,
  IconBike
} from '@tabler/icons-react';

type FeatureTitle = "Deep Work, Maximum Focus" | "AI Innovation Hub & Tech Community" | "Innsbruck – Where Innovation Meets Adventure";

interface Feature {
  title: FeatureTitle;
  description: string;
  imageUrl: string;
  groups: {
    title: string;
    features: {
      title: string;
      icon?: typeof IconBrain | typeof IconMountain | typeof IconDevices | typeof IconHome | typeof IconUsers | typeof IconCalendarEvent | typeof IconBike;
    }[];
  }[];
}

export const features: Feature[] = [
  {
    title: "Deep Work, Maximum Focus",
    description: "Productivity starts with the right environment. At EpicWG, you get a space designed for deep work, creativity, and high-level innovation.",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
    groups: [
      {
        title: "Workspace Essentials",
        features: [
          { title: "Height-adjustable desk", icon: IconDevices },
          { title: "Ergonomic chair" },
          { title: "Ultra-wide monitor" },
          { title: "Skylink high-speed internet" },
          { title: "Smart lighting" }
        ]
      },
      {
        title: "Coworking & Collaboration",
        features: [
          { title: "Open workspace" },
          { title: "Whiteboards & brainstorming zones" },
          { title: "Private meeting room" },
          { title: "Freeflow coffee & snacks" }
        ]
      }
    ]
  },
  {
    title: "AI Innovation Hub & Tech Community",
    description: "EpicWG is an innovation hub for AI professionals, tech founders, and remote entrepreneurs. It's where new ideas take shape, connections are built, and breakthroughs happen.",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200",
    groups: [
      {
        title: "Knowledge & Resources",
        features: [
          { title: "AI & tech workshops", icon: IconBrain },
          { title: "Access to local GPU power" },
          { title: "Partnerships with universities & incubators" }
        ]
      },
      {
        title: "Networking & Growth",
        features: [
          { title: "Live & work alongside AI professionals", icon: IconUsers },
          { title: "Exclusive startup & investor events" },
          { title: "Mastermind sessions" }
        ]
      }
    ]
  },
  {
    title: "Innsbruck – Where Innovation Meets Adventure",
    description: "A place where cutting-edge technology, outdoor adventure, and high-quality living go hand in hand. Innsbruck offers the perfect balance between urban energy and Alpine nature.",
    imageUrl: "https://images.unsplash.com/photo-1516129807152-0cbb96361c96?auto=format&fit=crop&q=80&w=1200",
    groups: [
      {
        title: "Tech & Business",
        features: [
          { title: "AI & quantum research hub", icon: IconBrain },
          { title: "Startup accelerators" },
          { title: "International connectivity" }
        ]
      },
      {
        title: "Outdoor & Lifestyle",
        features: [
          { title: "Ski resorts & mountain bike trails", icon: IconMountain },
          { title: "Hiking & climbing" },
          { title: "Vibrant city with culture & events" }
        ]
      }
    ]
  }
];
