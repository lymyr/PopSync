import type { Movie, MovieDetails, Search, TV, TvShowDetails } from "tmdb-ts";
import type { User as PrismaUserType, Review, WatchListMovie, WatchListSeries } from "../generated/prisma/client.ts";

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
    }
    interface Response {
      sendError(status: number, message: string): this;
    }
    interface User extends PrismaUserType {}
  }
}

export {};