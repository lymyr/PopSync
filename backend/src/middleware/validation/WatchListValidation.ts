import { body, param } from "express-validator";
import Validation from "./Validation.ts";
import { prisma } from "../../lib/prisma.ts";
import type { Request } from "express";

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
    
    static userId = () => param("userId").isInt().withMessage("userId must be an integer").toInt()
    static isOwner = this.userId().bail().custom((userId, meta) => {
        const req = meta.req as Request
        if (userId !== req.user?.id) {
            req.errorStatusCode = 401
            return false
        }
        return true
    }).withMessage("please do not touch other user's watchlist")

    static canAccess = this.userId().bail().custom(async (id, meta) => {
        const req = meta.req as Request
        const userId = req.user?.id as number
        if (id === req.user?.id)
            return true
        const connection = await prisma.connection.findFirst({
            where: {
                OR: [
                    {
                        senderId: userId,
                        receiverId: id,
                        status: "accepted"
                    },
                    {
                        senderId: id,
                        receiverId: userId,
                        status: "accepted"
                    }
                ]
            }
        })
        if (!connection) {
            req.errorStatusCode = 401
            throw new Error("you do not have access to this user's watchlist")
        }
    })

    private static payload = [this.isOwner, this.rating, this.statusPayload]
    static moviePayload = [...this.payload, this.movieIdPayload]
    static seriesPayload = [...this.payload, this.seriesIdPayload]
    static updatePayload = [...this.payload, this.id()]
}