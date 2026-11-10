import { body, param } from "express-validator";
import Validation from "./Validation.ts";
import { prisma } from "../../lib/prisma.ts";
import type { Request } from "express";

export interface PostReviewBody {
    content: string;
    movieId: number;
    seriesId: number;
    rating: number;
    isPublic: boolean;
}

export interface UpdateReviewBody extends Omit<Omit<PostReviewBody, "movieId">, "seriesId"> {
    id: number
}

export interface CommentBody {
    content: string;
    commentId?: number
}

export default class ReviewValidation extends Validation {
    static content = body("content").isString().withMessage("expected 'content' to be string").trim()
        .isLength({min: 1, max: 3000}).withMessage("content should be 1 - 3000 characters")
        // will not test content length. 
        // i may change my mind idk. 
        // note: add db constraint once mind is made up

    static movieId = body("movieId").exists({values: "undefined"}).withMessage("missing 'movieId' in payload")
        .if(id => id !== null)
        .isInt().withMessage("movieId should be an integer").toInt().bail()
        .custom(async (movieId, {req}) => {
            if (typeof req.body.seriesId == "number")
                throw new Error("you cannot select a series while reviewing a movie")
            
            const wlMovie = await prisma.watchListMovie.findFirst({
                where: {
                    userId: req.user.id,
                    movieId
                }
            })
            if (!wlMovie)
                throw new Error("Movie has not yet added in watchlist")

            if (req.body.rating !== wlMovie.rating)
                req.wlMovie = wlMovie
        })

    static seriesId = body("seriesId").exists({values: "undefined"}).withMessage("missing 'seriesId' in payload")
        .if(id => id !== null)
            .isInt().withMessage("seriesId should be an integer").toInt().bail()
            .custom(async (seriesId, meta) => {
                const req = meta.req as Request
                const userId = req.user?.id as number
                if (typeof req.body.movieId == "number")
                    throw new Error("you cannot select a movie while reviewing a series")
                
                const wlSeries = await prisma.watchListSeries.findFirst({
                    where: {
                        userId,
                        seriesId
                    }
                })
                if (!wlSeries)
                    throw new Error("Series has not yet added in watchlist")

                if (req.body.rating !== wlSeries.rating) 
                    req.wlSeries = wlSeries
            })
    
    static rating = body("rating").exists({values: "undefined"}).withMessage("missing 'rating' in payload")
            .if(r => r !== null)
            .isInt({min: 0, max: 10}).withMessage("rating should be an integer (0 to 10)").toInt()
    
    static isPublic = body("isPublic").isBoolean().withMessage("isPublic should be a boolean value")

    static id = () => param("id").isInt().toInt().bail()
        .custom(async (id, meta) => {
            const req = meta.req as Request
            const review = await prisma.review.findFirst({where: {id}})
            if(!review) {
                req.errorStatusCode = 404
                throw new Error("Review does not exist")
            }
            req.review = review
        })

    static post = [this.movieId, this.seriesId, this.content, this.rating, this.isPublic]
    static update = [this.id(), this.content, this.rating, this.isPublic]

    static likeValidation = this.id().bail().custom(async (reviewId, meta) => {
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

    static unlikeValidation = this.id().bail().custom(async (reviewId, meta) => {
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


    static commentId = param("commentId").if((id) => id !== undefined)
        .isInt().withMessage("commentId must be an integer").toInt().bail()
        .custom(async (id, meta) => {
            const req = meta.req as Request<{id: number | string}>

            let comment
            if (req.method == "DELETE") {
                comment = await prisma.comment.findFirst({ where: {id, reviewId: Number(req.params.id)}, include: { replies: true }})
                if (comment && comment.replies.length > 0)
                    req.softDelComment = true
            }
            else
                comment = await prisma.comment.findFirst({ where: {id, reviewId: Number(req.params.id)}})

            if (!comment) {
                req.errorStatusCode = 404
                throw new Error("the comment you're replying to doesn't exist")
            }
        })

    static isAuthor = this.id().custom((id, meta) => {
        const req = meta.req as Request
        req.errorStatusCode = 401
        return req.user?.id === req.review?.authorId
    }).withMessage("please do not delete other user's review")

    static commentValidation = [
        this.content,
        this.id(),
        this.commentId
    ]
}