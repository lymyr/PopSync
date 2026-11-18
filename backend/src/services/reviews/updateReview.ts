import type { Review } from "../../../generated/prisma/client.ts"
import { prisma } from "../../lib/prisma.ts"
import type { UpdateReviewBody } from "../../middleware/validation/ReviewValidation.ts"
import updateRatingSideEffect from "../watchlist/updateRatingSideEffect.ts"

export default async function updateReview(authorId:number, review: Review, body: UpdateReviewBody) {
    const {
        content,
        rating,
        isPublic
    } = body
    const sideEffect = updateRatingSideEffect(authorId, rating, {type: "update", review})
    const updateTask = prisma.review.update({
        where: {id: review.id},
        data: {
            authorId,
            content,
            rating,
            isPublic
        }
    })
    if (sideEffect) {
        const [review] = await prisma.$transaction([updateTask, sideEffect])
        return review
    }
    else return updateTask
}