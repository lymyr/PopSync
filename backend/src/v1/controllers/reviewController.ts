import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";
import type { CommentBody, PostReviewBody, UpdateReviewBody } from "../../middleware/validation/ReviewValidation.ts";
import type { PrismaPromise } from "../../../generated/prisma/internal/prismaNamespace.ts";

export async function postReview(req: Request<{}, {}, PostReviewBody>, res: Response) {
    const authorId = req.user?.id as number
    const review = await prisma.review.create({
        data: {
            authorId,
            content: req.body.content,
            rating: req.body.rating,
            movieId: req.body.movieId,
            seriesId: req.body.seriesId,
            isPublic: true
        }
    })
    res.status(201).json({
        data: review
    })
}

export async function updateReview(req: Request<{id: number}, {}, UpdateReviewBody>, res: Response) {
    const review = await prisma.review.update({
        where: {
            id: req.params.id
        },
        data: {
            content: req.body.content,
            isPublic: req.body.isPublic,
            rating: req.body.rating
        }
    })

    res.json({
        data: review
    })
}


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

export async function addComment(req: Request<{id: number, commentId: number | null}, {}, CommentBody>, res: Response) {
    const authorId = req.user?.id as number
    const prismaRes = await prisma.$transaction([
        prisma.comment.create({
            data: { 
                authorId,
                reviewId: req.params.id,
                content: req.body.content,
                commentId: req.params.commentId
            }
        }),
        prisma.review.update({
            where: { id: req.params.id },
            data: {
                commentCount: { increment: 1 }
            }
        })
    ])
    res.status(201).json({
        data: prismaRes[0]
    })
}

export async function deleteComment(req: Request<{id: number, commentId: number | null}>, res: Response) {
    if (req.params.commentId === null || req.params.commentId === undefined)
        return res.status(404).send("missing 'commentId' param")

    const transactionTasks: PrismaPromise<any>[] = [
        prisma.review.update({
            where: {id: req.params.id }, 
            data: { commentCount: {decrement: 1}}
        })
    ]

    if (req.softDelComment)
        transactionTasks.push(prisma.comment.update({
            where: {id: req.params.commentId},
            data: {
                authorId: null,
                content: "[comment deleted]"
            }
        }))
    else
        transactionTasks.push(prisma.comment.delete({
            where: {
                id: req.params.commentId
            }
        }))
    
    await prisma.$transaction(transactionTasks)

    res.sendStatus(200)
}