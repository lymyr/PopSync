import { prisma } from "../../lib/prisma.ts"
import type { Request, Response } from "express"
import type { CommentBody } from "../../middleware/validation/CommentValidation.ts"
import type { PrismaPromise } from "../../../generated/prisma/internal/prismaNamespace.ts"
import nestedCommentQuery from "../../utils/nestedCommentQuery.ts"

export async function getComments(req: Request<{id: number}>, res: Response) {
    const comments = await prisma.comment.findMany({
        where: {reviewId: req.params.id, commentId: null},
        ...nestedCommentQuery
    })
    res.json({data: comments})
}

export async function addComment(req: Request<{id: number, commentId: number | null}, {}, CommentBody>, res: Response) {
    const authorId = req.user?.id as number
    const prismaRes = await prisma.$transaction([
        prisma.comment.create({
            data: { 
                authorId,
                reviewId: req.params.id,
                content: req.body.content,
                commentId: req.params.commentId
            }
        }),
        prisma.review.update({
            where: { id: req.params.id },
            data: {
                commentCount: { increment: 1 }
            }
        })
    ])
    res.status(201).json({
        data: prismaRes[0]
    })
}

export async function deleteComment(req: Request<{id: number, commentId: number | null}>, res: Response) {
    if (req.params.commentId === null || req.params.commentId === undefined)
        return res.status(404).send("missing 'commentId' param")

    const transactionTasks: PrismaPromise<any>[] = [
        prisma.review.update({
            where: {id: req.params.id }, 
            data: { commentCount: {decrement: 1}}
        })
    ]

    if (req.softDelComment)
        transactionTasks.push(prisma.comment.update({
            where: {id: req.params.commentId},
            data: {
                authorId: null,
                content: "[comment deleted]"
            }
        }))
    else
        transactionTasks.push(prisma.comment.delete({
            where: {
                id: req.params.commentId
            }
        }))
    
    await prisma.$transaction(transactionTasks)

    res.sendStatus(200)
}

export async function updateComment(req: Request<{id: string, commentId: number}, {}, CommentBody>, res: Response) {
    const comment = await prisma.comment.update({
        where: {id: req.params.commentId},
        data: {content: req.body.content}
    })

    res.json({data: comment})
}