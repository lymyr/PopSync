import { body } from "express-validator";
import Validation from "./Validation.ts";
import { prisma } from "../../lib/prisma.ts";

export interface BodyPayload {
    id: number;
    hasWatched: boolean;
    rating: number | null;
}

export default class WatchListValidation extends Validation {
    static id = () => body("id").exists().withMessage("missing id in payload")
        .isInt().withMessage("id should be an integer").toInt()

    static rating = body("rating").exists({values: "undefined"}).withMessage("missing rating in payload")
        .if(val => val !== null)
        .isInt({min: 0, max: 10}).withMessage("rating must be an integer between 0 and 10").toInt()

    static movieIdPayload = this.id().bail()
        .custom(async (id, {req}) => {
            const movie = await prisma.movie.findUnique({where: {id}})
            if (!movie) {
                req.errorStatusCode = 404
                throw new Error("movie doesn't exist in popsync db")
            }
        })

    static seriesIdPayload = this.id().bail()
        .custom(async (id, {req}) => {
            const movie = await prisma.series.findUnique({where: {id}})
            if (!movie) {
                req.errorStatusCode = 404
                throw new Error("tv series doesn't exist in popsync db")
            }
        })

    static statusPayload = body("hasWatched").exists().withMessage("missing hasWatched in payload")
        .isBoolean().withMessage("hasWatched should be a boolean").toBoolean()
    
    static payload = [this.id(), this.rating]
    static moviePayload = [this.statusPayload, this.rating, this.movieIdPayload]
    static seriesPayload = [this.statusPayload, this.rating, this.seriesIdPayload]
}