import type { Movie } from '@/types';
import { normalizeTitle } from './parseCsv';

export function intersectLists(listA: Movie[], listB: Movie[]): Movie[] {
  const keyB = new Set(listB.map((m) => `${normalizeTitle(m.name)}|${m.year}`));

  return listA.filter((m) => keyB.has(`${normalizeTitle(m.name)}|${m.year}`));
}
