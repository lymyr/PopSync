import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";

import type { BodyPayload } from "../../middleware/validation/WatchListValidation.ts";

export async function addToMovieWatchList(req: Request<{}, {}, BodyPayload>, res: Response) {
    const userId = req.user?.id as number
    await prisma.watchListMovie.create({
        data: {
            userId,
            movieId: req.body.id,
            hasWatched: req.body.hasWatched
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
            hasWatched: req.body.hasWatched
        }
    })

    res.sendStatus(200)
}

export async function deleteMovieWatchList(req: Request<{}, {}, Omit<BodyPayload, "hasWatched">>, res: Response) {
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