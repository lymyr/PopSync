import type { Request, Response, NextFunction } from "express";

interface PrismaError extends Error {
    code?: string;
}

export default function handleUniqueReview(err: PrismaError, req:Request, res: Response, _next: NextFunction) {
    if (err.code == "P2002") {
        return res.status(400).send("Review already exists. Please update or delete your existing review")
    }

    throw err
}