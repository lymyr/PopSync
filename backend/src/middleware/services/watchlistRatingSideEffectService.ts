import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.ts";
import type { PostReviewBody, UpdateReviewBody } from "../validation/ReviewValidation.ts";

export default async function watchlistRatingSideEffectService(req: Request<{}, {}, PostReviewBody | UpdateReviewBody>, res: Response, next: NextFunction) {
    const userId = req.user?.id as number

    if (req.updateRating) {
        if (req.updateRating.movieId)
            await prisma.watchListMovie.update({
                where: {
                    userId_movieId: {
                        userId,
                        movieId: req.updateRating.movieId
                    }
                },
                data: {
                    rating: req.body.rating
                }
            })
        else if (req.updateRating.seriesId)
            await prisma.watchListSeries.update({
                where: {
                    userId_seriesId: {
                        userId,
                        seriesId: req.updateRating.seriesId
                    }
                },
                data: {
                    rating: req.body.rating
                }
            })
    }
    next()
}