import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { testUserGen, type TestUser } from "../../utils/userGeneration.ts";
import type { Movie, Series, WatchGroup } from "../../../../generated/prisma/client.ts";
import type { JsonValue } from "../../../../generated/prisma/internal/prismaNamespace.ts";
import { prisma } from "../../../lib/prisma.ts";
import TmdbMockPayloads from "../../mocks/TmdbMockPayloads.ts";
import tmdb from "../../../lib/tmdb.ts";

let users: TestUser[]
let series: Series[]
let movies: Movie[]

beforeAll(async () => {
    users = await testUserGen(7)

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
        if (i == TmdbMockPayloads.movieDetails.id || i == TmdbMockPayloads.seriesDetails.id)
            throw new Error("please change tmdb mock details id")
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
            // BOOKMARK CHECKS
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
            // 2nd user, first 3 series are not in their watchlist
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

describe("watchgroup creation", () => {
    afterEach(async () => {
        await prisma.watchGroupUser.deleteMany()
        await prisma.watchGroup.deleteMany()
    })

    test("creates watchgroup with name and initial members", async () => {
        const res = await users[0]?.agent.post("/v1/watchgroups")
            .send({
                members: users.filter(u => u.details.id != users[0]?.details.id).map((u, i) => {
                    return {
                        userId: u.details.id,
                        isAdmin: i == 1 ? true : false
                    }
                }),
                name: "wg"
            })
        expect(res?.status).toBe(201)
        expect(res?.body.data.name).toBe("wg")
        expect(res?.body.data.fallbackName).toBe("")

        const [creator, members] = await Promise.all([
            prisma.watchGroupUser.findUnique({
                where: {
                    watchGroupId_userId: {
                        watchGroupId: res?.body.data.id,
                        userId: users[0]?.details.id as number
                    }
                }
            }),
            prisma.watchGroupUser.findMany({ where: {userId: {not: users[0]?.details.id as number}}})
        ])
        expect(creator).not.toBeNull()
        expect([users[0]?.details.id, ...members.map(m => m.userId)]).toEqual(expect.arrayContaining(users.map(u => u.details.id)))
        members.forEach(m => {
            expect(m.isAdmin).toBe(m.userId == users[2]?.details.id ? true : false)
        })
    })

    test("creates watchgroup with name but without initial members", async () => {
        const res = await users[0]?.agent.post("/v1/watchgroups")
            .send({
                members: [],
                name: "wg"
            })
        expect(res?.status).toBe(201)
        expect(res?.body.data.fallbackName).toBe("")
        const members = await prisma.watchGroupUser.findMany()
        expect(members.length).toBe(1)
        expect(members[0]?.userId).toBe(users[0]?.details.id)
    })

    describe("no initial name", () => {
        test("equal to 5 members", async () => {
            if (users.length < 5) 
                throw new Error("test users must be at least 5")
            
            const res = await users[0]?.agent.post("/v1/watchgroups")
                .send({
                    members: users.filter(u => u.details.id != users[0]?.details.id).map(u => {
                        return {
                            userId: u.details.id,
                            isAdmin: false
                        }
                    }).slice(0, 4),
                    name: ""
                })
            expect(res?.status).toBe(201)
            expect(res?.body.data.name).toBe("")
            const lastWordArr: Array<string> = res?.body.data.fallbackName.split(", ").at(-1).split("")
            const lastThreeChars = lastWordArr.slice(lastWordArr.length-3).join("")
            expect(lastThreeChars).not.toBe("...")
        })

        test("less than 5 members", async () => {
            const res = await users[0]?.agent.post("/v1/watchgroups")
                .send({
                    members: users.filter(u => u.details.id != users[0]?.details.id).map(u => {
                        return {
                            userId: u.details.id,
                            isAdmin: false
                        }
                    }).slice(0, 3),
                    name: ""
                })
            expect(res?.status).toBe(201)
            expect(res?.body.data.name).toBe("")
            const lastWordArr: Array<string> = res?.body.data.fallbackName.split(", ").at(-1).split("")
            const lastThreeChars = lastWordArr.slice(lastWordArr.length-3).join("")
            expect(lastThreeChars).not.toBe("...")
        })

        test("more than 5 members", async () => {
            if (users.length <= 5) 
                throw new Error("test users must be more than 5")
            
            const res = await users[0]?.agent.post("/v1/watchgroups")
                .send({
                    members: users.filter(u => u.details.id != users[0]?.details.id).map(u => {
                        return {
                            userId: u.details.id,
                            isAdmin: false
                        }
                    }),
                    name: ""
                })
            expect(res?.status).toBe(201)
            expect(res?.body.data.name).toBe("")
            const lastWordArr: Array<string> = res?.body.data.fallbackName.split(", ").at(-1).split("")
            const lastThreeChars = lastWordArr.slice(lastWordArr.length-3).join("")
            expect(lastThreeChars).toBe("...")
        })
    })
    

    test("create watch group without name and initial members", async () => {
        const res = await users[0]?.agent.post("/v1/watchgroups")
            .send({
                members: [],
                name: ""
            })
        expect(res?.status).toBe(201)
        expect(res?.body.data.name).toBe("")
        expect(res?.body.data.fallbackName).toBe(users[0]?.details.username)
    })
})

describe("watchgroup read and updates", () => {
    let watchgroup: WatchGroup
    beforeAll(async () => {
        const res = await users[0]?.agent.post("/v1/watchgroups")
            .send({
                members: [],
                name: "precreated wg"
            })
        watchgroup = res?.body.data
    })

    afterAll(async () => {
        await prisma.watchGroupUser.deleteMany()
        await prisma.watchGroup.deleteMany()
    })

    describe("non authorized", () => {
        test.todo("non member reads watchlist")
    })

    /* 
        note: fallback name is not tested here =~= 
        it should be fine tho since the parameters are similar in FallbackName.getNewFallbackName
    */
    describe("leaving watchgroup", () => {
        afterEach(async () => {
            await Promise.all([
                prisma.watchGroupUser.deleteMany({
                    where: {userId: {
                        not: users[0]?.details.id as number
                    }}
                }),
                prisma.watchGroupUser.create({data: {
                    userId: users[0]?.details.id as number,
                    watchGroupId: watchgroup.id,
                    isAdmin: true
                }})
            ])
        })

        test("if no admin, promotes another member to admin", async () => {
            await prisma.watchGroupUser.create({
                data: {
                    watchGroupId: watchgroup.id,
                    userId: users[1]?.details.id as number,
                    isAdmin: false
                }
            })
            const res = await users[0]?.agent.delete(`/v1/watchgroups/${watchgroup.id}/users`)
            expect(res?.status).toBe(200)
            const members = await prisma.watchGroupUser.findMany()
            expect(members.length).toBe(1)
            expect(members[0]?.isAdmin).toBe(true)
        })

        test("no promotion if there is a present admin", async () => {
            await prisma.watchGroupUser.createMany({
                data: [
                    {
                        watchGroupId: watchgroup.id,
                        userId: users[1]?.details.id as number,
                        isAdmin: false
                    },
                    {
                        watchGroupId: watchgroup.id,
                        userId: users[2]?.details.id as number,
                        isAdmin: true
                    }
                ]
            })
            const res = await users[0]?.agent.delete(`/v1/watchgroups/${watchgroup.id}/users`)
            expect(res?.status).toBe(200)
            const members = await prisma.watchGroupUser.findMany({
                where: {watchGroupId: watchgroup.id}, 
                orderBy: {isAdmin: "desc"}
            })
            expect(members.length).toBe(2)
            expect(members[0]?.isAdmin).toBe(true)
            expect(members[0]?.userId).toBe(users[2]?.details.id)
            expect(members[1]?.isAdmin).toBe(false)
            expect(members[1]?.userId).toBe(users[1]?.details.id)
        })

        test("delete watchgroup if no member left", async () => {
            const res = await users[0]?.agent.delete(`/v1/watchgroups/${watchgroup.id}/users`)
            expect(res?.status).toBe(200)
            const wg = await prisma.watchGroup.findUnique({where: {id: watchgroup.id}})
            expect(wg).toBeFalsy()
            await prisma.watchGroup.create({ data: watchgroup })
        })
    })

    describe("adding users", () => {
        afterEach(async () => {
            await prisma.watchGroupUser.deleteMany({ where: { userId: {not: users[0]?.details.id as number}}})
        })

        describe("no initial watchgroup name", () => {
            beforeAll(async () => {
                await prisma.watchGroup.update({
                    where: {id: watchgroup.id},
                    data: {
                        name: "",
                        fallbackName: `${users[0]?.details.username}`
                    }
                })
            })

            afterAll(async () => {
                await prisma.watchGroup.update({
                    where: {id: watchgroup.id},
                    data: {name: "precreated wg"}
                })
            })

            afterEach(async () => {
                await prisma.watchGroup.update({
                    where: {id: watchgroup.id},
                    data: { fallbackName: `${users[0]?.details.username}` }
                })
            })

            test("member count = 5", async () => {
                const res = await users[0]?.agent.post(`/v1/watchgroups/${watchgroup.id}/users`)
                    .send({
                        members: users.filter(u => u.details.id != users[0]?.details.id).map(u => {
                            return {
                                userId: u.details.id,
                                isAdmin: false
                            }
                        }).slice(0, 4)
                    })
                expect(res?.status).toBe(201)
                expect(res?.body.data.watchgroup.name).toBe("")
                const lastWordArr: Array<string> = res?.body.data.watchgroup.fallbackName.split(", ").at(-1).split("")
                const lastThreeChars = lastWordArr.slice(lastWordArr.length-3).join("")
                expect(lastThreeChars).not.toBe("...")
            })

            test("member count = 6 ", async () => {
                if (users.length <= 5)
                    throw new Error("there must be at least 6 test users")
                const res = await users[0]?.agent.post(`/v1/watchgroups/${watchgroup.id}/users`)
                    .send({
                        members: users.filter(u => u.details.id != users[0]?.details.id).map(u => {
                            return {
                                userId: u.details.id,
                                isAdmin: false
                            }
                        }).splice(0, 5)
                    })
                expect(res?.status).toBe(201)
                expect(res?.body.data.watchgroup.name).toBe("")
                expect(res?.body.data.users).toHaveLength(5)
                const lastWordArr: Array<string> = res?.body.data.watchgroup.fallbackName.split(", ").at(-1).split("")
                const lastThreeChars = lastWordArr.slice(lastWordArr.length-3).join("")
                expect(lastThreeChars).toBe("...")
            })
        })

        test("admin adds other users", async () => {
            const res = await users[0]?.agent.post(`/v1/watchgroups/${watchgroup.id}/users`)
                .send({
                    members: users.filter(u => u.details.id != users[0]?.details.id).map(u => {
                        return {
                            userId: u.details.id,
                            isAdmin: false
                        }
                    })
                })
            expect(res?.status).toBe(201)
            const members = await prisma.watchGroupUser.findMany()
            expect(members.length).toBe(users.length)
        })
    })

    describe("removing users", () => {
        afterEach(async () => {
            await prisma.watchGroupUser.deleteMany({where: {userId: {not: users[0]?.details.id as number}}})
        })

        describe("with initial group name", () => {
            beforeEach(async () => {
                await prisma.watchGroupUser.createMany({
                    data: users.filter(u => u.details.id != users[0]?.details.id).map((u, i) => {
                        return {
                            userId: u.details.id,
                            isAdmin: i == 0 ? true : false,
                            watchGroupId: watchgroup.id
                        }
                    })
                })
            })

            test("admin removes a member", async () => {
                const res = await users[0]?.agent.delete(`/v1/watchgroups/${watchgroup.id}/users/${users[2]?.details.id}`)
                expect(res?.status).toBe(200)
                const user = await prisma.watchGroupUser.findUnique({
                    where: {watchGroupId_userId: {
                        userId: users[2]?.details.id as number,
                        watchGroupId: watchgroup.id
                    }}
                })
                expect(user).toBeNull()
            })

            test("admin removes another admin", async () => {
                const res = await users[0]?.agent.delete(`/v1/watchgroups/${watchgroup.id}/users/${users[1]?.details.id}`)
                expect(res?.status).toBe(403)
                const user = await prisma.watchGroupUser.findUnique({
                    where: {watchGroupId_userId: {
                        userId: users[1]?.details.id as number,
                        watchGroupId: watchgroup.id
                    }}
                })
                expect(user).not.toBeNull()
            })
            
            test("member removes a member", async () => {
                const res = await users[2]?.agent.delete(`/v1/watchgroups/${watchgroup.id}/users/${users[3]?.details.id}`)
                expect(res?.status).toBe(403)
                const user = await prisma.watchGroupUser.findUnique({
                    where: {watchGroupId_userId: {
                        userId: users[3]?.details.id as number,
                        watchGroupId: watchgroup.id
                    }}
                })
                expect(user).not.toBeNull()
            })

            test("member leaves the group", async () => {
                const res = await users[2]?.agent.delete(`/v1/watchgroups/${watchgroup.id}/users`)
                expect(res?.status).toBe(200)
                const user = await prisma.watchGroupUser.findUnique({
                    where: {watchGroupId_userId: {
                        userId: users[2]?.details.id as number,
                        watchGroupId: watchgroup.id
                    }}
                })
                expect(user).toBeNull()
            })
        })


        describe("no initial group name", () => {
            afterAll(async () => {
                await prisma.watchGroup.update({
                    where: {id: watchgroup.id},
                    data: {name: "precreated wg", fallbackName: ""}
                })
            })
            describe("more than 5 members", () => {
                test("5 members after deletion", async () => {
                    if (users.length <= 5)
                        throw new Error("must have at least 6 total test users")
                    await Promise.all([
                        prisma.watchGroupUser.createMany({
                            data: users.filter(u => u.details.id != users[0]?.details.id).map((u, i) => {
                                return {
                                    userId: u.details.id,
                                    isAdmin: i == 0 ? true : false,
                                    watchGroupId: watchgroup.id
                                }
                            }).slice(0, 5)
                        }),
                        prisma.watchGroup.update({
                            where: {id: watchgroup.id},
                            data: {name: "", fallbackName: `${users.slice(0, 5).map(u => u.details.username).join(", ")}...`}
                        })
                    ])
                    const res = await users[0]?.agent.delete(`/v1/watchgroups/${watchgroup.id}/users/${users[2]?.details.id}`)
                    expect(res?.status).toBe(200)
                    const fbNameResArr = res?.body.data.watchgroup.fallbackName.split(", ")
                    expect(fbNameResArr).toHaveLength(5)
                    expect(fbNameResArr).toEqual(expect.not.arrayContaining([users[2]?.details.username]))
                    const lastWordArr = fbNameResArr.at(-1).split("")
                    expect(lastWordArr.slice(lastWordArr.length-3, lastWordArr.length).join("")).not.toBe("...")

                    const user = await prisma.watchGroupUser.findUnique({
                        where: {watchGroupId_userId: {
                            userId: users[2]?.details.id as number,
                            watchGroupId: watchgroup.id
                        }}
                    })
                    expect(user).toBeNull()
                })
                
                test("more than 5 members after deletion", async () => {
                    if (users.length <= 6)
                        throw new Error("must have at least 6 total test users")
                    await Promise.all([
                        prisma.watchGroupUser.createMany({
                            data: users.filter(u => u.details.id != users[0]?.details.id).map((u, i) => {
                                return {
                                    userId: u.details.id,
                                    isAdmin: i == 0 ? true : false,
                                    watchGroupId: watchgroup.id
                                }
                            }).slice(0, 6)
                        }),
                        prisma.watchGroup.update({
                            where: {id: watchgroup.id},
                            data: {name: "", fallbackName: `${users.slice(1, 6).map(u => u.details.username).join(", ")}...`}
                        })
                    ])
                    const res = await users[0]?.agent.delete(`/v1/watchgroups/${watchgroup.id}/users/${users[2]?.details.id}`)
                    expect(res?.status).toBe(200)
                    const fbNameResArr = res?.body.data.watchgroup.fallbackName.split(", ")
                    expect(fbNameResArr).toHaveLength(5)
                    expect(fbNameResArr).toEqual(expect.not.arrayContaining([users[2]?.details.username]))
                    const lastWordArr = fbNameResArr.at(-1).split("")
                    expect(lastWordArr.slice(lastWordArr.length-3, lastWordArr.length).join("")).toBe("...")

                    const user = await prisma.watchGroupUser.findUnique({
                        where: {watchGroupId_userId: {
                            userId: users[2]?.details.id as number,
                            watchGroupId: watchgroup.id
                        }}
                    })
                    expect(user).toBeNull()
                })
            })
            describe("5 members", () => {
                beforeEach(async () => {
                    await Promise.all([
                        prisma.watchGroupUser.createMany({
                            data: users.filter(u => u.details.id != users[0]?.details.id).map((u, i) => {
                                return {
                                    userId: u.details.id,
                                    isAdmin: i == 0 ? true : false,
                                    watchGroupId: watchgroup.id
                                }
                            }).slice(0, 4)
                        }),
                        prisma.watchGroup.update({
                            where: {id: watchgroup.id},
                            data: {name: "", fallbackName: `${users.slice(0, 5).map(u => u.details.username).join(", ")}`}
                        })
                    ])
                })

                test("admin removes a member", async () => {
                    const res = await users[0]?.agent.delete(`/v1/watchgroups/${watchgroup.id}/users/${users[2]?.details.id}`)
                    expect(res?.status).toBe(200)
                    
                    const user = await prisma.watchGroupUser.findUnique({
                        where: {watchGroupId_userId: {
                            userId: users[2]?.details.id as number,
                            watchGroupId: watchgroup.id
                        }}
                    })
                    
                    expect(user).toBeNull()
                    expect(res?.body.data.watchgroup.fallbackName.split(", ")).toEqual(expect.not.arrayContaining([users[2]?.details.username]))
                })
            })
        })
    })

    describe("adding media", () => {
        const tmdbMovieDetailsMock = vi.spyOn(Object.getPrototypeOf(tmdb.movies), "details").mockResolvedValue(TmdbMockPayloads.movieDetails)
        const tmdbSeriesDetailsMock = vi.spyOn(Object.getPrototypeOf(tmdb.tvShows), "details").mockResolvedValue(TmdbMockPayloads.seriesDetails)

        afterAll(async () => {
            await prisma.watchGroup.update({
                where: {id: watchgroup.id},
                data: {
                    series: { deleteMany: { id: TmdbMockPayloads.seriesDetails.id } },
                    movies: { deleteMany: { id: TmdbMockPayloads.movieDetails.id } }
                }
            })
        })

        afterEach(() => {
            tmdbMovieDetailsMock.mockClear()
            tmdbSeriesDetailsMock.mockClear()
        })

        describe("forbidden/unauth tests", () => {
            beforeAll(async () => {
                if (users.length < 3)
                    throw new Error("these tests require at least 3 users")
                await prisma.watchGroupUser.create({
                    data: { 
                        watchGroupId: watchgroup.id, 
                        userId: users[1]?.details.id as number 
                    }
                })
            })
            afterAll(async () => {
                await prisma.watchGroupUser.delete({
                    where: { watchGroupId_userId: {
                        watchGroupId: watchgroup.id, 
                        userId: users[1]?.details.id as number 
                    }}
                })
            })

            test("non-admin", async () => {
                const res = await users[1]?.agent.post(`/v1/watchgroups/${watchgroup.id}/movies`)
                    .send({id: TmdbMockPayloads.movieDetails.id})
                expect(res?.status).toBe(403)
            })

            test("non-member", async () => {
                const res = await users[2]?.agent.post(`/v1/watchgroups/${watchgroup.id}/movies`)
                    .send({id: TmdbMockPayloads.movieDetails.id})
                expect(res?.status).toBe(404)
            })
        })

        describe("media already in database", () => {
            beforeAll(async () => {
                await Promise.all([
                    prisma.movie.create({
                        data: { 
                            id: TmdbMockPayloads.movieDetails.id,
                            title: TmdbMockPayloads.movieDetails.title, 
                            originalTitle: TmdbMockPayloads.movieDetails.original_title, 
                            overview: TmdbMockPayloads.movieDetails.overview, 
                            posterPath: TmdbMockPayloads.movieDetails.poster_path,
                            backdropPath: TmdbMockPayloads.movieDetails.backdrop_path, 
                            releaseDate: TmdbMockPayloads.movieDetails.release_date, 
                            voteAverage: TmdbMockPayloads.movieDetails.vote_average, 
                            runtime: TmdbMockPayloads.movieDetails.runtime 
                        } 
                    }),
                    prisma.series.create({
                        data: { 
                            id: TmdbMockPayloads.seriesDetails.id,
                            name: TmdbMockPayloads.seriesDetails.name, 
                            originalName: TmdbMockPayloads.seriesDetails.original_name,
                            overview: TmdbMockPayloads.seriesDetails.overview, 
                            posterPath: TmdbMockPayloads.seriesDetails.poster_path,
                            backdropPath: TmdbMockPayloads.seriesDetails.backdrop_path, 
                            firstAirDate: TmdbMockPayloads.seriesDetails.first_air_date, 
                            voteAverage: TmdbMockPayloads.seriesDetails.vote_average, 
                            status: TmdbMockPayloads.seriesDetails.status, 
                            seasons: TmdbMockPayloads.seriesDetails.seasons
                        } 
                    })
                ])
            })
            afterAll(async () => {
                await prisma.watchGroup.update({
                    where: {id: watchgroup.id},
                    data: {
                        series: { deleteMany: { id: TmdbMockPayloads.seriesDetails.id } },
                        movies: { deleteMany: { id: TmdbMockPayloads.movieDetails.id } }
                    }
                })
            })

            test("movie", async () => {
                const res = await users[0]?.agent.post(`/v1/watchgroups/${watchgroup.id}/movies`)
                    .send({id: TmdbMockPayloads.movieDetails.id})
                expect(res?.status).toBe(201)
                expect(tmdbMovieDetailsMock).not.toHaveBeenCalled()
                const updatedWg = await prisma.watchGroup.findFirst({ where: {id: watchgroup.id }, include: {movies: true}})
                expect(updatedWg?.movies).toHaveLength(1)
                expect(updatedWg?.movies[0]?.id).toBe(TmdbMockPayloads.movieDetails.id)
            })

            test("series", async () => {
                const res = await users[0]?.agent.post(`/v1/watchgroups/${watchgroup.id}/series`)
                    .send({id: TmdbMockPayloads.seriesDetails.id})
                expect(res?.status).toBe(201)
                expect(tmdbMovieDetailsMock).not.toHaveBeenCalled()
                const updatedWg = await prisma.watchGroup.findFirst({ where: {id: watchgroup.id }, include: {series: true}})
                expect(updatedWg?.series).toHaveLength(1)
                expect(updatedWg?.series[0]?.id).toBe(TmdbMockPayloads.seriesDetails.id)
            })
        })
        describe("media is not present in the database", () => {
            test("movie", async () => {
                const res = await users[0]?.agent.post(`/v1/watchgroups/${watchgroup.id}/movies`)
                    .send({id: TmdbMockPayloads.movieDetails.id})
                expect(res?.status).toBe(201)
                expect(tmdbMovieDetailsMock).toHaveBeenCalled()
                const updatedWg = await prisma.watchGroup.findFirst({ where: {id: watchgroup.id }, include: {movies: true}})
                expect(updatedWg?.movies).toHaveLength(1)
                expect(updatedWg?.movies[0]?.id).toBe(TmdbMockPayloads.movieDetails.id)
            })
            test("series", async () => {
                const res = await users[0]?.agent.post(`/v1/watchgroups/${watchgroup.id}/series`)
                    .send({id: TmdbMockPayloads.seriesDetails.id})
                expect(res?.status).toBe(201)
                expect(tmdbSeriesDetailsMock).toHaveBeenCalled()
                const updatedWg = await prisma.watchGroup.findFirst({ where: {id: watchgroup.id }, include: {series: true}})
                expect(updatedWg?.series).toHaveLength(1)
                expect(updatedWg?.series[0]?.id).toBe(TmdbMockPayloads.seriesDetails.id)
            })
        })
    })

    describe("removing media", () => {
        beforeAll(async () => {
            await prisma.watchGroup.update({where: {id: watchgroup.id},
                data: {
                    movies: { connect: {id: movies[0]?.id as number} },
                    series: { connect: {id: series[0]?.id as number} }
                }
            })
        })

        afterAll(async () => {
            await prisma.watchGroup.update({where: {id: watchgroup.id},
                data: {
                    movies: { disconnect: {id: movies[0]?.id as number} },
                    series: { disconnect: {id: series[0]?.id as number} }
                }
            })
        })

        test("movie" , async () => {
            const res = await users[0]?.agent.delete(`/v1/watchgroups/${watchgroup.id}/movies/${movies[0]?.id}`)
            expect(res?.status).toBe(200)
            const wg = await prisma.watchGroup.findFirst({where: {id: watchgroup.id},
                select: {
                    movies: { where: {id: movies[0]?.id as number} }
                }
            })
            expect(wg?.movies[0]).toBeFalsy()
        })

        test("series", async () => {
            const res = await users[0]?.agent.delete(`/v1/watchgroups/${watchgroup.id}/series/${series[0]?.id}`)
            expect(res?.status).toBe(200)
            const wg = await prisma.watchGroup.findFirst({where: {id: watchgroup.id},
                select: {
                    series: { where: {id: series[0]?.id as number} }
                }
            })
            expect(wg?.series[0]).toBeFalsy()
        })
    })

    /* 
        note: there is a loophole where user A with no connection to a user B can 
        view a user B's watchlist by adding user B to a watchgroup.
        
        todo: add watchgroup requests. put off for now since this proj taking too long =~=
    */
    describe("compare movie/series ratings", () => {
        beforeAll(async () => {
            await prisma.watchGroup.update({where: {id: watchgroup.id},
                data: {
                    movies: { connect: movies.map(m => {return {id: m.id}}) },
                    series: { connect: series.map(s => {return {id: s.id}}) },
                    users: { createMany: { data: 
                        users.filter((_u, i) => i != 0 && i != users.length - 1).map(u => {return {userId: u.details.id}})
                    }}
                }
            })
        })

        afterAll(async () => {
            await Promise.all([
                prisma.watchGroup.update({where: {id: watchgroup.id},
                    data: {
                        movies: { disconnect: movies.map(m => {return {id: m.id}}) },
                        series: { disconnect: series.map(s => {return {id: s.id}}) }
                    }
                }),
                prisma.watchGroupUser.deleteMany({ where: {userId: {not: users[0]?.details.id as number}}})
            ])
        })

        test("pagination", async () => {
            const res = await users[0]?.agent.get(`/v1/watchgroups/${watchgroup.id}`)
            expect(res?.status).toBe(200)
            expect(res?.body.data.movies).toEqual(expect.any(Array))
            expect(res?.body.data.series).toEqual(expect.any(Array))

            // search BOOKMARK CHECKS in this file for more info
            res?.body.data.movies.forEach((m: any) => {
                if (movies.slice(0, 3).map(mElem => mElem.title).includes(m.title)) {
                    m.users.forEach((u: any) => {
                        if (u.username == "user1") 
                            expect(u.rating).toBeNull()
                        else 
                            expect(u.rating).toEqual(Number(u.username.at(-1)) + 1) 
                    })
                }
                else
                    m.users.forEach((u: any) => { expect(u.rating).toEqual(Number(u.username.at(-1)) + 1) })
            })
            res?.body.data.series.forEach((s: any) => {
                if (series.slice(0, 3).map(sElem => sElem.name).includes(s.name)) {
                    s.users.forEach((u: any) => {
                        if (u.username == "user1") 
                            expect(u.rating).toBeNull()
                        else 
                            expect(u.rating).toEqual(Number(u.username.at(-1)) + 1) 
                    })
                }
                else
                    s.users.forEach((u: any) => { expect(u.rating).toEqual(Number(u.username.at(-1)) + 1) })
            })

            const searchParam = new URLSearchParams([
                ["lastMovieId", res?.body.data.movies[res?.body.data.movies.length-1].id],
                ["lastSeriesId", res?.body.data.series[res?.body.data.series.length-1].id]
            ])

            const paginatedRes = await users[0]?.agent.get(`/v1/watchgroups/${watchgroup.id}?${searchParam.toString()}`)
            expect(paginatedRes?.body.data.movies).toHaveLength(movies.length-20)
            expect(paginatedRes?.body.data.series).toHaveLength(series.length-20)
            paginatedRes?.body.data.movies.forEach((movie: any) => {
                expect(res?.body.data.movies).toEqual(expect.not.arrayContaining([movie]))
            })
            paginatedRes?.body.data.series.forEach((paginatedSeries: any) => {
                expect(res?.body.data.series).toEqual(expect.not.arrayContaining([paginatedSeries]))
            })
        })

        test("search", async () => {
            const searchParam = new URLSearchParams([
                ["search", movies[21]?.originalTitle as string]
            ])
            const res = await users[0]?.agent.get(`/v1/watchgroups/${watchgroup.id}?${searchParam.toString()}`)
            expect(res?.status).toBe(200)
            expect(res?.body.data.movies).toHaveLength(1)
            expect(res?.body.data.movies[0].title).toBe(movies[21]?.title)
            expect(res?.body.data.series).toHaveLength(0)
        })

        test("non-member read", async () => {
            const res = await users[users.length-1]?.agent.get(`/v1/watchgroups/${watchgroup.id}`)
            expect(res?.status).toBe(404)
        })

    })
})