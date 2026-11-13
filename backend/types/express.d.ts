import type { Movie, MovieDetails, Search, TV, TvShowDetails } from "tmdb-ts";
import type { Comment, User as PrismaUserType, Review, Series, Movie as PrismaMovie, WatchListMovie, WatchListSeries } from "../generated/prisma/client.ts";
import type { WatchlistMovieComparisonTypes, WatchlistSeriesComparisonTypes } from "../src/middleware/services/compareWatchlistService.ts";

declare global {
  namespace Express {
    interface Request {
      errorStatusCode?: number;
      tmdbSearch: Search<TV> | Search<Movie>;
      movieDetails: MovieDetails;
      seriesDetails: TvShowDetails;
      review?: Review;
      wlMovie?: WatchListMovie;
      wlSeries?: WatchListSeries;
      softDelComment?: boolean;
      comment?: Comment;
      watchlistComparison: {
        movies: WatchlistMovieComparisonTypes[];
        series: WatchlistSeriesComparisonTypes[];
      }
      lastMovie: PrismaMovie
      lastSeries: Series
    }
    interface Response {
      sendError(status: number, message: string): this;
    }
    interface User extends PrismaUserType {}
  }
}

export {};