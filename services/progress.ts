import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const LOCAL_KEY = 'mabson-blast-progress-v2';

export type CloudProgress = {
  user_id: string;
  xp: number;
  streak: number;
  current_level: number;
  best_score: number;
  best_scores?: Record<string, number>;
  unlocks?: Record<string, number>;
  badges?: Array<{ id: string; label: string; unlockedAt: number }>;
  updated_at?: string;
};

export async function saveLocalProgress(progress: Omit<CloudProgress, 'user_id'>) {
  await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(progress));
}

export async function loadLocalProgress(): Promise<Omit<CloudProgress, 'user_id'> | null> {
  const raw = await AsyncStorage.getItem(LOCAL_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function syncProgress(userId: string, progress: Omit<CloudProgress, 'user_id'>) {
  if (!supabase) return saveLocalProgress(progress);
  const payload = { user_id: userId, ...progress, updated_at: new Date().toISOString() };
  const { error } = await supabase.from('player_progress').upsert(payload, { onConflict: 'user_id' });
  if (error) throw error;
  await saveLocalProgress(progress);
}

export async function mergeCloudProgress(userId: string, local: Omit<CloudProgress, 'user_id'>) {
  const cloud = await loadCloudProgress(userId);
  if (!cloud) {
    await syncProgress(userId, local);
    return local;
  }
  const merged = {
    xp: Math.max(local.xp, cloud.xp),
    streak: Math.max(local.streak, cloud.streak),
    current_level: Math.max(local.current_level, cloud.current_level),
    best_score: Math.max(local.best_score, cloud.best_score),
    best_scores: Object.fromEntries([...new Set([...Object.keys(local.best_scores ?? {}), ...Object.keys(cloud.best_scores ?? {})])].map((key) => [key, Math.max(local.best_scores?.[key] ?? 0, cloud.best_scores?.[key] ?? 0)])),
    unlocks: Object.fromEntries([...new Set([...Object.keys(local.unlocks ?? {}), ...Object.keys(cloud.unlocks ?? {})])].map((key) => [key, Math.max(local.unlocks?.[key] ?? 1, cloud.unlocks?.[key] ?? 1)])),
    badges: [...(local.badges ?? []), ...(cloud.badges ?? [])].filter((badge, i, arr) => arr.findIndex((b) => b.id === badge.id) === i),
  };
  await syncProgress(userId, merged);
  return merged;
}

export async function loadCloudProgress(userId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('player_progress').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data as CloudProgress | null;
}


export async function submitLeaderboardScore(userId: string, category: string, score: number) {
  if (!supabase) return null;
  if (!userId || score < 0 || score > 100) throw new Error('Invalid leaderboard score');
  const { data, error } = await supabase.rpc('submit_leaderboard_score', { p_category: category, p_score: score });
  if (error) throw error;
  return data;
}

export async function getLeaderboard(category?: string, limit = 20) {
  if (!supabase) return [];
  let query = supabase.from('leaderboard').select('user_id,player_name,score,category,created_at').order('score', { ascending: false }).limit(limit);
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
