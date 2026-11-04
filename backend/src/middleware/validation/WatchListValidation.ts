import { body } from "express-validator";
import Validation from "./Validation.ts";
import { prisma } from "../../lib/prisma.ts";

export interface BodyPayload {
    id: number;
    hasWatched: boolean;
}

export default class WatchListValidation extends Validation {
    static id = () => body("id").exists().withMessage("missing id in payload")
        .isInt().withMessage("id should be an integer").toInt()

    static movieIdPayload = this.id().bail()
        .custom(async (id, {req}) => {
            const movie = await prisma.movie.findUnique({where: {id}})
            if (!movie) {
                req.errorStatusCode = 404
                throw new Error("movie doesn't exist in popsync db")
            }
        })
    static statusPayload = body("hasWatched").exists().withMessage("missing hasWatched in payload")
        .isBoolean().withMessage("hasWatched should be a boolean").toBoolean()
    
    static moviePayload = [this.statusPayload, this.movieIdPayload]
}