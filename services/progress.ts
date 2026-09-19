import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const LOCAL_KEY = 'mabson-blast-progress-v2';

export type CloudProgress = {
  user_id: string;
  xp: number;
  streak: number;
  current_level: number;
  best_score: number;
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

export async function loadCloudProgress(userId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('player_progress').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data as CloudProgress | null;
}
