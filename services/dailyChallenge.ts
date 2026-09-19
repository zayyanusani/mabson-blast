import { supabase } from '../lib/supabase';

export type DailyChallenge = { id: string; challenge_date: string; question_ids: string[] };

export function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export async function getDailyChallenge(): Promise<DailyChallenge | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('id,challenge_date,question_ids')
    .eq('challenge_date', getTodayKey())
    .maybeSingle();
  if (error) throw error;
  return data as DailyChallenge | null;
}
