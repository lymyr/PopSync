import type { Request, Response } from "express"
import { prisma } from "../../lib/prisma.ts"

export async function getAcceptedConnections(req: Request<{id: number}>, res: Response) {
    const actingUserId = req.user?.id as number
    const connections = await prisma.connection.findMany({
        where: {
            AND: [
                {
                    OR: [
                        { receiverId: actingUserId },
                        { senderId: actingUserId }
                    ]
                },
                {
                    status: "accepted"
                }
            ]
        },
        select: {
            dateAdded: true,
            dateUpdated: true,
            status: true,
            receiver: {
                select: {
                    id: true,
                    username: true,
                    pfpPath: true
                }
            },
            sender: {
                select: {
                    id: true,
                    username: true,
                    pfpPath: true
                }
            }
        }
    })

    res.json({ data: { connections } })
}

export async function addConnection(req: Request<{id: number}>, res: Response) {
    const actingUserId = req.user?.id as number
    await prisma.connection.create({
        data: {
            senderId: actingUserId,
            receiverId: req.params.id
        }
    })
    res.sendStatus(201)
}

export async function acceptConnection(req: Request<{id: number}>, res: Response) {
    const actingUserId = req.user?.id as number
    await prisma.connection.update({
        where: {
            connectionId: {
                senderId: req.params.id,
                receiverId: actingUserId,
            }
        },
        data: {
            status: "accepted"
        }
    })
    res.sendStatus(200)
}

export async function deleteConnection(req: Request<{id: number}>, res: Response) {
    const actingUserId = req.user?.id as number
    await prisma.connection.deleteMany({
        where: {
            OR: [
                {
                    receiverId: actingUserId,
                    senderId: req.params.id
                },
                {
                    senderId: actingUserId,
                    receiverId: req.params.id
                }
            ]
        }
    })
    res.sendStatus(200)
}