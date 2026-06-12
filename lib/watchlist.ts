import { supabase } from './supabase';
import type { Movie } from '@/types';

export type SavedWatchlist = {
  movies: Movie[];
  updatedAt: string;
};

export async function saveWatchlist(
  mode: 'solo' | 'duo',
  movies: Movie[],
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return;

  const { error } = await supabase.from('watchlists').upsert(
    {
      user_id: session.user.id,
      mode,
      movies,
      label: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,mode' },
  );

  if (error) console.error('[watchlist] save error:', error.message);
}

export async function loadWatchlist(
  mode: 'solo' | 'duo',
): Promise<SavedWatchlist | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    console.log('[watchlist] no session, skipping load');
    return null;
  }

  const { data, error } = await supabase
    .from('watchlists')
    .select('movies, updated_at')
    .eq('user_id', session.user.id)
    .eq('mode', mode)
    .maybeSingle();

  if (error) {
    console.error('[watchlist] load error:', error.message, error.code);
    return null;
  }
  if (!data) return null;
  return {
    movies: data.movies as Movie[],
    updatedAt: data.updated_at as string,
  };
}
