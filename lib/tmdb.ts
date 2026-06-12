import type { Movie } from '@/types';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE = 'https://api.themoviedb.org/3';
export const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

type GenreMap = Record<number, string>;

let cachedGenreMap: GenreMap | null = null;

async function fetchGenreMap(): Promise<GenreMap> {
  if (cachedGenreMap) return cachedGenreMap;
  const res = await fetch(
    `${BASE}/genre/movie/list?api_key=${API_KEY}&language=en-US`,
  );
  const data = await res.json();
  cachedGenreMap = Object.fromEntries(
    (data.genres as { id: number; name: string }[]).map((g) => [g.id, g.name]),
  );
  return cachedGenreMap;
}

type SearchHit = {
  id: number;
  poster_path: string | null;
  vote_average: number;
  overview: string;
  genre_ids: number[];
};

async function searchMovie(
  name: string,
  year: number,
): Promise<SearchHit | null> {
  const url = `${BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(name)}&year=${year}&language=en-US`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.results as SearchHit[])?.[0] ?? null;
}

async function getRuntime(tmdbId: number): Promise<number | undefined> {
  const res = await fetch(
    `${BASE}/movie/${tmdbId}?api_key=${API_KEY}&language=en-US`,
  );
  const data = await res.json();
  return data.runtime || undefined;
}

async function getStreamingProviders(tmdbId: number): Promise<string[]> {
  const res = await fetch(
    `${BASE}/movie/${tmdbId}/watch/providers?api_key=${API_KEY}`,
  );
  const data = await res.json();
  const flatrate = (data.results?.US?.flatrate ?? []) as {
    provider_name: string;
  }[];
  return flatrate.map((p) => p.provider_name);
}

async function enrichOne(movie: Movie, genreMap: GenreMap): Promise<Movie> {
  const hit = await searchMovie(movie.name, movie.year);
  if (!hit) return movie;

  const [runtime, streamingProviders] = await Promise.all([
    getRuntime(hit.id),
    getStreamingProviders(hit.id),
  ]);

  return {
    ...movie,
    tmdbId: hit.id,
    poster: hit.poster_path ? `${IMG_BASE}${hit.poster_path}` : undefined,
    rating: hit.vote_average,
    overview: hit.overview,
    genres: hit.genre_ids.map((id) => genreMap[id]).filter(Boolean),
    runtime,
    streamingProviders,
  };
}

async function withConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let i = 0;
  async function worker() {
    while (i < items.length) {
      await fn(items[i++]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
}

export async function enrichMovies(
  movies: Movie[],
  onProgress: (done: number, total: number, currentName: string) => void,
): Promise<Movie[]> {
  const genreMap = await fetchGenreMap();
  const results: Movie[] = new Array(movies.length);
  let done = 0;

  await withConcurrency(movies, 8, async (movie) => {
    const idx = movies.indexOf(movie);
    onProgress(done, movies.length, movie.name);
    results[idx] = await enrichOne(movie, genreMap);
    done++;
    onProgress(done, movies.length, movie.name);
  });

  return results;
}
