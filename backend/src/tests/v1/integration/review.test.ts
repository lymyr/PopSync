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