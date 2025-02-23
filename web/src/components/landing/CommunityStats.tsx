import { Card, Text } from "@tremor/react";
import { IconCalendarEvent, IconUsers, IconCode, IconRocket } from '@tabler/icons-react';

export const communityStats = [
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

export const CommunityStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {communityStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.name} className="p-4">
            <div className="flex items-center gap-2">
              <Icon size={24} />
              <Text>{stat.name}</Text>
            </div>
            <Text className="text-2xl font-bold mt-2">{stat.value}</Text>
            <Text className="text-sm text-gray-600">{stat.description}</Text>
          </Card>
        );
      })}
    </div>
  );
};
