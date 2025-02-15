import { Card, Title, DonutChart } from '@tremor/react';
import { EvaluationResult } from '../../types/evaluation';

interface ScoreChartProps {
  result: EvaluationResult;
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ result }) => {
  const data = [
    {
      name: 'RICE Score',
      value: result.riceScore
    },
    {
      name: 'ROI Score',
      value: result.roiScore
    },
    {
      name: 'Time to Market',
      value: result.timeToMarketScore
    },
    {
      name: 'Synergie',
      value: result.synergieScore
    }
  ];

  return (
    <Card className="max-w-lg">
      <Title>Bewertungsübersicht</Title>
      <DonutChart
        className="mt-6"
        data={data}
        category="value"
        index="name"
        valueFormatter={(number) => `${number.toFixed(2)}%`}
        colors={["blue", "cyan", "indigo", "violet"]}
      />
    </Card>
  );
};
