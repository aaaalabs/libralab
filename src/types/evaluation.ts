export interface RICEMetric {
  weight: number;
  value?: number;
  description: string;
}

export interface ROIMetric {
  weight: number;
  value?: number;
  description: string;
}

export interface ProjectMetrics {
  RICE: {
    Reach: RICEMetric;
    Impact: RICEMetric;
    Confidence: RICEMetric;
    Effort: RICEMetric;
  };
  ROI: {
    StartInvestition: ROIMetric;
    MtlZeitersparnis: ROIMetric;
    LaufendeKosten: ROIMetric;
    GeschätzterUmsatz: ROIMetric;
  };
  TimeToMarket: {
    maxDays: number;
    value?: number;
    description: string;
  };
  Synergie: {
    threshold: number;
    value?: number;
    description: string;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  metrics: ProjectMetrics;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface EvaluationResult {
  riceScore: number;
  roiScore: number;
  timeToMarketScore: number;
  synergieScore: number;
  totalScore: number;
  recommendation: string;
}
