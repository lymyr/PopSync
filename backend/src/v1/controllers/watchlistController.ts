import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";
import type { BodyPayload } from "../../middleware/validation/WatchListValidation.ts";

export async function getWatchList(req: Request<{userId?: number}>, res: Response) {
    res.json({
        data: req.watchlistComparison
    })
}

export async function addToMovieWatchList(req: Request<{}, {}, BodyPayload>, res: Response) {
    const userId = req.user?.id as number
    await prisma.watchListMovie.create({
        data: {
            userId,
            movieId: req.body.id,
            hasWatched: req.body.hasWatched,
            rating: req.body.rating
        }
    })
    res.sendStatus(201)
}

export async function updateMovieWatchList(req: Request<{}, {}, BodyPayload>, res: Response) {
    const userId = req.user?.id as number
    await prisma.watchListMovie.update({
        where: {
            userId_movieId: {
                userId,
                movieId: req.body.id
            }
        },
        data: {
            hasWatched: req.body.hasWatched,
            rating: req.body.rating
        }
    })

    res.sendStatus(200)
}

export async function deleteMovieWatchList(req: Request<{}, {}, Omit<Omit<BodyPayload, "hasWatched">, "rating">>, res: Response) {
    const userId = req.user?.id as number

    await prisma.watchListMovie.delete({
        where: {
            userId_movieId: {
                userId,
                movieId: req.body.id
            }
        }
    })
    res.sendStatus(200)
}

export async function addToSeriesWatchList(req: Request<{}, {}, BodyPayload>, res: Response) {
    const userId = req.user?.id as number
    await prisma.watchListSeries.create({
        data: {
            userId,
            seriesId: req.body.id,
            hasWatched: req.body.hasWatched
        }
    })
    res.sendStatus(201)
}


export async function updateSeriesWatchList(req: Request<{}, {}, BodyPayload>, res: Response) {
    const userId = req.user?.id as number
    
    await prisma.watchListSeries.update({
        where: {
            userId_seriesId: {
                userId,
                seriesId: req.body.id
            }
        },
        data: {
            hasWatched: req.body.hasWatched,
            rating: req.body.rating
        }
    })

    res.sendStatus(200)
}

export async function deleteSeriesWatchList(req: Request<{}, {}, Omit<Omit<BodyPayload, "hasWatched">, "rating">>, res: Response) {
    const userId = req.user?.id as number
    await prisma.watchListSeries.delete({
        where: {
            userId_seriesId: {
                userId,
                seriesId: req.body.id
            }
        }
    })
    res.sendStatus(200)
}