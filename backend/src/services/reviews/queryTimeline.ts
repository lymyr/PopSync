import { prisma } from "../../lib/prisma.ts";

export default async function queryTimeline(viewerId: number, lastReviewId?: number) {
    if (lastReviewId)
        return prisma.review.findMany({
            skip: 1,
            cursor: {
                id: lastReviewId,
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
                    { id: { gte: lastReviewId } },
                    { OR: [ 
                        {isPublic: true},
                        { author: {
                                OR: [
                                    { sentConnection: {
                                        some: {
                                            receiverId: viewerId,
                                            status: "accepted"
                                        }
                                    } },
                                    { receivedConnection: {
                                        some: {
                                            senderId: viewerId,
                                            status: "accepted"
                                        }
                                    } }
                                ]
                        }}
                    ]}
                ]
                
                
            },
            orderBy: [
                { dateUpdated: "desc" },
                { dateAdded: "desc" },
                { id: "asc" }
            ]
        })
    else
        return prisma.review.findMany({
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
                    { author: {
                        OR: [
                            { sentConnection: {
                                some: {
                                    receiverId: viewerId,
                                    status: "accepted"
                                }
                            }},
                            { receivedConnection: {
                                some: {
                                    senderId: viewerId,
                                    status: "accepted"
                                }
                            }}
                        ]
                    }}
                ]
            },
            orderBy: [
                { dateUpdated: "desc" },
                { dateAdded: "desc" },
                { id: "asc" }
            ]
        })
}