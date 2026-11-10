import type { Request, Response } from "express"
import { prisma } from "../../lib/prisma.ts"
import bcrypt from "bcryptjs"
import type { Register } from "../../middleware/validation/UserValidation.ts"
import type { SearchQuery } from "../../middleware/validation/SearchQueryValidation.ts"
import { matchedData } from "express-validator"
import type { Prisma } from "../../../generated/prisma/client.ts"

export async function getUsers(req: Request<{}, {}, {}, SearchQuery>, res: Response) {
    const query = matchedData<SearchQuery>(req)
    const currentUser = req.user as NonNullable<typeof req.user>
    let opts: Prisma.UserFindManyArgs = {
        take: 10,
        where: { 
            AND: [
                { 
                    username: {
                        contains: query.username,
                        mode: "insensitive"
                    } 
                },
                {
                    NOT: {
                        username: {
                            contains: currentUser.username
                        }
                    }
                }
            ]
               
        },
        orderBy: {
            id: "asc"
        }
    }
    if (query.lastId) {
        opts = {
            ...opts,
            cursor: { id: query.lastId },
            skip: 1
        }
    }
    const users = await prisma.user.findMany(opts)
    res.json({
        data: users
    })
}

export async function register(req:Request<{}, {}, Register>, res:Response) {
    const hashed = await bcrypt.hash(req.body.password, 10)
    await prisma.user.create({
        data: {
            username: req.body.username,
            password: hashed,
            pfpPath: "",
    }})
    res.sendStatus(201)
}

export async function login(req:Request, res:Response) {
    res.sendStatus(200)
}

export async function deleteAccount(req:Request, res:Response) {
    const id = req.user?.id as number
    await prisma.$transaction(async (tx) => {
        const reviewsThatUserLiked = (await tx.like.findMany({where: {userId: id }})).map(l => l.reviewId)
        const reviewsThatUserCommented = (await tx.comment.findMany({where: {authorId: id}})).map(l => l.reviewId)

        const commentTask = []
        const commentNoReplyMap = new Map()

        for (const id of reviewsThatUserCommented) {
            commentNoReplyMap.set(id, commentNoReplyMap.get(id) ? commentNoReplyMap.get(id) + 1 : 1)
        }
        
        for (const reviewId of commentNoReplyMap.keys()) {
            commentTask.push(prisma.review.update({
                where: {id: reviewId},
                data: { commentCount: {decrement: commentNoReplyMap.get(reviewId)}}
            }))
        }

        await Promise.all([
            ...commentTask,
            tx.like.deleteMany({where: {userId: id}}),
            tx.review.updateMany({ 
                where: {
                    id: { in: reviewsThatUserLiked }
                },
                data: {
                    likeCount: {
                        decrement: 1
                    }
                }
            }),
            // note: it's possible to have nested "[deleted comment]"
            tx.comment.updateMany({
                where: {
                    AND: [
                        {authorId: id},
                        {
                            replies: {
                                every: {
                                    parentComment: {is: null}
                                }
                            }
                        }
                    ]
                },
                data: {
                    authorId: null,
                    content: "[deleted comment]"
                }
            }),
            tx.comment.deleteMany({
                where: {
                    AND: [
                        {authorId: id},
                        {
                            replies: {
                                every: {
                                    parentComment: {isNot: null}
                                }
                            }
                        }
                    ]
                }
            })
        ])
        await tx.user.delete({ where: {id}})
    })

    res.sendStatus(200)
}