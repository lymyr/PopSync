import { afterAll, beforeAll, expect, test } from "vitest"
import { testUserGen, type TestUser } from "../../utils/userGeneration.ts"
import { prisma } from "../../../lib/prisma.ts"
import { type Movie, type Review, type Series } from "../../../../generated/prisma/client.ts"
import type { JsonValue } from "../../../../generated/prisma/internal/prismaNamespace.ts"

let users: TestUser[]
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
    for (let i = 0; i < 20; i++) {
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
    const [movies, series] = await Promise.all([
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
    movies.forEach((movie) => {
        users.forEach((user, uI) => {
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
    series.forEach((series) => {
        users.forEach((user, uI) => {
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


    const reviewTasks: 
        Pick<Review, 
            "authorId" | 
            "content" |
            "isPublic" |
            "rating" |
            "seriesId" |
            "movieId" |
            "dateAdded" |
            "dateUpdated"
        >[] 
    = []
    movies.forEach((movie, mI) => {
        users.forEach((user, uI) => {
            reviewTasks.push({
                rating: uI % 11,
                authorId: user.details.id,
                content: `reviewing ${movie.title} from ${user.details.username}`,
                isPublic: uI == 3 && mI == 0 ? true : false,
                movieId: movie.id,
                seriesId: null,
                dateAdded: mI % 10 == 0 ? new Date(2000, 6, 7) : new Date(1967, 6, 7),
                dateUpdated: mI % 10 == 0 ? new Date(2000, 6, 7) : new Date(1967, 6, 7)
            })
        })
    })
    series.forEach((siri, sI) => {
        users.forEach((user, uI) => {
            reviewTasks.push({
                rating: uI % 11,
                authorId: user.details.id,
                content: `reviewing ${siri.name} from ${user.details.username}`,
                isPublic: uI == 3 && sI == 0 ? true : false,
                movieId: null,
                seriesId: siri.id,
                dateAdded: sI % 10 == 0 ? new Date(2000, 6, 7) : new Date(1967, 6, 7),
                dateUpdated: sI % 10 == 0 ? new Date(2000, 6, 7) : new Date(1967, 6, 7)
            })
        })
    })
    await prisma.review.createManyAndReturn({
        data: reviewTasks
    })
})

afterAll(async () => {
    await prisma.user.deleteMany()
    await Promise.all([
        prisma.series.deleteMany(),
        prisma.movie.deleteMany()
    ])
})


test("retrieves paginated reviews from public or from connections", async () => {
    const res = await users[0]?.agent.get("/v1/reviews")

    const search = new URLSearchParams([["lastReviewId", res?.body.data[res?.body.data.length - 1].id]])
    const paginatedRes = await users[0]?.agent.get(`/v1/reviews?${search.toString()}`)
    
    paginatedRes?.body.data.forEach((review: any) => {
        expect(res?.body.data).toEqual(expect.not.arrayContaining([review]))
    })

    // oxlint-disable-next-line no-unsafe-optional-chaining
    const reviews = [...res?.body.data, ...paginatedRes?.body.data]
    reviews.forEach(r => {
        expect(r.author.id).not.toBe(users[2]?.details.id)
        if (r.author.id == users[3]?.details.id) 
            expect(r.isPublic).toBe(true)
    })
})