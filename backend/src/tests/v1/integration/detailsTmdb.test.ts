import { describe, test, beforeAll, expect, afterEach, vi } from "vitest";
import { testUserGen } from "../../utils/userGeneration.ts";
import type { TestUser } from "../../utils/userGeneration.ts";
import { prisma } from "../../../lib/prisma.ts";
import tmdb from "../../../lib/tmdb.ts";
import TmdbMockPayloads from "../../mocks/TmdbMockPayloads.ts";

let user: TestUser;
beforeAll(async () => {
    vi.spyOn(Object.getPrototypeOf(tmdb.movies), "details").mockResolvedValue(TmdbMockPayloads.movieDetails)
    vi.spyOn(Object.getPrototypeOf(tmdb.tvShows), "details").mockResolvedValue(TmdbMockPayloads.seriesDetails)
    user = (await testUserGen(1))[0] as TestUser
})

afterEach(async () => {
    await Promise.all([prisma.movie.deleteMany(), prisma.series.deleteMany()])
})

type mediaType = "movies" | "series"
async function getDetails(type: mediaType, id?: string | number) {
    const params = new URLSearchParams()
    if (id !== undefined)
        params.append("id", id.toString())
    return user.agent.get(`/v1/media/${type}?${params.toString()}`)
}

describe("movies", () => {
    test("returns movie details", async () => {
        const res = await getDetails("movies", TmdbMockPayloads.movieDetails.id)
        expect(res.body.data.title).not.toBeUndefined()
    })

    test("saves to db when checking a movie out", async () => {
        const res = await getDetails("movies", TmdbMockPayloads.movieDetails.id)
        const movie = await prisma.movie.findFirst({ where: {id: res.body.data.id } })
        expect(movie?.id).toBe(res.body.data.id)
        expect(movie?.title).toBe(res.body.data.title)
    })

    test("updates db record when checking a movie out", async () => {
        vi.spyOn(Object.getPrototypeOf(tmdb.movies), "details").mockResolvedValueOnce({
            ...TmdbMockPayloads.movieDetails,
            title: "stale"
        })
        
        await getDetails("movies", TmdbMockPayloads.movieDetails.id)
        const staleMovie = await prisma.movie.findFirst({ where: {id: TmdbMockPayloads.movieDetails.id } })
        expect(staleMovie?.title).toBe("stale")

        await getDetails("movies", TmdbMockPayloads.movieDetails.id)
        const newMovie = await prisma.movie.findFirst({ where: {id: TmdbMockPayloads.movieDetails.id } })
        expect(newMovie?.title).not.toBe("stale")
    })
})

describe("series", () => {
    test("returns series details", async () => {
        const res = await getDetails("series", TmdbMockPayloads.seriesDetails.id)
        expect(res.body.data.name).not.toBeUndefined()
    })

    test("saves to db when checking a series out", async () => {
        const res = await getDetails("series", TmdbMockPayloads.seriesDetails.id)
        const series = await prisma.series.findFirst({ where: {id: res.body.data.id } })
        expect(series?.id).toBe(res.body.data.id)
        expect(series?.name).toBe(res.body.data.name)
    })

    test("updates db record when checking a series out", async () => {
        vi.spyOn(Object.getPrototypeOf(tmdb.tvShows), "details").mockResolvedValueOnce({
            ...TmdbMockPayloads.seriesDetails,
            name: "stale"
        })
    
        await getDetails("series", TmdbMockPayloads.seriesDetails.id)
        const staleSeries = await prisma.series.findFirst({ where: {id: TmdbMockPayloads.seriesDetails.id } })
        expect(staleSeries?.name).toBe("stale")

        await getDetails("series", TmdbMockPayloads.seriesDetails.id)
        const newSeries = await prisma.series.findFirst({ where: {id: TmdbMockPayloads.seriesDetails.id } })
        expect(newSeries?.name).not.toBe("stale")
    })
})