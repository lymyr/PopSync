import { body, param } from "express-validator";
import Validation from "./Validation.ts";
import type { Request } from "express";
import { prisma } from "../../lib/prisma.ts";

export interface CommentBody {
    content: string;
    commentId?: number
}

export default class commentValidation extends Validation {
    static content = body("content").isString().withMessage("expected 'content' to be string").trim()
        .isLength({min: 1, max: 3000}).withMessage("content should be 1 - 3000 characters")
        // will not test content length. 
        // i may change my mind idk. 
        // note: add db constraint once mind is made up
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
                throw new Error("the comment doesn't exist")
            }

            if ((req.method == "DELETE" || req.method == "PUT") && comment?.authorId !== req.user?.id) {
                req.errorStatusCode = 401
                throw new Error("please don't touch other people's comments")
            }
        })
}