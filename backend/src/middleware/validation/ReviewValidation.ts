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

    static isAuthor = this.id().bail().custom((_id, meta) => {
        const req = meta.req as Request
        req.errorStatusCode = 401
        return req.user?.id === req.review?.authorId
    }).withMessage("please do not touch other user's review")

    private static payload = [this.content, this.rating, this.isPublic]
    static post = [...this.payload, this.movieId, this.seriesId]
    static update = [...this.payload, this.isAuthor]

    static canView = () => this.id().bail().custom(async (_id, meta) => {
        const req = meta.req as Request
        const review = req.review as NonNullable<typeof req.review>
        const userId = req.user?.id as number

        if (review.authorId === userId || review.isPublic)
            return true

        const connection = await prisma.connection.findFirst({
            where: {
                OR: [
                    {
                        senderId: userId,
                        receiverId: review.authorId,
                        status: "accepted"
                    },
                    {
                        senderId: review.authorId,
                        receiverId: userId,
                        status: "accepted"
                    }
                ]
            }
        })

        if (!connection) {
            req.errorStatusCode = 401
            throw new Error("You are not allowed to view this review")
        }
    })
}