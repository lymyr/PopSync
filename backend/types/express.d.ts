import type { Movie, MovieDetails, Search, TV, TvShowDetails } from "tmdb-ts";
import type { Comment, User as PrismaUserType, Review, Series, Movie as PrismaMovie, WatchListMovie, WatchListSeries, WatchGroup } from "../generated/prisma/client.ts";
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
      lastMovie?: PrismaMovie
      lastSeries?: Series
      lastReview: Review
      watchgroup: WatchGroup
      foundUser: User
    }
    interface Response {
      sendError(status: number, message: string): this;
    }
    interface User extends PrismaUserType {}
  }
}

export {};