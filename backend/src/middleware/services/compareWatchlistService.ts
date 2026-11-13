import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.ts";
import type { Movie, Series, User, WatchListMovie, WatchListSeries } from "../../../generated/prisma/client.ts";

// adjust pick to match selects in raw prisma query
type UsersWatchlistType =
    Pick<WatchListMovie | WatchListSeries, 
        "hasWatched" | "rating" | "dateAdded" | "dateUpdated"
    > | 
    Pick<User, 
        "id" | "username" | "pfpPath"
    >

export interface WatchlistMovieComparisonTypes 
    extends Pick<Movie,
        "id" |
        "title" |
        "originalTitle" |
        "posterPath" |
        "backdropPath" |
        "voteAverage" |
        "releaseDate"
    > {
    users: UsersWatchlistType[]
}

export interface WatchlistSeriesComparisonTypes 
    extends Pick<Series,
        "id" |
        "name" |
        "originalName" |
        "posterPath" |
        "backdropPath" |
        "voteAverage" |
        "firstAirDate"
    > {
    users: UsersWatchlistType[]
}

interface QueryTaskType extends Array<Promise<any>> {
    0: Promise<WatchlistMovieComparisonTypes[]>
    1: Promise<WatchlistSeriesComparisonTypes[]>
}
export default async function compareWatchlistService(req: Request<{userId?: number}, {}, {}, {search?: string}>, _res: Response, next: NextFunction) {
    // paranoid check in case of sql injection
    const userIds = [req.user?.id, req.params.userId]
        .map(id => {
            if (typeof id != "number")
                throw new Error("userId is not an integer")
            return id
        }) 
        .join(", ")

    if (!req.params.userId)
        throw new Error("userId params not set")

    const queryTasks: QueryTaskType = [
        prisma.$queryRawUnsafe<WatchlistMovieComparisonTypes[]>(`
            SELECT 
                m.id, 
                m.title, 
                m.original_title as "originalTitle",
                m.poster_path as "posterPath",
                m.backdrop_path as "backdropPath",
                m.vote_average as "voteAverage",
                m.release_date as "releaseDate",
                JSONB_AGG(
                    JSONB_BUILD_OBJECT(
                        'id', u.id,
                        'username', u.username,
                        'pfpPath', u.pfp_path,
                        'rating', wlm.rating,
                        'dateAdded', wlm.date_added,
                        'dateUpdated', wlm.date_updated
                    )
                ) AS users
            FROM movie AS m
            CROSS JOIN "user" AS u 
            LEFT JOIN watchlist_movie AS wlm 
                ON m.id = wlm.movie_id AND wlm.user_id = u.id
            WHERE
                u.id IN (${userIds})
                ${
                    req.lastMovie ?
                        `AND m.title > '${req.lastMovie.title}'` :
                        ""
                }

            GROUP BY m.id
            ORDER BY m.title
            LIMIT 20
        `),
        prisma.$queryRawUnsafe<WatchlistSeriesComparisonTypes[]>(`
            SELECT
                s.id, 
                s.name, 
                s.original_name as "originalName",
                s.poster_path as "posterPath",
                s.backdrop_path as "backdropPath",
                s.vote_average as "voteAverage",
                s.first_air_date as "firstAirDate",
                JSONB_AGG(
                    JSONB_BUILD_OBJECT(
                        'id', u.id,
                        'username', u.username,
                        'pfpPath', u.pfp_path,
                        'rating', wls.rating,
                        'dateAdded', wls.date_added,
                        'dateUpdated', wls.date_updated
                    )
                ) AS users
            FROM series AS s
            CROSS JOIN "user" AS u 
            LEFT JOIN watchlist_series AS wls 
                ON s.id = wls.series_id AND wls.user_id = u.id
            WHERE
                u.id IN (${userIds})
                ${
                    req.lastSeries ?
                        `AND s.name > '${req.lastSeries.name}'` :
                        ""
                }
            GROUP BY s.id
            ORDER BY s.name
            LIMIT 20
        `)
    ]

    if(req.query.search) {
        queryTasks[0] = prisma.$queryRawUnsafe<WatchlistMovieComparisonTypes[]>(`
            SELECT 
                m.id, 
                m.title, 
                m.original_title as "originalTitle",
                m.poster_path as "posterPath",
                m.backdrop_path as "backdropPath",
                m.vote_average as "voteAverage",
                m.release_date as "releaseDate",
                JSONB_AGG(
                    JSONB_BUILD_OBJECT(
                        'id', u.id,
                        'username', u.username,
                        'pfpPath', u.pfp_path,
                        'rating', wlm.rating,
                        'dateAdded', wlm.date_added,
                        'dateUpdated', wlm.date_updated
                    )
                ) AS users
            FROM movie AS m
            CROSS JOIN "user" AS u 
            LEFT JOIN watchlist_movie AS wlm 
                ON m.id = wlm.movie_id AND wlm.user_id = u.id
            WHERE
                u.id IN (${userIds})
                ${
                    req.lastMovie ?
                        `AND m.title > '${req.lastMovie.title}'` :
                        ""
                }
                ${ req.query.search ? "AND (UPPER(m.title) LIKE $1 OR UPPER(m.original_title) LIKE $1)" : "" }
            GROUP BY m.id
            ORDER BY m.title
            LIMIT 20`, 
        `%${req.query.search.toUpperCase()}%`)

        queryTasks[1] = prisma.$queryRawUnsafe<WatchlistSeriesComparisonTypes[]>(`
            SELECT
                s.id, 
                s.name, 
                s.original_name as "originalName",
                s.poster_path as "posterPath",
                s.backdrop_path as "backdropPath",
                s.vote_average as "voteAverage",
                s.first_air_date as "firstAirDate",
                JSONB_AGG(
                    JSONB_BUILD_OBJECT(
                        'id', u.id,
                        'username', u.username,
                        'pfpPath', u.pfp_path,
                        'rating', wls.rating,
                        'dateAdded', wls.date_added,
                        'dateUpdated', wls.date_updated
                    )
                ) AS users
            FROM series AS s
            CROSS JOIN "user" AS u 
            LEFT JOIN watchlist_series AS wls 
                ON s.id = wls.series_id AND wls.user_id = u.id
            WHERE
                u.id IN (${userIds})
                ${
                    req.lastSeries ?
                        `AND s.name > '${req.lastSeries.name}'` :
                        ""
                }
                ${ req.query.search ? "AND (UPPER(s.name) LIKE $1 OR UPPER(s.original_name) LIKE $1)" : "" }
            GROUP BY s.id
            ORDER BY s.name
            LIMIT 20`, 
        `%${req.query.search.toUpperCase()}%`)
    }

    
    
    const [userMovies, userSeries] =  await Promise.all(queryTasks)

    req.watchlistComparison = {
        movies: userMovies,
        series: userSeries
    }

    next()
}