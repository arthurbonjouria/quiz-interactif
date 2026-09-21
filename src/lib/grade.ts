// Note sur 10 pour les campagnes avec vidéo obligatoire : bonnes réponses / total, sans bonus de rapidité.
export function computeGradeOutOf10(correctCount: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  return Math.round((correctCount / totalQuestions) * 10);
}
