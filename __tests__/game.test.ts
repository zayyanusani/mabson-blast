import { calculateLevel, calculateXp, isValidDisplayName } from '../utils/game';

describe('game progression', () => {
  test('awards XP from accuracy', () => {
    expect(calculateXp(0, 3)).toBe(50);
    expect(calculateXp(3, 3)).toBe(150);
  });

  test('calculates levels from XP', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(250)).toBe(2);
    expect(calculateLevel(500)).toBe(3);
  });

  test('validates display names', () => {
    expect(isValidDisplayName('Aisha')).toBe(true);
    expect(isValidDisplayName('')).toBe(false);
    expect(isValidDisplayName('a')).toBe(false);
  });
});
