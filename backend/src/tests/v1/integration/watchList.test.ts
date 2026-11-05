import { expect, test, describe, beforeAll, vi, afterAll, afterEach, beforeEach } from "vitest";
import tmdb from "../../../lib/tmdb.ts";
import TmdbMockPayloads from "../../mocks/TmdbMockPayloads.ts";
import { testUserGen, type TestUser } from "../../utils/userGeneration.ts";
import { prisma } from "../../../lib/prisma.ts";
import generateMockId from "../../utils/generateMockId.ts";

let user: TestUser;
beforeAll(async () => {
    user = (await testUserGen(1))[0] as TestUser

    vi.spyOn(Object.getPrototypeOf(tmdb.movies), "details").mockResolvedValue(TmdbMockPayloads.movieDetails)
    vi.spyOn(Object.getPrototypeOf(tmdb.tvShows), "details").mockResolvedValue(TmdbMockPayloads.seriesDetails)
})

afterAll(async () => {
    await Promise.all([prisma.user.deleteMany(), prisma.session.deleteMany()])
})

describe("movies", () => {
    beforeEach(async () => {
        await user.agent.get(`/v1/media/movies?id=${TmdbMockPayloads.movieDetails.id}`)
    })

    afterEach(async () => {
        await prisma.watchListMovie.deleteMany()
        await prisma.movie.deleteMany()
    })

    test("adds existing movie record to watchlist", async () => {
        const res = await user.agent.post("/v1/watchlist/movies")
            .send({
                id: TmdbMockPayloads.movieDetails.id,
                hasWatched: false
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

    test("reject non-existing record to watchlist", async () => {
        const mockId = generateMockId([TmdbMockPayloads.movieDetails.id])
        const res = await user.agent.post("/v1/watchlist/movies")
            .send({
                id: mockId,
                hasWatched: false
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

    test("update watchlist", async () => {
        await user.agent.post("/v1/watchlist/movies")
            .send({
                id: TmdbMockPayloads.movieDetails.id,
                hasWatched: false
            })
        const nonUpdatedWatchlist = await prisma.watchListMovie.findFirst({
            where: {
                userId: user.details.id,
                movieId: TmdbMockPayloads.movieDetails.id
            }
        })
        expect(nonUpdatedWatchlist?.hasWatched).toBe(false)
        await user.agent.put("/v1/watchlist/movies")
            .send({
                id: TmdbMockPayloads.movieDetails.id,
                hasWatched: true
            })

        const updatedWatchlist = await prisma.watchListMovie.findFirst({
            where: {
                userId: user.details.id,
                movieId: TmdbMockPayloads.movieDetails.id
            }
        })
        expect(updatedWatchlist?.hasWatched).toBe(true)
    })

    test("remove watchlist", async () => {
        await user.agent.post("/v1/watchlist/movies")
            .send({
                id: TmdbMockPayloads.movieDetails.id,
                hasWatched: false
            })
        const wlist = await prisma.watchListMovie.findFirst({
            where: {
                userId: user.details.id,
                movieId: TmdbMockPayloads.movieDetails.id
            }
        })
        expect(wlist).not.toBeNull()

        await user.agent.delete("/v1/watchlist/movies")
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

describe("series", () => {
    beforeEach(async () => {
        await user.agent.get(`/v1/media/series?id=${TmdbMockPayloads.seriesDetails.id}`)
    })

    afterEach(async () => {
        await prisma.watchListSeries.deleteMany()
        await prisma.series.deleteMany()
    })

    test("adds existing series record to watchlist", async () => {
        const res = await user.agent.post("/v1/watchlist/series")
            .send({
                id: TmdbMockPayloads.seriesDetails.id,
                hasWatched: false
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

    test("reject non-existing record to watchlist", async () => {
        const mockId = generateMockId([TmdbMockPayloads.seriesDetails.id])
        const res = await user.agent.post("/v1/watchlist/series")
            .send({
                id: mockId,
                hasWatched: false
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

    test("update watchlist", async () => {
        await user.agent.post("/v1/watchlist/series")
            .send({
                id: TmdbMockPayloads.seriesDetails.id,
                hasWatched: false
            })
        const nonUpdatedWatchlist = await prisma.watchListSeries.findFirst({
            where: {
                userId: user.details.id,
                seriesId: TmdbMockPayloads.seriesDetails.id
            }
        })
        expect(nonUpdatedWatchlist?.hasWatched).toBe(false)
        await user.agent.put("/v1/watchlist/series")
            .send({
                id: TmdbMockPayloads.seriesDetails.id,
                hasWatched: true
            })

        const updatedWatchlist = await prisma.watchListSeries.findFirst({
            where: {
                userId: user.details.id,
                seriesId: TmdbMockPayloads.seriesDetails.id
            }
        })
        expect(updatedWatchlist?.hasWatched).toBe(true)
    })

    test("remove watchlist", async () => {
        await user.agent.post("/v1/watchlist/series")
            .send({
                id: TmdbMockPayloads.seriesDetails.id,
                hasWatched: false
            })
        const wlist = await prisma.watchListSeries.findFirst({
            where: {
                userId: user.details.id,
                seriesId: TmdbMockPayloads.seriesDetails.id
            }
        })
        expect(wlist).not.toBeNull()

        await user.agent.delete("/v1/watchlist/series")
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


test("returns all of user's watchlist", async () => {
    await Promise.all([
        user.agent.get(`/v1/media/series?id=${TmdbMockPayloads.seriesDetails.id}`),
        user.agent.get(`/v1/media/movies?id=${TmdbMockPayloads.movieDetails.id}`),
    ])
    await Promise.all([
        user.agent.post("/v1/watchlist/series")
            .send({
                id: TmdbMockPayloads.seriesDetails.id,
                hasWatched: false
            }),
        user.agent.post("/v1/watchlist/movies")
            .send({
                id: TmdbMockPayloads.movieDetails.id,
                hasWatched: false
            }),
    ])
    const res = await user.agent.get("/v1/watchlist")

    expect(res.body.data.movies[0].id).toBe(TmdbMockPayloads.movieDetails.id)
    expect(res.body.data.series[0].id).toBe(TmdbMockPayloads.seriesDetails.id)

    await Promise.all([prisma.watchListMovie.deleteMany(), prisma.watchListSeries.deleteMany()])
    await Promise.all([prisma.movie.deleteMany(), prisma.series.deleteMany()])
})