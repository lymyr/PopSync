import { prisma } from "../../lib/prisma.ts"

export default async function deleteAccount(id: number) {
    await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`
            WITH commented_reviews (id, count) AS (
                SELECT 
                    r.id, 
                    COUNT(c.id) AS count 
                FROM review AS r
                INNER JOIN comment AS c ON
                    c.author_id = ${id} AND
                    r.id = c.review_id
                GROUP BY r.id
            )
            UPDATE review
                SET comment_count = comment_count - cr.count
                FROM commented_reviews AS cr
                WHERE review.id = cr.id
        `

        await tx.review.updateMany({ 
            where: {
                likes: {
                    some: {
                        userId: id
                    }
                }
            },
            data: {
                likeCount: {
                    decrement: 1
                }
            }
        })
        await tx.like.deleteMany({where: {userId: id}})

        await tx.comment.updateMany({
            where: {
                AND: [
                    {authorId: id},
                    {
                        replies: {
                            some: {
                                parentComment: {isNot: null}
                            }
                        }
                    }
                ]
            },
            data: {
                authorId: null,
                content: "[deleted comment]"
            }
        })

        await tx.comment.deleteMany({
            where: {
                AND: [
                    {authorId: id},
                    {
                        replies: {
                            none: {
                                parentComment: {isNot: null}
                            }
                        }
                    }
                ]
            }
        })
        
        await tx.user.delete({ where: {id}})
    })
}