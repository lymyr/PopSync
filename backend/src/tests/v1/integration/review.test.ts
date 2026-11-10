import { afterAll, beforeAll, describe, expect, test, vi, afterEach } from "vitest";
import { testUserGen, type TestUser } from "../../utils/userGeneration.ts";
import { prisma } from "../../../lib/prisma.ts";
import TmdbMockPayloads from "../../mocks/TmdbMockPayloads.ts";
import tmdb from "../../../lib/tmdb.ts";
import generateMockId from "../../utils/generateMockId.ts";

let user: TestUser
beforeAll(async () => {
    user = (await testUserGen(1))[0] as TestUser

    vi.spyOn(Object.getPrototypeOf(tmdb.movies), "details").mockResolvedValue(TmdbMockPayloads.movieDetails)
    vi.spyOn(Object.getPrototypeOf(tmdb.tvShows), "details").mockResolvedValue(TmdbMockPayloads.seriesDetails)

    await Promise.all([
        user.agent.get(`/v1/media/movies?id=${TmdbMockPayloads.movieDetails.id}`),
        user.agent.get(`/v1/media/series?id=${TmdbMockPayloads.seriesDetails.id}`)
    ])
})

afterAll(async () => {
    await Promise.all([
        prisma.user.deleteMany(),
        prisma.session.deleteMany(),
        prisma.movie.deleteMany(),
        prisma.series.deleteMany()
    ])
})

afterEach(async () => {
    await prisma.review.deleteMany();
})

function payload(movieId: any, seriesId: any, content: any, rating: any, isPublic: any = true) {
    return {
        movieId,
        seriesId,
        content,
        rating,
        isPublic
    }
}

describe("series", () => {
    beforeAll(async () => {
        await user.agent.post(`/v1/watchlist/series`).send({
            id: TmdbMockPayloads.seriesDetails.id,
            hasWatched: false,
            rating: "10"
        })
    })

    afterAll(async () => {
        await prisma.watchListSeries.deleteMany()
    })

    test("create series review with sideEffect", async () => {
        const res = await user.agent.post("/v1/reviews")
            .send(payload(
                null,
                `${TmdbMockPayloads.seriesDetails.id}`,
                "amazing series",
                "10"
            ))
        
        const watchlist = await prisma.watchListSeries.findUnique({
            where: {
                userId_seriesId: {
                    userId: user.details.id,
                    seriesId: res.body.data.seriesId
                }
            }
        })

        expect(watchlist?.rating).toBe(10)
        expect(res.status).toBe(201)
        expect(res.body.data.seriesId).toBe(TmdbMockPayloads.seriesDetails.id)
    })

    test("update series review with sideEffect", async () => {
        const createRes = await user.agent.post("/v1/reviews")
            .send(payload(
                null,
                `${TmdbMockPayloads.seriesDetails.id}`,
                "meh series",
                "3"
            ))

        const updateRes = await user.agent.put(`/v1/reviews/${createRes.body.data.id}`)
            .send(payload(
                undefined, undefined,
                "it's goated nvm",
                "9"
            ))

        const watchlist = await prisma.watchListSeries.findUnique({
            where: {
                userId_seriesId: {
                    userId: user.details.id,
                    seriesId: createRes.body.data.seriesId
                }
            }
        })

        expect(watchlist?.rating).toBe(9)
        expect(updateRes.status).toBe(200)
        expect(updateRes.body.data.seriesId).toBe(TmdbMockPayloads.seriesDetails.id)
    })


    describe("fails", () => {
        test("reviewing the same media", async () => {
            const res = await Promise.all([
                user.agent.post("/v1/reviews")
                    .send(payload(
                        null,
                        `${TmdbMockPayloads.seriesDetails.id}`,
                        "horrid movie",
                        "0"
                    )),
                user.agent.post("/v1/reviews")
                    .send(payload(
                        null,
                        `${TmdbMockPayloads.seriesDetails.id}`,
                        "amazing movie",
                        "10"
                    ))
            ])

            const successfulRes = res[0].status == 201 ? res[0] : res[1]
            const unsucessfulRes = res[0].status != 201 ? res[0] : res[1]

            expect(successfulRes.status).not.toBe(unsucessfulRes.status)
            expect(unsucessfulRes.status).toBe(400)
        })

        test("update non-existing record", async () => {
            const createRes = await user.agent.post("/v1/reviews")
                .send(payload(
                    null,
                    `${TmdbMockPayloads.seriesDetails.id}`,
                    "horrid movie",
                    "0"
                ))

            const res = await user.agent.put(`/v1/reviews/${generateMockId([createRes.body.data.id])}`)
                .send(payload(
                    undefined, undefined,
                    "nvm it's goated get rekt",
                    "10"
                ))
                
            expect(res.status).toBe(404)
        })
    })
})

describe("movies", () => {
    beforeAll(async () => {
        await user.agent.post(`/v1/watchlist/movies`).send({
            id: TmdbMockPayloads.movieDetails.id,
            hasWatched: true,
            rating: "0"
        })
    })

    afterAll(async () => {
        await prisma.watchListMovie.deleteMany()
    })

    test("create review with watch list side effect", async () => {
        const res = await user.agent.post("/v1/reviews")
            .send(payload(
                `${TmdbMockPayloads.movieDetails.id}`,
                null,
                "horrid movie",
                "0"
            ))

        const watchlist = await prisma.watchListMovie.findUnique({
            where: {
                userId_movieId: {
                    userId: user.details.id,
                    movieId: res.body.data.movieId
                }
            }
        })

        expect(watchlist?.rating).toBe(0)
        expect(res.status).toBe(201)
        expect(res.body.data.movieId).toBe(TmdbMockPayloads.movieDetails.id)
    })

    test("update review with watchlist side effect", async () => {
        const createRes = await user.agent.post("/v1/reviews")
            .send(payload(
                `${TmdbMockPayloads.movieDetails.id}`,
                null,
                "horrid movie",
                "0"
            ))

        const updateRes = await user.agent.put(`/v1/reviews/${createRes.body.data.id}`)
            .send(payload(
                undefined, undefined,
                "nvm it's goated get rekt",
                "10"
            ))
        const watchlist = await prisma.watchListMovie.findUnique({
            where: {
                userId_movieId: {
                    userId: user.details.id,
                    movieId: createRes.body.data.movieId
                }
            }
        })

        expect(updateRes.status).toBe(200)
        expect(updateRes.body.data.rating).toBe(10)
        expect(watchlist?.rating).toBe(10)
    })

    describe("fails", () => {
        test("reviewing the same media", async () => {
            const res = await Promise.all([
                user.agent.post("/v1/reviews")
                    .send(payload(
                        `${TmdbMockPayloads.movieDetails.id}`,
                        null,
                        "horrid movie",
                        "0"
                    )),
                user.agent.post("/v1/reviews")
                    .send(payload(
                        `${TmdbMockPayloads.movieDetails.id}`,
                        null,
                        "amazing movie",
                        "10"
                    ))
            ])

            const successfulRes = res[0].status == 201 ? res[0] : res[1]
            const unsucessfulRes = res[0].status != 201 ? res[0] : res[1]

            expect(successfulRes.status).not.toBe(unsucessfulRes.status)
            expect(unsucessfulRes.status).toBe(400)
        })

        test("update non-existing record", async () => {
            const createRes = await user.agent.post("/v1/reviews")
                .send(payload(
                    `${TmdbMockPayloads.movieDetails.id}`,
                    null,
                    "horrid movie",
                    "0"
                ))

            const res = await user.agent.put(`/v1/reviews/${generateMockId([createRes.body.data.id])}`)
                .send(payload(
                    undefined, undefined,
                    "nvm it's goated get rekt",
                    "10"
                ))

            expect(res.status).toBe(404)
        })
    })
    
})

describe("read and deletes", () => {
    let otherUser: TestUser
    beforeAll(async () => {
        await user.agent.post(`/v1/watchlist/series`).send({
            id: TmdbMockPayloads.seriesDetails.id,
            hasWatched: false,
            rating: "10"
        })
        otherUser = (await testUserGen(1, "otherDude"))[0] as TestUser
    })

    afterAll(async () => {
        await prisma.watchListSeries.deleteMany()
    })

    afterEach(async () => {
        await prisma.review.deleteMany()
    })

    test("delete review", async () => {
        const reviewRes = await user.agent.post("/v1/reviews")
            .send(payload(
                null,
                TmdbMockPayloads.seriesDetails.id,
                "great",
                "9",
                true
            ))
        const res = await user.agent.delete(`/v1/reviews/${reviewRes.body.data.id}`)
        expect(res.status).toBe(200)
        const prismaRes = await prisma.review.findFirst({where: {id: reviewRes.body.data.id }})
        expect(prismaRes).toBeNull()
    })

    test("unauthorized delete", async () => {
        const reviewRes = await user.agent.post("/v1/reviews")
            .send(payload(
                null,
                TmdbMockPayloads.seriesDetails.id,
                "great",
                "9",
                true
            ))
        const res = await otherUser.agent.delete(`/v1/reviews/${reviewRes.body.data.id}`)
        expect(res.status).toBe(401)
        const prismaRes = await prisma.review.findFirst({where: {id: reviewRes.body.data.id }})
        expect(prismaRes).not.toBeNull()
    })
    
    test("get review and its upto 3 depth comments", async () => {
        const reviewRes = await user.agent.post("/v1/reviews")
            .send(payload(
                null,
                TmdbMockPayloads.seriesDetails.id,
                "great",
                "9",
                true
            ))
        const reviewId = reviewRes.body.data.id as number
        
        await Promise.all([
            user.agent.post(`/v1/reviews/${reviewId}/comments`).send({content: "cool"}),
            user.agent.post(`/v1/reviews/${reviewId}/comments`).send({content: "cool"})
        ])

        const rootId = (await user.agent.post(`/v1/reviews/${reviewId}/comments`).send({content: "root"})).body.data.id
        const depth2Id = (await user.agent.post(`/v1/reviews/${reviewId}/comments/${rootId}`).send({content: "depth 2"})).body.data.id
        const depth3Id = (await user.agent.post(`/v1/reviews/${reviewId}/comments/${depth2Id}`).send({content: "depth 3"})).body.data.id
        await user.agent.post(`/v1/reviews/${reviewId}/comments/${depth3Id}`).send({content: "depth 4"})

        const res = await user.agent.get(`/v1/reviews/${reviewId}`)
        expect(res.status).toBe(200)
        expect(res.body.data.comments[2].replies[0].replies[0].replies).toBeUndefined()

        const commentCount = await prisma.comment.count({ where: {reviewId}})
        expect(commentCount).toBe(6)
    })

    test("get comments of review upto 3 depth", async () => {
        const reviewRes = await user.agent.post("/v1/reviews")
            .send(payload(
                null,
                TmdbMockPayloads.seriesDetails.id,
                "great",
                "9",
                true
            ))
        const reviewId = reviewRes.body.data.id as number
        const rootId = (await user.agent.post(`/v1/reviews/${reviewId}/comments`).send({content: "cool"})).body.data.id
        const depth2Id = (await user.agent.post(`/v1/reviews/${reviewId}/comments/${rootId}`).send({content: "depth 2"})).body.data.id
        const depth3Id = (await user.agent.post(`/v1/reviews/${reviewId}/comments/${depth2Id}`).send({content: "depth 3"})).body.data.id
        await user.agent.post(`/v1/reviews/${reviewId}/comments/${depth3Id}`).send({content: "depth 4"})

        const res = await user.agent.get(`/v1/reviews/${reviewId}/comments`)
        expect(res.status).toBe(200)
        expect(res.body.data[0].content).toBe("cool")
        expect(res.body.data[0].replies[0].replies[0].replies).toBeUndefined()
    })
})