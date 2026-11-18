import { prisma } from "../../lib/prisma.ts"
import type { PostReviewBody } from "../../middleware/validation/ReviewValidation.ts"
import updateRatingSideEffect from "../watchlist/updateRatingSideEffect.ts"

export default async function createReview(authorId:number, body: PostReviewBody) {
    const {
        content,
        rating,
        movieId,
        seriesId,
        isPublic
    } = body
    const sideEffect = updateRatingSideEffect(authorId, rating, {type: "create", movieId, seriesId})
    const createTask = prisma.review.create({
        data: {
            authorId,
            content,
            rating,
            movieId,
            seriesId,
            isPublic
        }
    })
    if (sideEffect) {
        const [review] = await prisma.$transaction([createTask, sideEffect])
        return review
    }
    else return createTask
}