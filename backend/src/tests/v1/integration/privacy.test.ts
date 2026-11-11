import { afterAll, beforeAll, beforeEach, test, vi } from "vitest";
import { testUserGen, type TestUser } from "../../utils/userGeneration.ts";
import TmdbMockPayloads from "../../mocks/TmdbMockPayloads.ts";
import { describe } from "node:test";
import { prisma } from "../../../lib/prisma.ts";
import tmdb from "../../../lib/tmdb.ts";


let friend: TestUser;
let otherUser: TestUser;
let user: TestUser;
beforeAll(async () => {
    const users = await testUserGen(3)
    friend = users[2] as TestUser
    otherUser = users[1] as TestUser
    user = users[0] as TestUser
    
    vi.spyOn(Object.getPrototypeOf(tmdb.movies), "details").mockResolvedValue(TmdbMockPayloads.movieDetails)
    vi.spyOn(Object.getPrototypeOf(tmdb.tvShows), "details").mockResolvedValue(TmdbMockPayloads.seriesDetails)

    await Promise.all([
        user.agent.get(`/v1/media/movies?id=${TmdbMockPayloads.movieDetails.id}`),
        user.agent.get(`/v1/media/series?id=${TmdbMockPayloads.seriesDetails.id}`)
    ])
    
    await Promise.all([
        friend.agent.post(`/v1/watchlist/series`).send({
            id: TmdbMockPayloads.seriesDetails.id,
            hasWatched: false,
            rating: "10"
        }),
        otherUser.agent.post(`/v1/watchlist/series`).send({
            id: TmdbMockPayloads.seriesDetails.id,
            hasWatched: false,
            rating: "1"
        }),
    ])

    await Promise.all([
        friend.agent.post(`/v1/reviews`).send({
            movieId: null,
            seriesId: TmdbMockPayloads.seriesDetails.id,
            content: "nice",
            rating: "10",
            isPublic: false
        }),
        otherUser.agent.post(`/v1/reviews`).send({
            movieId: null,
            seriesId: TmdbMockPayloads.seriesDetails.id,
            content: "not ur friend",
            rating: "1",
            isPublic: false
        }),
    ])
    
    await friend.agent.post(`/v1/connections/${user.details.id}`)
    await user.agent.put(`/v1/connections/${friend.details.id}`)
})

afterAll(async () => {
    await prisma.user.deleteMany()
})

beforeEach(async () => {
    
})


describe("reviews", () => {
    test.todo("get review where isPublic = true or connection = true", async () => {
        // const reviewRes = await user.agent.get("/v1/reviews")
    })

    test.todo("get comments where isPublic = true or connection = true")
})

describe("watchlist")