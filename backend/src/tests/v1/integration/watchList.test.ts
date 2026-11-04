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

beforeEach(async () => {
    await Promise.all([
        user.agent.get(`/v1/media/movies?id=${TmdbMockPayloads.movieDetails.id}`),
        user.agent.get(`/v1/media/series?id=${TmdbMockPayloads.movieDetails.id}`)
    ])
})

afterAll(async () => {
    await Promise.all([prisma.user.deleteMany(), prisma.session.deleteMany()])
})

afterEach(async () => {
    await Promise.all([prisma.watchListMovie.deleteMany(), prisma.watchListSeries.deleteMany()])
    await Promise.all([prisma.movie.deleteMany(), prisma.series.deleteMany()])
})

describe("movies", () => {
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
    test.todo("adds existing series record to watchlist")
})