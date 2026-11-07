import { body, param } from "express-validator";
import Validation from "./Validation.ts";
import { prisma } from "../../lib/prisma.ts";

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
    static content = body("content").isString().withMessage("expected 'content' to be string")
        .isLength({max: 3000}) 
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
                req.updateRating = { movieId }
        })

    static seriesId = body("seriesId").exists({values: "undefined"}).withMessage("missing 'seriesId' in payload")
        .if(id => id !== null)
            .isInt().withMessage("seriesId should be an integer").toInt().bail()
            .custom(async (seriesId, {req}) => {
                if (typeof req.body.movieId == "number")
                    throw new Error("you cannot select a movie while reviewing a series")
                
                const wlSeries = await prisma.watchListSeries.findFirst({
                    where: {
                        userId: req.user.id,
                        seriesId
                    }
                })
                if (!wlSeries)
                    throw new Error("Series has not yet added in watchlist")

                if (req.body.rating !== wlSeries.rating) 
                    req.updateRating = { seriesId }
            })
    
    static rating = body("rating").exists({values: "undefined"}).withMessage("missing 'rating' in payload")
            .if(r => r !== null)
            .isInt({min: 0, max: 10}).withMessage("rating should be an integer (0 to 10)").toInt()
    
    static isPublic = body("isPublic").isBoolean().withMessage("isPublic should be a boolean value")

    static id = param("id").isInt().toInt().bail()
        .custom(async (id, {req}) => {
            const review = await prisma.review.findFirst({where: {id}})
            if(!review) {
                req.errorStatusCode = 404
                throw new Error("Review does not exist")
            }
            
            if (review.rating !== req.body.rating) 
                req.updateRating = {
                    seriesId: review.seriesId,
                    movieId: review.movieId
                }
        })

    static post = [this.movieId, this.seriesId, this.content, this.rating, this.isPublic]
    static update = [this.id, this.content, this.rating, this.isPublic]
}