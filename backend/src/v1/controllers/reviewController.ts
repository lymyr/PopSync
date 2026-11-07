import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";
import type { PostReviewBody, UpdateReviewBody } from "../../middleware/validation/ReviewValidation.ts";


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