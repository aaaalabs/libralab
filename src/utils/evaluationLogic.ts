import { Project, EvaluationResult } from '../types/evaluation';

const WEIGHTS = {
  RICE: {
    Reach: 0.3,
    Impact: 0.4,
    Confidence: 0.2,
    Effort: -0.1
  },
  ROI: {
    StartInvestition: 0.5,
    MtlZeitersparnis: 0.2,
    LaufendeKosten: -0.3,
    GeschätzterUmsatz: 0.6
  }
};

export function calculateRICEScore(project: Project): number {
  const { Reach, Impact, Confidence, Effort } = project.metrics.RICE;
  
  // Normalize values to 0-1 scale
  const normalizedValues = {
    reach: ((Reach.value || 0) / 100) * WEIGHTS.RICE.Reach,
    impact: ((Impact.value || 0) / 100) * WEIGHTS.RICE.Impact,
    confidence: ((Confidence.value || 0) / 100) * WEIGHTS.RICE.Confidence,
    effort: (Math.max(0, 100 - (Effort.value || 0)) / 100) * Math.abs(WEIGHTS.RICE.Effort)
  };

  // Calculate weighted sum
  const score = (
    normalizedValues.reach +
    normalizedValues.impact +
    normalizedValues.confidence +
    normalizedValues.effort
  ) * 100;

  // Normalize to 0-100 scale
  return Math.min(100, Math.max(0, score));
}

export function calculateROIScore(project: Project): number {
  const { StartInvestition, MtlZeitersparnis, LaufendeKosten, GeschätzterUmsatz } = project.metrics.ROI;

  // Normalize values to 0-1 scale
  const normalizedValues = {
    startInvestition: (Math.max(0, 100 - (StartInvestition.value || 0)) / 100) * WEIGHTS.ROI.StartInvestition,
    mtlZeitersparnis: ((MtlZeitersparnis.value || 0) / 100) * WEIGHTS.ROI.MtlZeitersparnis,
    laufendeKosten: (Math.max(0, 100 - (LaufendeKosten.value || 0)) / 100) * Math.abs(WEIGHTS.ROI.LaufendeKosten),
    geschätzterUmsatz: ((GeschätzterUmsatz.value || 0) / 100) * WEIGHTS.ROI.GeschätzterUmsatz
  };

  // Calculate weighted sum
  const score = (
    normalizedValues.startInvestition +
    normalizedValues.mtlZeitersparnis +
    normalizedValues.laufendeKosten +
    normalizedValues.geschätzterUmsatz
  ) * 100;

  // Normalize to 0-100 scale
  return Math.min(100, Math.max(0, score));
}

export function calculateTimeToMarketScore(project: Project): number {
  const { maxDays, value } = project.metrics.TimeToMarket;
  if (!value) return 0;

  // Calculate score based on how much earlier than maxDays the project can be delivered
  const score = ((maxDays - value) / maxDays) * 100;
  return Math.min(100, Math.max(0, score));
}

export function calculateSynergieScore(project: Project): number {
  const { threshold, value } = project.metrics.Synergie;
  if (!value) return 0;

  // Calculate score based on how much higher than threshold the synergy is
  const score = (value / threshold) * 100;
  return Math.min(100, Math.max(0, score));
}

export function generateRecommendation(scores: {
  riceScore: number;
  roiScore: number;
  timeToMarketScore: number;
  synergieScore: number;
  totalScore: number;
}): string {
  const { riceScore, roiScore, timeToMarketScore, synergieScore, totalScore } = scores;

  if (totalScore >= 80) {
    return "Sofort umsetzen: Hervorragende Bewertungen in allen Bereichen";
  } else if (totalScore >= 70) {
    if (timeToMarketScore >= 80) {
      return "Zeitnah umsetzen: Gute Gesamtbewertung mit schneller Marktreife";
    } else {
      return "Prioritär umsetzen: Starke Bewertung, Zeitplan optimieren";
    }
  } else if (totalScore >= 60) {
    if (roiScore >= 70) {
      return "Bedingt umsetzen: Guter ROI, andere Aspekte prüfen";
    } else if (synergieScore >= 70) {
      return "Strategisch evaluieren: Hohe Synergieeffekte, Wirtschaftlichkeit prüfen";
    }
    return "Detailliert prüfen: Mittlere Gesamtbewertung";
  } else if (totalScore >= 50) {
    return "Zurückstellen: Verbesserungspotential identifizieren";
  }
  
  return "Nicht empfohlen: Bewertungen unter Erwartungen";
}

export function evaluateProject(project: Project): EvaluationResult {
  // Calculate individual scores
  const riceScore = calculateRICEScore(project);
  const roiScore = calculateROIScore(project);
  const timeToMarketScore = calculateTimeToMarketScore(project);
  const synergieScore = calculateSynergieScore(project);

  // Calculate total score with weighted importance
  const totalScore = (
    riceScore * 0.3 +      // 30% weight for RICE score
    roiScore * 0.3 +       // 30% weight for ROI score
    timeToMarketScore * 0.2 + // 20% weight for Time to Market
    synergieScore * 0.2    // 20% weight for Synergy
  );

  // Generate recommendation based on scores
  const recommendation = generateRecommendation({
    riceScore,
    roiScore,
    timeToMarketScore,
    synergieScore,
    totalScore
  });

  return {
    riceScore,
    roiScore,
    timeToMarketScore,
    synergieScore,
    totalScore,
    recommendation
  };
}
