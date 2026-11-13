import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";
import type { PostReviewBody, UpdateReviewBody } from "../../middleware/validation/ReviewValidation.ts";
import nestedCommentQuery from "../../utils/nestedCommentQuery.ts";

export async function postReview(req: Request<{}, {}, PostReviewBody>, res: Response) {
    const authorId = req.user?.id as number
    const review = await prisma.review.create({
        data: {
            authorId,
            content: req.body.content,
            rating: req.body.rating,
            movieId: req.body.movieId,
            seriesId: req.body.seriesId,
            isPublic: req.body.isPublic
        }
    })
    res.status(201).json({
        data: review
    })
}

export async function updateReview(req: Request<{id: number}, {}, UpdateReviewBody>, res: Response) {
    const review = await prisma.review.update({
        where: {
            id: req.params.id
        },
        data: {
            content: req.body.content,
            isPublic: req.body.isPublic,
            rating: req.body.rating
        }
    })

    res.json({
        data: review
    })
}

export async function deleteReview(req: Request<{id: number}, {}, UpdateReviewBody>, res: Response) {
    const authorId = req.user?.id as number
    await prisma.review.delete({ where: {id: req.params.id, authorId} })
    res.sendStatus(200)
}

export async function getReview(req: Request<{id: number}>, res: Response) {
    const review = await prisma.review.findUnique({
        where: {id: req.params.id},
        select: {
            id: true,
            author: {
              select: {
                username: true
              }  
            },
            dateAdded: true,
            dateUpdated: true,
            content: true,
            rating: true,
            likeCount: true,
            commentCount:true,
            comments: {
                where: {commentId: null},
                ...nestedCommentQuery
            }
        }
    })
    res.json({
        data: review
    })
}

export async function getTimeline(req: Request<{}, {}, {}, {lastReviewId: number}>, res:Response) {
    let reviews;
    const viewerId = req.user?.id as number
    
    if (req.query.lastReviewId)
        reviews = await prisma.review.findMany({
            skip: 1,
            cursor: {
                id: Number(req.query.lastReviewId),
            },
            take: 20,
            omit: {
                authorId: true
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                    }
                }
            },
            where: {
                AND: [
                    {
                        id: {
                            gte: Number(req.query.lastReviewId)
                        },
                    },
                    {
                        OR: [
                            {isPublic: true},
                            {
                                author: {
                                    OR: [
                                        {
                                            sentConnection: {
                                                some: {
                                                    receiverId: viewerId,
                                                    status: "accepted"
                                                }
                                            }
                                        },
                                        {
                                            receivedConnection: {
                                                some: {
                                                    senderId: viewerId,
                                                    status: "accepted"
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
                
                
            },
            orderBy: [
                { dateUpdated: "desc" },
                { dateAdded: "desc" },
                { id: "asc" }
            ]
        })
    else
        reviews = await prisma.review.findMany({
            take: 20,
            omit: {
                authorId: true
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                    }
                },
            },
            where: {
                OR: [
                    {isPublic: true},
                    {
                        author: {
                            OR: [
                                {
                                    sentConnection: {
                                        some: {
                                            receiverId: viewerId,
                                            status: "accepted"
                                        }
                                    }
                                },
                                {
                                    receivedConnection: {
                                        some: {
                                            senderId: viewerId,
                                            status: "accepted"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            orderBy: [
                { dateUpdated: "desc" },
                { dateAdded: "desc" },
                { id: "asc" }
            ]
        })

    res.json({ data: reviews })
}