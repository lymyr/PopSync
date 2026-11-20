import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";
import type { WatchgroupBodyType } from "../../middleware/validation/WatchgroupValidation.ts";
import FallbackName from "../../services/watchgroup/FallbackName.ts";
import addMedia from "../../services/watchgroup/addMedia.ts";

export async function createWatchgroup(req: Request<{}, {}, WatchgroupBodyType>, res: Response) {
    const data = await prisma.watchGroup.create({
        data: {
            name: req.body.name,
            fallbackName: await FallbackName.createFallbackName(
                req.body.name, 
                [
                    req.user?.id as number, 
                    ...req.body.members.map(m => m.userId)
                ]
            ),
            users: {
                createMany: {
                    data: [...req.body.members, {
                        isAdmin: true,
                        userId: req.user?.id as number
                    }]
                } 
            }
        }
    })
    res.status(201).json({ data })
}

export async function addUserToWatchgroup(req: Request<{id: number}, {}, Pick<WatchgroupBodyType, "members">>, res: Response) {
    const tasks: Array<any> = [ 
        prisma.watchGroupUser.createManyAndReturn({
            data: req.body.members.map(m => {
                return {
                    ...m,
                    watchGroupId: req.params.id
                }
            })
        })
    ]
    const fallbackName = await FallbackName.getNewFallbackName(req.params.id, {type: "add", members: req.body.members.map(m => m.userId)})
    if (fallbackName)
        tasks.push(prisma.watchGroup.update({ 
            where: {id: req.params.id},
            data: {fallbackName}
        }))
    
    const [users, watchgroup] = await prisma.$transaction(tasks)

    res.status(201).json({
        data: {
            users,
            watchgroup
        }
    })
}

export async function deleteUserFromWatchgroup(req: Request<{id: number, userId: number}>, res: Response) {
    const tasks: Array<any> = [
        prisma.watchGroupUser.delete({
            where: { watchGroupId_userId: {
                watchGroupId: req.params.id,
                userId: req.params.userId
            }}
        })
    ]
    const fallbackName = await FallbackName.getNewFallbackName(req.params.id, {type: "delete", member: req.foundUser})
    if (fallbackName)
        tasks.push(prisma.watchGroup.update({
            where: {id: req.params.id},
            data: {fallbackName}
        }))

    const [userWg, watchgroup] = await prisma.$transaction(tasks)
    res.json({
        data: {
            deletedUser: {id: userWg.userId, username: userWg.username},
            watchgroup
        }
    })
}

export default async function leaveWatchgroup(req: Request<{id: number}>, res: Response) {
    await prisma.$transaction(async (tx) => {
        const deleted = await tx.watchGroupUser.delete({
            where: { watchGroupId_userId: {
                watchGroupId: req.params.id,
                userId: req.user?.id as number
            }}
        })

        const member = await tx.watchGroupUser.findFirst({where: {watchGroupId: req.params.id}})
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

        const fallbackName = await FallbackName.getNewFallbackName(req.params.id, {type: "delete", member: req.user as Express.User})
        if (fallbackName)
            await tx.watchGroup.update({
                where: {id: req.params.id},
                data: {fallbackName}
            })
        
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