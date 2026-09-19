export function calculateXp(correctAnswers: number, totalQuestions: number) {
  if (totalQuestions <= 0) return 0;
  return 50 + Math.round((correctAnswers / totalQuestions) * 100);
}

export function calculateLevel(xp: number) {
  return Math.max(1, Math.floor(xp / 250) + 1);
}

export function isValidDisplayName(name: string) {
  const value = name.trim();
  return value.length >= 2 && value.length <= 40;
}
