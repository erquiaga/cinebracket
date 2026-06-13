# cinebracket

Pick your next movie the only fair way: a bracket tournament.

Upload your Letterboxd watchlist CSV and cinebracket seeds a single-elimination bracket from your list. You pick the winner of each matchup until one film is left standing. That's your next watch.

Live at [cinebracket.vercel.app](https://cinebracket.vercel.app)

## Modes

**Solo** -- upload your own watchlist and run the bracket yourself.

**Duo** -- upload two watchlists. The bracket runs from the films you both have on your lists, so the winner is something you both actually want to see.

## Features

- Pulls posters, ratings, genres, and runtime from TMDB for every film in your list
- Filter by genre, runtime, and minimum rating before the bracket starts
- Sign in to save your watchlist so you skip the upload and enrichment step next time
- Forgot password flow via email
- Results page shows the full bracket chart after the tournament

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [Ant Design](https://ant.design) for UI components
- [Framer Motion](https://www.framer.com/motion) for animations
- [Supabase](https://supabase.com) for auth and watchlist storage
- [TMDB API](https://www.themoviedb.org/documentation/api) for movie data

## Running locally

```bash
npm install
npm run dev
```

You need a `.env.local` file with the following:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
```

Then open [http://localhost:3000](http://localhost:3000).

## Getting a Letterboxd CSV

In Letterboxd, go to **Settings > Import & Export > Export Your Data**. This gives you a zip file. The file you want is `watchlist.csv`.

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
