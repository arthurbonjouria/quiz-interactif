// Scoring type Kahoot : 0 si faux ou hors délai, sinon un score dégressif
// entre 50% et 100% des points max selon la rapidité de la réponse.
export function computeScore(params: {
  correct: boolean;
  points: number;
  responseTimeMs: number;
  timeLimitSec: number;
}): number {
  const { correct, points, responseTimeMs, timeLimitSec } = params;
  const timeLimitMs = timeLimitSec * 1000;

  if (!correct || responseTimeMs > timeLimitMs) return 0;

  const elapsedRatio = Math.min(Math.max(responseTimeMs / timeLimitMs, 0), 1);
  const speedFactor = 0.5 + 0.5 * (1 - elapsedRatio);
  return Math.round(points * speedFactor);
}
