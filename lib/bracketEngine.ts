import type { Movie, BracketState, BracketFilters } from '@/types';

// ── Filtering ────────────────────────────────────────────────────────────────

export function applyFilters(
  movies: Movie[],
  filters: BracketFilters,
): Movie[] {
  return movies.filter((m) => {
    if (filters.genres.length > 0) {
      if (!m.genres?.some((g) => filters.genres.includes(g))) return false;
    }
    if (filters.decades.length > 0) {
      const decade = Math.floor(m.year / 10) * 10;
      if (!filters.decades.includes(decade)) return false;
    }
    if (filters.maxRuntime !== null) {
      if (m.runtime && m.runtime > filters.maxRuntime) return false;
    }
    if (filters.streamingServices.length > 0) {
      if (
        !m.streamingProviders?.some((s) =>
          filters.streamingServices.includes(s),
        )
      )
        return false;
    }
    return true;
  });
}

export const DEFAULT_FILTERS: BracketFilters = {
  genres: [],
  decades: [],
  maxRuntime: null,
  streamingServices: [],
};

// ── Bracket creation ─────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createBracket(movies: Movie[]): BracketState {
  return {
    rounds: [shuffle(movies)],
    currentRound: 0,
    currentMatchupIndex: 0,
    winner: null,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function getCurrentMatchup(state: BracketState): [Movie, Movie] | null {
  if (state.winner) return null;
  const movies = state.rounds[state.currentRound];
  const i = state.currentMatchupIndex * 2;
  if (i + 1 >= movies.length) return null;
  return [movies[i], movies[i + 1]];
}

export function getRoundInfo(state: BracketState) {
  const movies = state.rounds[state.currentRound];
  const matchupsTotal = Math.floor(movies.length / 2);
  const matchupNumber = state.currentMatchupIndex + 1;
  const roundNumber = state.currentRound + 1;
  const totalRounds = Math.ceil(Math.log2(state.rounds[0].length));
  return { roundNumber, totalRounds, matchupNumber, matchupsTotal };
}

// ── Advancement ───────────────────────────────────────────────────────────────

export function pickWinner(state: BracketState, picked: Movie): BracketState {
  if (state.winner) return state;

  const current = state.rounds[state.currentRound];
  const matchupsTotal = Math.floor(current.length / 2);
  const hasBye = current.length % 2 === 1;

  const nextRoundSoFar = state.rounds[state.currentRound + 1] ?? [];
  const updatedNext = [...nextRoundSoFar, picked];
  const newMatchupIndex = state.currentMatchupIndex + 1;
  const roundDone = newMatchupIndex >= matchupsTotal;

  const newRounds = [...state.rounds];

  if (roundDone) {
    const finalNext = hasBye
      ? [...updatedNext, current[current.length - 1]]
      : updatedNext;
    newRounds[state.currentRound + 1] = finalNext;

    if (finalNext.length === 1) {
      return {
        rounds: newRounds,
        currentRound: state.currentRound + 1,
        currentMatchupIndex: 0,
        winner: finalNext[0],
      };
    }
    return {
      rounds: newRounds,
      currentRound: state.currentRound + 1,
      currentMatchupIndex: 0,
      winner: null,
    };
  }

  newRounds[state.currentRound + 1] = updatedNext;
  return { ...state, rounds: newRounds, currentMatchupIndex: newMatchupIndex };
}
