export type Movie = {
  name: string;
  year: number;
  letterboxdUri: string;
  tmdbId?: number;
  poster?: string;
  genres?: string[];
  runtime?: number;
  rating?: number;
  overview?: string;
  streamingProviders?: string[];
};

export type BracketState = {
  rounds: Movie[][];
  currentRound: number;
  currentMatchupIndex: number;
  winner: Movie | null;
};

export type Mode = 'solo' | 'duo';

export type RuntimeLimit = 90 | 120 | 150 | 180 | null;

export type BracketFilters = {
  genres: string[];
  decades: number[];
  maxRuntime: RuntimeLimit;
  streamingServices: string[];
};
