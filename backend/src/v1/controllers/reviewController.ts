import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";
import type { PostReviewBody, UpdateReviewBody } from "../../middleware/validation/ReviewValidation.ts";
import nestedCommentQuery from "../../utils/nestedCommentQuery.ts";
import createReview from "../../services/reviews/createReview.ts";
import updateReviewService from "../../services/reviews/updateReview.ts";
import queryTimeline from "../../services/reviews/queryTimeline.ts";

export async function postReview(req: Request<{}, {}, PostReviewBody>, res: Response) {
    const authorId = req.user?.id as number
    const review = await createReview(authorId, req.body)
    res.status(201).json({
        data: review
    })
}

export async function updateReview(req: Request<{id: number}, {}, UpdateReviewBody>, res: Response) {
    const review = await updateReviewService(req.user?.id as number, req.review, req.body)
    res.json({
        data: review
    })
}

export async function deleteReview(req: Request<{id: number}, {}, UpdateReviewBody>, res: Response) {
    const authorId = req.user?.id as number
    await prisma.review.delete({ where: {id: req.params.id, authorId} })
    res.sendStatus(200)
}

export async function getReview(req: Request<{id: number}>, res: Response) {
    const review = await prisma.review.findUnique({
        where: {id: req.params.id},
        select: {
            id: true,
            author: {
              select: {
                username: true
              }  
            },
            dateAdded: true,
            dateUpdated: true,
            content: true,
            rating: true,
            likeCount: true,
            commentCount:true,
            comments: {
                where: {commentId: null},
                ...nestedCommentQuery
            }
        }
    })
    res.json({
        data: review
    })
}

export async function getTimeline(req: Request<{}, {}, {}, {lastReviewId?: string}>, res:Response) {
    const reviews = await queryTimeline(req.user?.id as number, Number(req.query.lastReviewId))
    res.json({ data: reviews })
}