import { afterAll, beforeAll, describe, expect, test, vi, afterEach } from "vitest";
import { testUserGen, type TestUser } from "../../utils/userGeneration.ts";
import { prisma } from "../../../lib/prisma.ts";
import TmdbMockPayloads from "../../mocks/TmdbMockPayloads.ts";
import tmdb from "../../../lib/tmdb.ts";
import request from "supertest"
import app from "../../../app.ts";

interface Review {
    id: number;
    authorId: number;
    content: string;
    isPublic: boolean;
    dateAdded: string;
    dateUpdated: string;
    rating: number;
    movieId: number | null;
    seriesId: number | null;
    commentCount: number;
    likeCount: number;
}

let users: TestUser[]
let poster: TestUser
let review: Review;
beforeAll(async () => {
    users = await testUserGen(11)
    poster = users[0] as TestUser
    users = users.slice(1)
    vi.spyOn(Object.getPrototypeOf(tmdb.movies), "details").mockResolvedValue(TmdbMockPayloads.movieDetails)
    vi.spyOn(Object.getPrototypeOf(tmdb.tvShows), "details").mockResolvedValue(TmdbMockPayloads.seriesDetails)

    const movieId = TmdbMockPayloads.movieDetails.id

    const reviewPayload = {
        movieId,
        seriesId: null,
        content: "great",
        rating:"9",
        isPublic: true
    }

    const watchlistPayload = {
        id: reviewPayload.movieId,
        hasWatched: true,
        rating: reviewPayload.rating
    }

    await poster.agent.get(`/v1/media/movies?id=${movieId}`)
    await poster.agent.post(`/v1/watchlist/movies`).send(watchlistPayload)
    const res = await poster.agent.post(`/v1/reviews`).send(reviewPayload)

    review = res.body.data
})

afterEach(async () => {
    await Promise.all([
        prisma.comment.deleteMany(),
        prisma.like.deleteMany(),
        prisma.review.updateMany({
            data: {
                likeCount: 0,
                commentCount: 0
            }
        })
    ])
})

afterAll(async () => {
    await prisma.review.deleteMany();
    await Promise.all([
        prisma.$transaction([
            prisma.watchListMovie.deleteMany(),
            prisma.movie.deleteMany()
        ]),
        prisma.$transaction([
            prisma.watchListSeries.deleteMany(),
            prisma.series.deleteMany()
        ])
    ])
    await Promise.all([
        prisma.user.deleteMany(),
        prisma.session.deleteMany()
    ])
})

describe("likes", () => {
    test("concurrent likes", async () => {
        await Promise.all(users.map(u => u.agent.post(`/v1/reviews/${review.id}/likes`)))
        const [currentReview, likeCount] = await Promise.all([
            prisma.review.findUnique({where: {id: review.id}}),
            prisma.like.count({where: { reviewId: review.id }})
        ])
        expect(currentReview?.likeCount).toBe(users.length)
        expect(likeCount).toBe(users.length)
    })
    
    test("concurrent liking then disliking", async () => {
        await Promise.all(users.map(u => 
            u.agent.post(`/v1/reviews/${review.id}/likes`)
            .then(() => u.agent.delete(`/v1/reviews/${review.id}/likes`))
        ))
        const [currentReview, likeCount] = await Promise.all([
            prisma.review.findUnique({where: {id: review.id}}),
            prisma.like.count({where: { reviewId: review.id }})
        ])
        expect(currentReview?.likeCount).toBe(0)
        expect(likeCount).toBe(0)
    })

    test("double liking", async () => {
        await Promise.all([
            users[0]?.agent.post(`/v1/reviews/${review.id}/likes`),
            users[0]?.agent.post(`/v1/reviews/${review.id}/likes`)
        ])
        const currentReview = await prisma.review.findUnique({where: {id: review.id}})
        expect(currentReview?.likeCount).toBe(1)
    })

    test("disliking an unliked post", async () => {
        if (users.length < 5)
            throw new Error("this test requires at least 5 users")

        const slicedUsers = users.slice(0, 5)
        const likers = slicedUsers.slice(0, slicedUsers.length-1)
        const unliker = slicedUsers[slicedUsers.length-1]

        await Promise.all(likers.map(u => u.agent.post(`/v1/reviews/${review.id}/likes`)))
        const res = await unliker?.agent.delete(`/v1/reviews/${review.id}/likes`)
        const currentReview = await prisma.review.findUnique({where: {id: review.id}})
        
        expect(res?.status).toBe(404)
        expect(currentReview?.likeCount).toBe(likers.length)
    })
})

describe("comments", () => {
    test("add comment to post", async () => {
        if (users.length < 5)
            throw new Error("this test requires at least 5 users")

        const commenters = users.slice(0, 5)
        const responses = await Promise.all(commenters.map((u, i) => u.agent.post(`/v1/reviews/${review.id}/comments`).send({
            content: `comment ${i}`
        })))

        const updatedReview = await prisma.review.findUnique({ where: {id: review.id }})
        expect(updatedReview?.commentCount).toBe(commenters.length)

        responses.forEach((res, i) => {
            expect(res.status).toBe(201)
            expect(res.body.data.content).toBe(`comment ${i}`)
        })
        
        const comments = await prisma.comment.findMany({where: {reviewId: review.id}})
        expect(comments.length).toBe(commenters.length)
        expect(comments.map(c => c.content)).toEqual(expect.arrayContaining(responses.map(r => r.body.data.content)))
    })

    test("add comment to comment", async () => {
        if (users.length < 5)
            throw new Error("this test requires at least 5 users")

        const parentCommenter = users[0]
        const parentCommentRes = await parentCommenter?.agent.post(`/v1/reviews/${review.id}/comments`).send({
            content: "parent comment"
        })
        const commenters = users.slice(1, 5)
        const replyRes = await Promise.all(commenters.map((u, i) => u.agent.post(`/v1/reviews/${review.id}/comments/${parentCommentRes?.body.data.id}`).send({
            content: `comment ${i}`
        })))

        const parentComment = await prisma.comment.findMany({
            where: {
                commentId: null, 
                reviewId: review.id
            },
            include: {
                replies: true
            }
        })

        const updatedReview = await prisma.review.findUnique({ where: {id: review.id }})
        expect(updatedReview?.commentCount).toBe(commenters.length + 1)

        replyRes.forEach(r => expect(r.status).toBe(201))
        expect(parentComment[0]?.authorId).toBe(parentCommenter?.details.id)
        expect(parentComment[0]?.replies.length).toBe(commenters.length)
        expect(parentComment[0]?.replies.map(r => r.content)).toEqual(expect.arrayContaining(replyRes.map(r => r.body.data.content)))
    })

    test("soft deletes comment if it has replies", async () => {
        if (users.length < 2)
            throw new Error("this test requires at least 2 users")

        const parentCommentRes = await users[0]?.agent.post(`/v1/reviews/${review.id}/comments`).send({
            content: "parent comment"
        })
        const replyRes = await users[1]?.agent.post(`/v1/reviews/${review.id}/comments/${parentCommentRes?.body.data.id}`).send({
            content: "reply to parent comment"
        })
        
        const res = await users[0]?.agent.delete(`/v1/reviews/${review.id}/comments/${parentCommentRes?.body.data.id}`)
        const updatedParentComment = await prisma.comment.findUnique({
            where: { id: parentCommentRes?.body.data.id },
            include: {
                replies: true
            }
        })
        const updatedReview = await prisma.review.findUnique({ where: {id: review.id }})

        expect(res?.status).toBe(200)
        expect(updatedReview?.commentCount).toBe(1)
        expect(updatedParentComment?.authorId).toBe(null)
        expect(updatedParentComment?.content).toBe("[comment deleted]")
        expect(updatedParentComment?.replies[0]?.commentId).toBe(parentCommentRes?.body.data.id)
        expect(updatedParentComment?.id).toBe(parentCommentRes?.body.data.id)
        expect(updatedParentComment?.replies[0]?.content).toBe(replyRes?.body.data.content)

    })

    test("user deletes comment, deletes comment if it has no replies", async () => {
        if (users.length < 2)
            throw new Error("this test requires at least 2 users")

        const res = await users[0]?.agent.post(`/v1/reviews/${review.id}/comments`).send({
            content: "parent comment"
        })
        await users[0]?.agent.delete(`/v1/reviews/${review.id}/comments/${res?.body.data.id}`)

        const updatedComment = await prisma.comment.findUnique({
            where: { id: res?.body.data.id },
            include: {
                replies: true
            }
        })
        const updatedReview = await prisma.review.findUnique({ where: {id: review.id }})
        
        expect(updatedReview?.commentCount).toBe(0)
        expect(updatedComment).toBe(null)
    })

    test("empty string content", async () => {
        const res = await users[0]?.agent.post(`/v1/reviews/${review.id}/comments`).send({
            content: ""
        })
        expect(res?.status).toBe(400)
    })

    // crucial because authorId can be null
    test("unauthorized check ", async () => {
        const res = await request(app).post(`/v1/reviews/${review.id}/comments`).send({
            content: "unauthorized comment"
        })
        expect(res.status).toBe(401)
    })

    describe("unrelated review id", () => {
        let unrelatedReview: Review;
        let seriesReview: {body: { data: Review }};

        beforeAll(async () => {
            await poster.agent.get(`/v1/media/series?id=${TmdbMockPayloads.seriesDetails.id}`)
            await poster.agent.post(`/v1/watchlist/series`).send({
                id: TmdbMockPayloads.seriesDetails.id,
                hasWatched: true,
                rating: "9"
            })
 
            seriesReview = await poster.agent.post(`/v1/reviews`).send({
                movieId: null,
                seriesId: TmdbMockPayloads.seriesDetails.id,
                content: "great series",
                rating: "9",
                isPublic: true
            })

            unrelatedReview = seriesReview.body.data
        })

        afterAll(async () => {
            await prisma.review.delete({ where: {id: unrelatedReview.id}})
            await prisma.watchListSeries.delete({where: {userId_seriesId: {
                userId: seriesReview.body.data.authorId,
                seriesId: seriesReview.body.data.seriesId as number
            }}})
            await prisma.series.delete({ where: {id: TmdbMockPayloads.seriesDetails.id }})
        })

        test("add comment reply on unrelated review", async () => {
            if (users.length < 2)
                throw new Error("this test requires at least 2 users")

            const commenters = users.slice(0, 2)
            const parentComment = await commenters[0]?.agent.post(`/v1/reviews/${review.id}/comments`)
                .send({ content: "parent comment" })
            expect(parentComment?.status).toBe(201)

            const badReply = await commenters[1]?.agent.post(`/v1/reviews/${unrelatedReview.id}/comments/${parentComment?.body.data.id}`)
                .send({ content: "bad reply" })
            expect(badReply?.status).toBe(404)
        })

        test("delete comment on unrelated review", async () => {
             if (users.length < 1)
                throw new Error("this test requires 1 user")

            const commenter = users[0]
            const parentComment = await commenter?.agent.post(`/v1/reviews/${review.id}/comments`)
                .send({ content: "parent comment" })
            expect(parentComment?.status).toBe(201)

            const badDelete = await commenter?.agent.delete(`/v1/reviews/${unrelatedReview.id}/comments/${parentComment?.body.data.id}`)
            expect(badDelete?.status).toBe(404)
        })
    })
})


test.todo("user deletes account, deletes like and decrements likeCount")
test.todo("user deletes account, soft deletes comment account name")