import { prisma } from "../../lib/prisma.ts";
import type { Request } from "express";
import Validation from "./Validation.ts";
import ReviewValidation from "./ReviewValidation.ts";

export default class LikeValidation extends Validation {
    static like = ReviewValidation.canView().bail().custom(async (reviewId, meta) => {
        const req = meta.req as Request
        const userId = req.user?.id as number
        const hasLiked = await prisma.like.findFirst({
            where: {
                reviewId,
                userId
            }
        })
        if (hasLiked)
            throw new Error("You already liked this review")
    })

    static unlike = ReviewValidation.canView().bail().custom(async (reviewId, meta) => {
        const req = meta.req as Request
        const userId = req.user?.id as number
        const hasLiked = await prisma.like.findFirst({
            where: {
                reviewId,
                userId
            }
        })
        
        if (!hasLiked) {
            req.errorStatusCode = 404
            throw new Error("You haven't liked this review")
        }
    })
}