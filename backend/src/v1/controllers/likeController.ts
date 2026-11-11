import { prisma } from "../../lib/prisma.ts"
import type { Request, Response } from "express"

export async function likeReview(req: Request<{id: number}>, res: Response) {
    const userId = req.user?.id as number
    await prisma.$transaction([
        prisma.like.create({
            data: {
                userId,
                reviewId: req.params.id
            }
        }),
        prisma.review.update({
            where: { id: req.params.id },
            data: { likeCount: {increment: 1}}
        })
    ])
    res.sendStatus(201)
}

export async function unlikeReview(req: Request<{id: number}>, res: Response) {
    const userId = req.user?.id as number
    await prisma.$transaction([
        prisma.like.delete({
            where: {
                userId_reviewId: {
                    userId,
                    reviewId: req.params.id
                }
            }
        }),
        prisma.review.update({
            where: { id: req.params.id },
            data: { likeCount: {decrement: 1}}
        })
    ])
    res.sendStatus(200)
}