import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.ts";
import type { PostReviewBody, UpdateReviewBody } from "../validation/ReviewValidation.ts";

export default async function watchlistRatingSideEffectService(req: Request<{}, {}, PostReviewBody | UpdateReviewBody>, res: Response, next: NextFunction) {
    const userId = req.user?.id as number

    if (req.review?.rating !== req.body.rating || req.wlSeries || req.wlMovie) {
        if (req.review?.movieId || req.wlMovie) {
            const movieId = req.review?.movieId || req.wlMovie?.movieId as number
            await prisma.watchListMovie.update({
                where: {
                    userId_movieId: {
                        userId,
                        movieId
                    }
                },
                data: {
                    rating: req.body.rating
                }
            })
        }
        else if (req.review?.seriesId || req.wlSeries) {
            const seriesId = req.review?.seriesId || req.wlSeries?.seriesId as number
            await prisma.watchListSeries.update({
                where: {
                    userId_seriesId: {
                        userId,
                        seriesId
                    }
                },
                data: {
                    rating: req.body.rating
                }
            })
        }
            
    }
    next()
}