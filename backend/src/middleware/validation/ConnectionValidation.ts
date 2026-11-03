import { param } from "express-validator";
import Validation from "./Validation.ts";
import { prisma } from "../../lib/prisma.ts";
import type { Request } from "express";

export default class ConnectionValidation extends Validation {
    static id = () => param("id").exists().isInt().toInt()
    static userIdExists = this.id().custom(async (id, {req}) => {
        const typedReq = req as Request
        if (id == typedReq.user?.id) {
            throw new Error("Please don't add yourself")
        }
        const user = await prisma.user.findFirst({where: {id}})
        if (!user) {
            req.errorStatusCode = 404
            throw new Error("User not found")
        }
    })
}