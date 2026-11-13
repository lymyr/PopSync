import { afterAll, beforeAll, describe, expect, test } from "vitest"
import { testUserGen, type TestUser } from "../../utils/userGeneration.ts"
import { prisma } from "../../../lib/prisma.ts"
import type { Movie, Series } from "../../../../generated/prisma/client.ts"
import type { JsonValue } from "../../../../generated/prisma/internal/prismaNamespace.ts"

let users: TestUser[]
let series: Series[]
let movies: Movie[]

beforeAll(async () => {
    users = await testUserGen(4)

    interface cSeries extends Omit<Series, "voteAverage"> {
        seasons: NonNullable<JsonValue>
        voteAverage: number
    }

    interface cMovie extends Omit<Movie, "voteAverage"> {
        voteAverage: number
    }

    const seriesArr: cSeries[] = []
    const moviesArr: cMovie[] = []
    for (let i = 0; i < 25; i++) {
        seriesArr.push({
            id: i,
            name: `series ${i}`,
            originalName: `series ${i} original`,
            overview: `series ${i} overview`,
            posterPath: "",
            backdropPath: "",
            firstAirDate: "",
            voteAverage: 5.67,
            status: "",
            seasons: ""
        })

        moviesArr.push({
            id: i,
            title: `movie ${i}`,
            originalTitle: `movie ${i} original`,
            overview: `movie ${i} overview`,
            posterPath: "",
            backdropPath: "",
            releaseDate: "",
            voteAverage: 6.7,
            runtime: 0
        })
    }

    [movies, series] = await Promise.all([
        prisma.movie.createManyAndReturn({data: moviesArr}),
        prisma.series.createManyAndReturn({data: seriesArr})
    ])

    const currentUserId = users[0]?.details.id as number
    const friendId = users[1]?.details.id as number
    const pendingId = users[2]?.details.id as number

    interface watchlist {
        userId: number;
        hasWatched: boolean;
        rating: number;
    }

    interface wlMovie extends watchlist { movieId: number; }
    const watchlistMovieTasks: wlMovie[] = []
    movies.forEach((movie, mI) => {
        users.forEach((user, uI) => {
            // 2nd user, first 3 movies are not in their watchlist
            if (!(uI == 1 && mI < 3))
                watchlistMovieTasks.push({
                    userId: user.details.id,
                    movieId: movie.id,
                    hasWatched: false,
                    rating: uI+1,
                })
        })
    })
    interface wlSeries extends watchlist { seriesId: number }
    const watchlistSeriesTask: wlSeries[] = []
    series.forEach((series, sI) => {
        users.forEach((user, uI) => {
            if (!(uI == 1 && sI < 3))
                watchlistSeriesTask.push({
                    userId: user.details.id,
                    seriesId: series.id,
                    hasWatched: false,
                    rating: uI+1,
                })
        })
    })

    await Promise.all([
        prisma.connection.createMany({ data: [
            {
                senderId: currentUserId,
                receiverId: friendId,
                status: "accepted"
            },
            {
                senderId: currentUserId,
                receiverId: pendingId,
                status: "pending"
            },
        ]}),

        prisma.watchListMovie.createMany({ data: watchlistMovieTasks }),
        prisma.watchListSeries.createMany({ data: watchlistSeriesTask }),
    ])
})

afterAll(async () => {
    await prisma.user.deleteMany()
    await Promise.all([
        prisma.movie.deleteMany(),
        prisma.series.deleteMany()
    ])
})



test("compare watchlist", async () => {
    const res = await users[0]?.agent.get(`/v1/users/${users[1]?.details.id}/watchlist`)
    expect(res?.body.data.movies[0].users).toEqual(expect.any(Array))
    expect(res?.body.data.series[0].users).toEqual(expect.any(Array))
    expect(res?.body.data.movies[0].users).toHaveLength(2)
    expect(res?.body.data.series[0].users).toHaveLength(2)

    const movies = res?.body.data.movies
    const series = res?.body.data.series
    const searchParam = new URLSearchParams([
        ["lastMovieId", movies[movies.length-1].id],
        ["lastSeriesId", series[series.length-1].id]
    ])

    const paginatedRes = await users[0]?.agent.get(`/v1/users/${users[1]?.details.id}/watchlist?${searchParam.toString()}`)
    paginatedRes?.body.data.movies.forEach((movie: any) => {
        expect(movies).toEqual(expect.not.arrayContaining([movie]))
    })
    paginatedRes?.body.data.series.forEach((paginatedSeries: any) => {
        expect(series).toEqual(expect.not.arrayContaining([paginatedSeries]))
    })
})

describe("unauthorized", () => {
    test("watchlist retrieval with no connection", async () => {
        const res = await users[0]?.agent.get(`/v1/users/${users[3]?.details.id}/watchlist`)
        expect(res?.status).toBe(401)
    })

    test("retrieves watchlist with pending connection", async () => {
        const res = await users[0]?.agent.get(`/v1/users/${users[2]?.details.id}/watchlist`)
        expect(res?.status).toBe(401)
    })
})

test("search by title", async () => {
    const search = new URLSearchParams([["search", "seRIEs 20 original"]])
    const resSeries = await users[0]?.agent.get(`/v1/users/${users[1]?.details.id}/watchlist?${search.toString()}`)

    expect(resSeries?.body.data.series).toHaveLength(1)
    expect(resSeries?.body.data.movies).toHaveLength(0)
    expect(resSeries?.body.data.series[0].name).toBe("series 20")

    search.set("search", "MoVie 20")

    const resMovie = await users[0]?.agent.get(`/v1/users/${users[1]?.details.id}/watchlist?${search.toString()}`)
    expect(resMovie?.body.data.series).toHaveLength(0)
    expect(resMovie?.body.data.movies).toHaveLength(1)
    expect(resMovie?.body.data.movies[0].title).toBe("movie 20")
})

// future implementation just to avoid some scope creep
test.todo("sorted by a particular user's rating")
test.todo("filter by a particular user's hasWatched")
