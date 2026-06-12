import Papa from 'papaparse';
import type { Movie } from '@/types';

type LetterboxdRow = {
  Date: string;
  Name: string;
  Year: string;
  'Letterboxd URI': string;
};

export function parseCsv(file: File): Promise<Movie[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<LetterboxdRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        if (results.errors.length && !results.data.length) {
          reject(new Error(results.errors[0].message));
          return;
        }
        const movies: Movie[] = results.data
          .filter((row) => row.Name?.trim() && row.Year?.trim())
          .map((row) => ({
            name: row.Name.trim(),
            year: parseInt(row.Year.trim(), 10),
            letterboxdUri: row['Letterboxd URI']?.trim() ?? '',
          }))
          .filter((m) => !isNaN(m.year));
        resolve(movies);
      },
      error: (err) => reject(new Error(err.message)),
    });
  });
}

export function normalizeTitle(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
