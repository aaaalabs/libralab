import { Card, Title, BarChart, DonutChart, Metric, Flex } from '@tremor/react';

const communityData = [
  {
    name: 'Active Members',
    value: 8,
  },
  {
    name: 'Pending Applications',
    value: 3,
  },
  {
    name: 'Available Rooms',
    value: 2,
  },
];

const reputationData = [
  {
    name: 'Community Participation',
    value: 40,
  },
  {
    name: 'Task Completion',
    value: 30,
  },
  {
    name: 'Event Organization',
    value: 20,
  },
  {
    name: 'Referrals',
    value: 10,
  },
];

export default function CommunityMetrics() {
  return (
    <Card>
      <Title>Community Dashboard</Title>
      
      <div className="mt-4">
        <Flex>
          <Card>
            <Title>Community Status</Title>
            <BarChart
              data={communityData}
              index="name"
              categories={['value']}
              colors={['blue']}
              className="mt-6"
            />
          </Card>
          
          <Card>
            <Title>Reputation Distribution</Title>
            <DonutChart
              data={reputationData}
              category="value"
              index="name"
              className="mt-6"
            />
          </Card>
        </Flex>
      </div>
      
      <div className="mt-4">
        <Metric>Total Community Reputation: 15,420</Metric>
      </div>
    </Card>
  );
}
