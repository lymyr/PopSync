import { query } from "express-validator";
import Validation from "./Validation.ts";
import { prisma } from "../../lib/prisma.ts";

export interface SearchQuery {
    username: string;
    lastId?: number;
}

export default class SearchQueryValidation extends Validation {
    static username = query("username").notEmpty().withMessage("Please add a username query")
    static lastId = query("lastId").optional({values: "null"}).exists({values: "null"}).isInt().toInt().bail()
        .custom(async (id, {req}) => {
            const lastUser = await prisma.user.findUnique({
                where: { id }
            })

            if (!lastUser) {
                req.errorStatusCode = 404
                throw new Error("user does not exist")
            }
    })
        
        

    static searchUser = [this.username, this.lastId]
}