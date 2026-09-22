import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export type LeaderboardEntry = {
  id?: string;
  user_id?: string;
  player_name: string;
  score: number;
  category: string;
  created_at?: string;
};

const cacheKey = 'mabson-blast-leaderboard-cache';

export async function submitScore(entry: LeaderboardEntry) {
  const cached = await getCachedScores();
  const next = [entry, ...cached].sort((a, b) => b.score - a.score).slice(0, 50);
  await AsyncStorage.setItem(cacheKey, JSON.stringify(next));

  if (!supabase) return next;

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return next;

  const { error } = await supabase.from('leaderboard').insert({
    ...entry,
    user_id: userData.user.id,
  });
  if (error) throw error;

  return next;
}

export async function getLeaderboard(category?: string): Promise<LeaderboardEntry[]> {
  if (!supabase) return getCachedScores(category);

  let query = supabase
    .from('leaderboard')
    .select('id, user_id, player_name, score, category, created_at')
    .order('score', { ascending: false })
    .limit(50);

  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error || !data) return getCachedScores(category);

  await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
  return data;
}

async function getCachedScores(category?: string): Promise<LeaderboardEntry[]> {
  const raw = await AsyncStorage.getItem(cacheKey);
  const scores = raw ? (JSON.parse(raw) as LeaderboardEntry[]) : [];
  return category ? scores.filter((item) => item.category === category) : scores;
}
