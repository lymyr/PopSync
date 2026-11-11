import { expect, test, describe, beforeAll, vi, afterAll, afterEach } from "vitest";
import tmdb from "../../../lib/tmdb.ts";
import TmdbMockPayloads from "../../mocks/TmdbMockPayloads.ts";
import { testUserGen, type TestUser } from "../../utils/userGeneration.ts";
import { prisma } from "../../../lib/prisma.ts";
import generateMockId from "../../utils/generateMockId.ts";
import request  from "supertest";
import app from "../../../app.ts";

let user: TestUser;
let otherUser: TestUser;
beforeAll(async () => {
    const users = await testUserGen(2)
    user = users[0] as TestUser
    otherUser = users[1] as TestUser

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


// user that is not logged in
// should catch isAuth for other endpoints as well
// kinda tedious to put this test in each endpoint =~=
test("unauthorized endpoint check", async () => {
    const res = await request(app).get(`/v1/users/${user.details.id}/watchlist`)
    expect(res.status).toBe(401)
})

describe("movies", () => {
    afterEach(async () => {
        await prisma.watchListMovie.deleteMany()
    })

    describe("bad payload tests", () => {
        test("missing hasWatched", async () => {
            const res = await user.agent.post(`/v1/users/${user.details.id}/watchlist/movies`)
                .send({
                    id: TmdbMockPayloads.movieDetails.id,
                    rating: null
                })
            expect(res.status).toBe(400)
        })

        test("invalid hasWatched", async () => {
            const res = await user.agent.post(`/v1/users/${user.details.id}/watchlist/movies`)
                .send({
                    id: TmdbMockPayloads.movieDetails.id,
                    hasWatched: "watched",
                    rating: 8
                })
            expect(res.status).toBe(400)
        })

        test("missing rating", async () => {
            const res = await user.agent.post(`/v1/users/${user.details.id}/watchlist/movies`)
                .send({
                    id: TmdbMockPayloads.movieDetails.id,
                    hasWatched: false
                })
            expect(res.status).toBe(400)
        })

        test("negative rating", async () => {
            const res = await user.agent.post(`/v1/users/${user.details.id}/watchlist/movies`)
                .send({
                    id: TmdbMockPayloads.movieDetails.id,
                    hasWatched: false,
                    rating: -1
                })
            expect(res.status).toBe(400)
        })

        test("rating > 10", async () => {
            const res = await user.agent.post(`/v1/users/${user.details.id}/watchlist/movies`)
                .send({
                    id: TmdbMockPayloads.movieDetails.id,
                    hasWatched: false,
                    rating: 11
                })
            expect(res.status).toBe(400)
        })

        test("rating string", async () => {
            const res = await user.agent.post(`/v1/users/${user.details.id}/watchlist/movies`)
                .send({
                    id: TmdbMockPayloads.movieDetails.id,
                    hasWatched: false,
                    rating: "one"
                })
            expect(res.status).toBe(400)
        })
    })

    describe("valid endpoints", () => {
        test("adds existing movie record to watchlist", async () => {
            const res = await user.agent.post(`/v1/users/${user.details.id}/watchlist/movies`)
                .send({
                    id: TmdbMockPayloads.movieDetails.id,
                    hasWatched: false,
                    rating: 0
                })
            const watchlist = await prisma.watchListMovie.findFirst({
                where: {
                    userId: user.details.id,
                    movieId: TmdbMockPayloads.movieDetails.id
                }
            })

            expect(res.status).toBe(201)
            expect(watchlist?.movieId).toBe(TmdbMockPayloads.movieDetails.id)
            expect(watchlist?.userId).toBe(user.details.id)
        })

        test("update watchlist", async () => {
            await user.agent.post(`/v1/users/${user.details.id}/watchlist/movies`)
                .send({
                    id: TmdbMockPayloads.movieDetails.id,
                    hasWatched: false,
                    rating: 3
                })
            const nonUpdatedWatchlist = await prisma.watchListMovie.findFirst({
                where: {
                    userId: user.details.id,
                    movieId: TmdbMockPayloads.movieDetails.id
                }
            })
            expect(nonUpdatedWatchlist?.hasWatched).toBe(false)
            expect(nonUpdatedWatchlist?.rating).toBe(3)

            await user.agent.put(`/v1/users/${user.details.id}/watchlist/movies`)
                .send({
                    id: TmdbMockPayloads.movieDetails.id,
                    hasWatched: true,
                    rating: 10
                })

            const updatedWatchlist = await prisma.watchListMovie.findFirst({
                where: {
                    userId: user.details.id,
                    movieId: TmdbMockPayloads.movieDetails.id
                }
            })
            expect(updatedWatchlist?.hasWatched).toBe(true)
            expect(updatedWatchlist?.rating).toBe(10)
        })

        test("remove watchlist", async () => {
            await user.agent.post(`/v1/users/${user.details.id}/watchlist/movies`)
                .send({
                    id: TmdbMockPayloads.movieDetails.id,
                    hasWatched: false,
                    rating: null
                })
            const wlist = await prisma.watchListMovie.findFirst({
                where: {
                    userId: user.details.id,
                    movieId: TmdbMockPayloads.movieDetails.id
                }
            })
            expect(wlist).not.toBeNull()

            await user.agent.delete(`/v1/users/${user.details.id}/watchlist/movies`)
                .send({ id: TmdbMockPayloads.movieDetails.id })

            const deletedWList = await prisma.watchListMovie.findFirst({
                where: {
                    userId: user.details.id,
                    movieId: TmdbMockPayloads.movieDetails.id
                }
            })
            expect(deletedWList).toBeNull()
        })
    })

    describe("unauthorized endpoints", () => {
        test("adds existing movie record to watchlist", async () => {
            const res = await user.agent.post(`/v1/users/${otherUser.details.id}/watchlist/movies`)
                .send({
                    id: TmdbMockPayloads.movieDetails.id,
                    hasWatched: false,
                    rating: 0
                })
            expect(res.status).toBe(401)
        })

        test("update watchlist", async () => {
            const otherUserRes = await otherUser.agent.post(`/v1/users/${otherUser.details.id}/watchlist/movies`)
                .send({
                    id: TmdbMockPayloads.movieDetails.id,
                    hasWatched: false,
                    rating: 3
                })
            expect(otherUserRes.status).toBe(201)

            const res = await user.agent.put(`/v1/users/${otherUser.details.id}/watchlist/movies`)
                .send({
                    id: TmdbMockPayloads.movieDetails.id,
                    hasWatched: true,
                    rating: 10
                })
            expect(res.status).toBe(401)
        })

        test("remove watchlist", async () => {
            const otherUserRes = await otherUser.agent.post(`/v1/users/${otherUser.details.id}/watchlist/movies`)
                .send({
                    id: TmdbMockPayloads.movieDetails.id,
                    hasWatched: false,
                    rating: null
                })
            expect(otherUserRes.status).toBe(201)

            const res = await user.agent.delete(`/v1/users/${otherUser.details.id}/watchlist/movies`)
                .send({ id: TmdbMockPayloads.movieDetails.id })
            expect(res.status).toBe(401)
        })
    })

    test("reject non-existing record to watchlist", async () => {
        const mockId = generateMockId([TmdbMockPayloads.movieDetails.id])
        const res = await user.agent.post(`/v1/users/${user.details.id}/watchlist/movies`)
            .send({
                id: mockId,
                hasWatched: false,
                rating: 7
            })
        const watchlist = await prisma.watchListMovie.findFirst({
            where: {
                userId: user.details.id,
                movieId: mockId
            }
        })

        expect(res.status).toBe(404)
        expect(watchlist).toBeNull()
    })
})

describe("series", () => {
    afterEach(async () => {
        await prisma.watchListSeries.deleteMany()
    })

    describe("bad payload tests", () => {
        test("missing hasWatched", async () => {
            const res = await user.agent.post(`/v1/users/${user.details.id}/watchlist/series`)
                .send({
                    id: TmdbMockPayloads.seriesDetails.id,
                    rating: null
                })
            expect(res.status).toBe(400)
        })

        test("invalid hasWatched", async () => {
            const res = await user.agent.post(`/v1/users/${user.details.id}/watchlist/series`)
                .send({
                    id: TmdbMockPayloads.seriesDetails.id,
                    hasWatched: "watched",
                    rating: 8
                })
            expect(res.status).toBe(400)
        })

        test("missing rating", async () => {
            const res = await user.agent.post(`/v1/users/${user.details.id}/watchlist/series`)
                .send({
                    id: TmdbMockPayloads.seriesDetails.id,
                    hasWatched: false
                })
            expect(res.status).toBe(400)
        })

        test("negative rating", async () => {
            const res = await user.agent.post(`/v1/users/${user.details.id}/watchlist/series`)
                .send({
                    id: TmdbMockPayloads.seriesDetails.id,
                    hasWatched: false,
                    rating: -1
                })
            expect(res.status).toBe(400)
        })

        test("rating > 10", async () => {
            const res = await user.agent.post(`/v1/users/${user.details.id}/watchlist/series`)
                .send({
                    id: TmdbMockPayloads.seriesDetails.id,
                    hasWatched: false,
                    rating: 11
                })
            expect(res.status).toBe(400)
        })

        test("rating string", async () => {
            const res = await user.agent.post(`/v1/users/${user.details.id}/watchlist/series`)
                .send({
                    id: TmdbMockPayloads.seriesDetails.id,
                    hasWatched: false,
                    rating: "one"
                })
            expect(res.status).toBe(400)
        })
    })

    describe("valid endpoints", () => {
        test("adds existing series record to watchlist", async () => {
            const res = await user.agent.post(`/v1/users/${user.details.id}/watchlist/series`)
                .send({
                    id: TmdbMockPayloads.seriesDetails.id,
                    hasWatched: false,
                    rating: null
                })
            const watchlist = await prisma.watchListSeries.findFirst({
                where: {
                    userId: user.details.id,
                    seriesId: TmdbMockPayloads.seriesDetails.id
                }
            })

            expect(res.status).toBe(201)
            expect(watchlist?.seriesId).toBe(TmdbMockPayloads.seriesDetails.id)
            expect(watchlist?.userId).toBe(user.details.id)
        })

        test("update watchlist", async () => {
            await user.agent.post(`/v1/users/${user.details.id}/watchlist/series`)
                .send({
                    id: TmdbMockPayloads.seriesDetails.id,
                    hasWatched: false,
                    rating: null
                })
            const nonUpdatedWatchlist = await prisma.watchListSeries.findFirst({
                where: {
                    userId: user.details.id,
                    seriesId: TmdbMockPayloads.seriesDetails.id
                }
            })
            expect(nonUpdatedWatchlist?.hasWatched).toBe(false)
            await user.agent.put(`/v1/users/${user.details.id}/watchlist/series`)
                .send({
                    id: TmdbMockPayloads.seriesDetails.id,
                    hasWatched: true,
                    rating: 5
                })

            const updatedWatchlist = await prisma.watchListSeries.findFirst({
                where: {
                    userId: user.details.id,
                    seriesId: TmdbMockPayloads.seriesDetails.id
                }
            })
            expect(updatedWatchlist?.hasWatched).toBe(true)
            expect(updatedWatchlist?.rating).toBe(5)
        })

        test("remove watchlist", async () => {
            await user.agent.post(`/v1/users/${user.details.id}/watchlist/series`)
                .send({
                    id: TmdbMockPayloads.seriesDetails.id,
                    hasWatched: false,
                    rating: null
                })
            const wlist = await prisma.watchListSeries.findFirst({
                where: {
                    userId: user.details.id,
                    seriesId: TmdbMockPayloads.seriesDetails.id
                }
            })
            expect(wlist).not.toBeNull()

            await user.agent.delete(`/v1/users/${user.details.id}/watchlist/series`)
                .send({ id: TmdbMockPayloads.seriesDetails.id })

            const deletedWList = await prisma.watchListSeries.findFirst({
                where: {
                    userId: user.details.id,
                    seriesId: TmdbMockPayloads.seriesDetails.id
                }
            })
            expect(deletedWList).toBeNull()
        })
    })

    describe("unauthorized endpoints", () => {
        test("adds existing series record to watchlist", async () => {
            const res = await user.agent.post(`/v1/users/${otherUser.details.id}/watchlist/series`)
                .send({
                    id: TmdbMockPayloads.seriesDetails.id,
                    hasWatched: false,
                    rating: 0
                })
            expect(res.status).toBe(401)
        })

        test("update watchlist", async () => {
            const otherUserRes = await otherUser.agent.post(`/v1/users/${otherUser.details.id}/watchlist/series`)
                .send({
                    id: TmdbMockPayloads.seriesDetails.id,
                    hasWatched: false,
                    rating: 3
                })
            expect(otherUserRes.status).toBe(201)

            const res = await user.agent.put(`/v1/users/${otherUser.details.id}/watchlist/series`)
                .send({
                    id: TmdbMockPayloads.seriesDetails.id,
                    hasWatched: true,
                    rating: 10
                })
            expect(res.status).toBe(401)
        })

        test("remove watchlist", async () => {
            const otherUserRes = await otherUser.agent.post(`/v1/users/${otherUser.details.id}/watchlist/series`)
                .send({
                    id: TmdbMockPayloads.seriesDetails.id,
                    hasWatched: false,
                    rating: null
                })
            expect(otherUserRes.status).toBe(201)

            const res = await user.agent.delete(`/v1/users/${otherUser.details.id}/watchlist/series`)
                .send({ id: TmdbMockPayloads.seriesDetails.id })
            expect(res.status).toBe(401)
        })
    })
    
    test("reject non-existing record to watchlist", async () => {
        const mockId = generateMockId([TmdbMockPayloads.seriesDetails.id])
        const res = await user.agent.post(`/v1/users/${user.details.id}/watchlist/series`)
            .send({
                id: mockId,
                hasWatched: false,
                rating: null
            })
        const watchlist = await prisma.watchListSeries.findFirst({
            where: {
                userId: user.details.id,
                seriesId: mockId
            }
        })

        expect(res.status).toBe(404)
        expect(watchlist).toBeNull()
    })
})

describe("retrieve watchlist", () => {
    let friend: TestUser
    beforeAll(async () => {
        friend = (await testUserGen(1, "friend"))[0] as TestUser

        await Promise.all([
            friend.agent.post(`/v1/users/${friend.details.id}/watchlist/series`).send({
                id: TmdbMockPayloads.seriesDetails.id,
                hasWatched: false,
                rating: "10"
            }),
            otherUser.agent.post(`/v1/users/${otherUser.details.id}/watchlist/series`).send({
                id: TmdbMockPayloads.seriesDetails.id,
                hasWatched: false,
                rating: "1"
            }),
            user.agent.post(`/v1/users/${user.details.id}/watchlist/movies`).send({
                id: TmdbMockPayloads.movieDetails.id,
                hasWatched: false,
                rating: "10"
            }),
            user.agent.post(`/v1/users/${user.details.id}/watchlist/series`).send({
                id: TmdbMockPayloads.seriesDetails.id,
                hasWatched: false,
                rating: "10"
            }),
            friend.agent.post(`/v1/connections/${user.details.id}`).then(() => user.agent.put(`/v1/connections/${friend.details.id}`))
        ])
    })
    
    afterAll(async () => {
        await prisma.user.deleteMany({
            where: {
                id: {
                    in: [friend.details.id, otherUser.details.id]
                }
            }
        })
    })

    test("returns all of user watchlist", async () => {
        const res = await user.agent.get(`/v1/users/${user.details.id}/watchlist`)

        expect(res.body.data.movies[0].id).toBe(TmdbMockPayloads.movieDetails.id)
        expect(res.body.data.movies[0].hasWatched).toEqual(expect.any(Boolean))
        expect(res.body.data.movies[0].rating).not.toBeUndefined()

        expect(res.body.data.series[0].id).toBe(TmdbMockPayloads.seriesDetails.id)
        expect(res.body.data.series[0].hasWatched).toEqual(expect.any(Boolean)) 
        expect(res.body.data.series[0].rating).not.toBeUndefined()

        await Promise.all([prisma.watchListMovie.deleteMany(), prisma.watchListSeries.deleteMany()])
        await Promise.all([prisma.movie.deleteMany(), prisma.series.deleteMany()])
    })

    test("retrieves watchlist of friend", async () => {
        const res = await user.agent.get(`/v1/users/${friend.details.id}/watchlist`)
        expect(res.status).toBe(200)
    })

    test("watchlist retrieval with user with no accepted connection", async () => {
        const res = await user.agent.get(`/v1/users/${otherUser.details.id}/watchlist`)
        expect(res.status).toBe(401)
    })
})
