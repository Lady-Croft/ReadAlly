export const SECONDS_PER_POINT = 180;

export const calculateBaseSessionPoints = (durationSeconds: number): number => {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  return Math.floor(durationSeconds / SECONDS_PER_POINT);
};

export const calculateSessionPoints = (durationSeconds: number, isPerfectQuiz: boolean): number => {
  const basePoints = calculateBaseSessionPoints(durationSeconds);
  return isPerfectQuiz ? basePoints * 2 : basePoints;
};

const RANK_TIERS: Array<{ minPoints: number; rank: string }> = [
  { minPoints: 2400, rank: 'Gold I' },
  { minPoints: 1900, rank: 'Gold II' },
  { minPoints: 1500, rank: 'Gold III' },
  { minPoints: 1150, rank: 'Silver I' },
  { minPoints: 850, rank: 'Silver II' },
  { minPoints: 600, rank: 'Silver III' },
  { minPoints: 400, rank: 'Silver IV' },
  { minPoints: 250, rank: 'Bronze I' },
  { minPoints: 150, rank: 'Bronze II' },
  { minPoints: 75, rank: 'Bronze III' },
  { minPoints: 0, rank: 'Initiate' },
];

export const getRankFromPoints = (points: number): string => {
  const safePoints = Number.isFinite(points) ? points : 0;
  return RANK_TIERS.find(tier => safePoints >= tier.minPoints)?.rank || 'Initiate';
};
