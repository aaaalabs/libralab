import { Grid } from '@tremor/react';
import { MetricCard } from '../shared/MetricCard';
import { Project } from '../../types/evaluation';

interface ProjectMetricsProps {
  project: Project;
}

export const ProjectMetrics: React.FC<ProjectMetricsProps> = ({ project }) => {
  const { metrics } = project;

  return (
    <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
      {/* RICE Metrics */}
      <MetricCard
        title="Reach"
        metric={metrics.RICE.Reach.value || 0}
        description={metrics.RICE.Reach.description}
        color="blue"
      />
      <MetricCard
        title="Impact"
        metric={metrics.RICE.Impact.value || 0}
        description={metrics.RICE.Impact.description}
        color="cyan"
      />
      <MetricCard
        title="Confidence"
        metric={metrics.RICE.Confidence.value || 0}
        description={metrics.RICE.Confidence.description}
        color="indigo"
      />
      <MetricCard
        title="Effort"
        metric={metrics.RICE.Effort.value || 0}
        description={metrics.RICE.Effort.description}
        color="violet"
      />

      {/* ROI Metrics */}
      <MetricCard
        title="Start Investition"
        metric={metrics.ROI.StartInvestition.value || 0}
        description={metrics.ROI.StartInvestition.description}
        color="emerald"
      />
      <MetricCard
        title="Monatliche Zeitersparnis"
        metric={metrics.ROI.MtlZeitersparnis.value || 0}
        description={metrics.ROI.MtlZeitersparnis.description}
        color="green"
      />
      <MetricCard
        title="Laufende Kosten"
        metric={metrics.ROI.LaufendeKosten.value || 0}
        description={metrics.ROI.LaufendeKosten.description}
        color="red"
      />
      <MetricCard
        title="Geschätzter Umsatz"
        metric={metrics.ROI.GeschätzterUmsatz.value || 0}
        description={metrics.ROI.GeschätzterUmsatz.description}
        color="amber"
      />
    </Grid>
  );
};
