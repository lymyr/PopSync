import { param } from "express-validator";
import Validation from "./Validation.ts";
import { prisma } from "../../lib/prisma.ts";
import type { Request } from "express";

export default class ConnectionValidation extends Validation {
    static id = () => param("id").exists().isInt().toInt()
    static userIdExists = this.id().custom(async (id, meta) => {
        const req = meta.req as Request
        if (id == req.user?.id) {
            throw new Error("Please don't add yourself")
        }
        const user = await prisma.user.findFirst({where: {id}})
        if (!user) {
            req.errorStatusCode = 404
            throw new Error("User not found")
        }
        if (req.method == "POST") {
            const userId = req.user?.id as number
            const connectionExists = await prisma.connection.findFirst({where: {
                OR: [
                    {senderId: id, receiverId: userId},
                    {senderId: userId, receiverId: id},
                ]
            }})
            if (connectionExists)
                throw new Error("Connection request has already been sent or connection has already been accepted")
        }
    })
}