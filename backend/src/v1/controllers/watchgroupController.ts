import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";
import type { WatchgroupBodyType } from "../../middleware/validation/WatchgroupValidation.ts";
import FallbackName from "../../services/watchgroup/FallbackName.ts";

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
    const fallbackName = await FallbackName.updateFallbackName(req.watchgroup, {type: "add", members: req.body.members.map(m => m.userId)})
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
    const fallbackName = await FallbackName.updateFallbackName(req.watchgroup, {type: "delete", member: req.foundUser})
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