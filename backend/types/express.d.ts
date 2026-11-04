import type { Movie, Search, TV } from "tmdb-ts";
import type { User as PrismaUserType } from "../generated/prisma/client.ts";

declare global {
  namespace Express {
    interface Request {
      errorStatusCode?: number;
      tmdbSearch: Search<TV> | Search<Movie>
    }
    interface Response {
      sendError(status: number, message: string): this;
    }
    interface User extends PrismaUserType {}
  }
}

export {};