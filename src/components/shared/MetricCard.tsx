import { Card, Metric, Text } from '@tremor/react';

interface MetricCardProps {
  title: string;
  metric: number;
  description?: string;
  color?: 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone' | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  metric,
  description,
  color = 'blue'
}) => {
  return (
    <Card className="max-w-xs mx-auto" decoration="top" decorationColor={color}>
      <Text>{title}</Text>
      <Metric>{metric.toFixed(2)}</Metric>
      {description && (
        <Text className="mt-2 text-sm text-gray-500">{description}</Text>
      )}
    </Card>
  );
};
