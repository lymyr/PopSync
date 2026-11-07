import type { Movie, MovieDetails, Search, TV, TvShowDetails } from "tmdb-ts";
import type { User as PrismaUserType } from "../generated/prisma/client.ts";

declare global {
  namespace Express {
    interface Request {
      errorStatusCode?: number;
      tmdbSearch: Search<TV> | Search<Movie>;
      movieDetails: MovieDetails;
      seriesDetails: TvShowDetails;
      updateRating?: 
        { seriesId: undefined | null; movieId: number } | 
        { seriesId: number; movieId: undefined | null };
    }
    interface Response {
      sendError(status: number, message: string): this;
    }
    interface User extends PrismaUserType {}
  }
}

export {};