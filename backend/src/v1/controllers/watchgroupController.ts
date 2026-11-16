import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";
import type { watchgroupBodyType } from "../../middleware/validation/watchgroupValidation.ts";

export async function createWatchgroup(req: Request<{}, {}, watchgroupBodyType>, res: Response) {
    const wg = await prisma.watchGroup.create({
        data: {
            name: req.body.name,
            fallbackName: req.watchgroupFallbackName ? req.watchgroupFallbackName : "",
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
    res.status(201).json({
        data: wg
    })
}

export async function addUserToWatchgroup(req: Request<{id: number}, {}, Pick<watchgroupBodyType, "members">>, res: Response) {
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
    if (req.watchgroupFallbackName)
        tasks.push(prisma.watchGroup.update({ 
            where: {id: req.params.id},
            data: {fallbackName: req.watchgroupFallbackName}
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
    if (req.watchgroupFallbackName)
        tasks.push(prisma.watchGroup.update({
            where: {id: req.params.id},
            data: {fallbackName: req.watchgroupFallbackName}
        }))

    const [userWg, watchgroup] = await prisma.$transaction(tasks)
    res.json({
        data: {
            deletedUser: {id: userWg.userId, username: userWg.username},
            watchgroup
        }
    })
}