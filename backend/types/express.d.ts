import type { User as PrismaUserType } from "../generated/prisma/client.ts";

declare global {
  namespace Express {
    interface Request {
      errorStatusCode?: number
    }
    interface Response {
      sendError(status: number, message: string): this;
    }
    interface User extends PrismaUserType {}
  }
}

export {};