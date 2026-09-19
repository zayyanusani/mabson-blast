import AsyncStorage from '@react-native-async-storage/async-storage';

export type LeaderboardEntry = {
  id?: string;
  player_name: string;
  score: number;
  category: string;
  created_at?: string;
};

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const cacheKey = 'mabson-blast-leaderboard-cache';

export async function submitScore(entry: LeaderboardEntry) {
  const cached = await getCachedScores();
  const next = [entry, ...cached].sort((a, b) => b.score - a.score).slice(0, 50);
  await AsyncStorage.setItem(cacheKey, JSON.stringify(next));

  if (!url || !key) return next;
  const response = await fetch(`${url}/rest/v1/leaderboard`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error(`Leaderboard request failed: ${response.status}`);
  return next;
}

export async function getLeaderboard(category?: string): Promise<LeaderboardEntry[]> {
  if (!url || !key) return getCachedScores(category);
  const filter = category ? `&category=eq.${encodeURIComponent(category)}` : '';
  const response = await fetch(`${url}/rest/v1/leaderboard?select=*&order=score.desc&limit=50${filter}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) return getCachedScores(category);
  const result = (await response.json()) as LeaderboardEntry[];
  await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
  return result;
}

async function getCachedScores(category?: string) {
  const raw = await AsyncStorage.getItem(cacheKey);
  const scores = raw ? (JSON.parse(raw) as LeaderboardEntry[]) : [];
  return category ? scores.filter((item) => item.category === category) : scores;
}
