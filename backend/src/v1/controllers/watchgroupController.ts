import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";
import type { WatchgroupBodyType } from "../../middleware/validation/WatchgroupValidation.ts";
import addMedia from "../../services/watchgroup/addMedia.ts";
import compareWatchlist from "../../services/watchlist/compareWatchlist.ts";

export async function createWatchgroup(req: Request<{}, {}, WatchgroupBodyType>, res: Response) {
    const data = await prisma.watchGroup.create({
        data: {
            name: req.body.name == "" ? `${req.user?.username}'s watchgroup` : req.body.name,
            users: {
                createMany: {
                    data: [...req.body.members, {
                        accepted: true,
                        isAdmin: true,
                        userId: req.user?.id as number
                    }]
                } 
            }
        }
    })
    res.status(201).json({ data })
}

export async function acceptWatchgroupInvite(req: Request<{id: number}>, res: Response) {
    const wgUser = await prisma.watchGroupUser.update({
        where: {watchGroupId_userId: {
            watchGroupId: req.params.id,
            userId: req.user?.id as number
        }},
        data: { accepted: true },
        include: { watchGroup: true }
    })
    res.json({data: wgUser.watchGroup})
}

export async function rejectWatchgroupInvite(req: Request<{id: number}>, res: Response) {
    await prisma.watchGroupUser.delete({
        where: {watchGroupId_userId: {
            watchGroupId: req.params.id,
            userId: req.user?.id as number
        }}
    })
    res.sendStatus(200)
}

export async function addUserToWatchgroup(req: Request<{id: number}, {}, Pick<WatchgroupBodyType, "members">>, res: Response) {
    const data = await prisma.watchGroupUser.createManyAndReturn({
        data: req.body.members.map(m => {
            return {
                ...m,
                watchGroupId: req.params.id
            }
        })
    })

    res.status(201).json({ data })
}

export async function deleteUserFromWatchgroup(req: Request<{id: number, userId: number}>, res: Response) {
    const data = await prisma.watchGroupUser.delete({
        where: { watchGroupId_userId: {
            watchGroupId: req.params.id,
            userId: req.params.userId
        }}
    })

    res.json({ data })
}

export default async function leaveWatchgroup(req: Request<{id: number}>, res: Response) {
    await prisma.$transaction(async (tx) => {
        const deleted = await tx.watchGroupUser.delete({
            where: { watchGroupId_userId: {
                watchGroupId: req.params.id,
                userId: req.user?.id as number
            }}
        })

        const member = await tx.watchGroupUser.findFirst({where: {watchGroupId: req.params.id, accepted: true}})
        if (!member) 
            return await tx.watchGroup.delete({where: {id: req.params.id}})

        if (deleted.isAdmin) {
            const memberSortedByAdmin = await tx.watchGroupUser.findFirst({
                where: { watchGroupId: req.params.id },
                orderBy: {isAdmin: "desc"}
            })
            if (memberSortedByAdmin && !(memberSortedByAdmin.isAdmin))
                await tx.watchGroupUser.update({
                    where: {watchGroupId_userId: {
                        watchGroupId: req.params.id,
                        userId: memberSortedByAdmin.userId
                    }},
                    data: {isAdmin: true}
                })
        }
    })

    res.json({ data: { watchgroupId: req.params.id } })
}

export async function addMovieToWatchgroup(req: Request<{id: number}, {}, {id: number}>, res: Response) {
    const data = await addMedia(req.params.id, {type: "movie", id: req.body.id})
    res.status(201).json({data})
}

export async function addSeriesToWatchgroup(req: Request<{id: number}, {}, {id: number}>, res: Response) {
    const data = await addMedia(req.params.id, {type: "series", id: req.body.id})
    res.status(201).json({data})
}

export async function removeMovieFromWatchgroup(req: Request<{id: number, movieId: string}>, res: Response) {
    await prisma.watchGroup.update({
        where: {id: req.params.id},
        data: {
            movies: {
                disconnect: {id: Number(req.params.movieId)}
            }
        }
    })
    res.sendStatus(200)
}

export async function removeSeriesFromWatchgroup(req: Request<{id: number, seriesId: string}>, res: Response) {
    await prisma.watchGroup.update({
        where: {id: req.params.id},
        data: {
            series: {
                disconnect: {id: Number(req.params.seriesId)}
            }
        }
    })
    res.sendStatus(200)
}

export async function compareMedia(req: Request<{id: number}, {}, {}, {search?: string}>, res: Response) {
    const data = await compareWatchlist(
        req.user?.id as number, 
        {watchgroupId: req.params.id},
        {
            lastMovie: req.lastMovie,
            lastSeries: req.lastSeries,
            search: req.query.search
        }
    )
    res.json({ data })
}