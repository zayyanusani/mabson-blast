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


export async function getTodayAttempt(userId: string, challengeId: string) {
  if (!supabase) return false;
  const { data, error } = await supabase.from('challenge_attempts').select('id').eq('user_id', userId).eq('challenge_id', challengeId).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function submitDailyAttempt(userId: string, challengeId: string, score: number, totalQuestions: number) {
  if (!supabase) return;
  const { error } = await supabase.from('challenge_attempts').insert({ user_id: userId, challenge_id: challengeId, score, total_questions: totalQuestions });
  if (error) throw error;
}
