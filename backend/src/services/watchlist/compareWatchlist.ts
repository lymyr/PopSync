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

type query = {
    lastMovie: Movie | undefined,
    lastSeries: Series | undefined,
    search: string | undefined
}

class RawQueries {
    static getMovies = (currentUserId: number, mediaFromUserIds: Array<number>, lastMovie: Movie | undefined, search: boolean) => {
        const stringUserIds = [currentUserId, ...mediaFromUserIds].join(", ")
        const title = lastMovie?.title.split("").map(char => char == "'" ? "''" : char).join("")
        return `
            SELECT 
                m.id, 
                m.title, 
                m.original_title as "originalTitle",
                m.poster_path as "posterPath",
                m.backdrop_path as "backdropPath",
                m.vote_average as "voteAverage",
                m.release_date as "releaseDate",
                (
                    SELECT (
                        JSONB_AGG(
                            JSONB_BUILD_OBJECT(
                                'id', u.id,
                                'username', u.username,
                                'pfpPath', u.pfp_path,
                                'rating', inner_wlm.rating,
                                'hasWatched', inner_wlm.has_watched,
                                'dateAdded', inner_wlm.date_added,
                                'dateUpdated', inner_wlm.date_updated
                            )
                            ORDER BY inner_wlm.rating, inner_wlm.has_watched, u.username
                        )
                    ) FROM "user" as u
                    LEFT JOIN watchlist_movie AS inner_wlm ON
                        u.id = inner_wlm.user_id
                        AND inner_wlm.movie_id = m.id
                    WHERE u.id IN (${stringUserIds})
                ) AS users
            FROM movie AS m
            INNER JOIN watchlist_movie AS wlm ON 
                m.id = wlm.movie_id 
            WHERE
                wlm.user_id IN (${mediaFromUserIds.join(", ")})
                ${lastMovie ?
                    `
                    AND m.id > ${lastMovie.id}
                    AND m.title >= '${title}'
                    ` : ""}
                ${ search ? "AND (UPPER(m.title) LIKE $1 OR UPPER(m.original_title) LIKE $1)" : "" }
            GROUP BY m.id
            ORDER BY m.title, m.id ASC
            LIMIT 20
        `
    }

    static getSeries = (currentUserId: number, mediaFromUserIds: Array<number>, lastSeries: Series | undefined, search: boolean) => {
        const stringUserIds = [currentUserId, ...mediaFromUserIds].join(", ")
        const title = lastSeries?.name.split("").map(char => char == "'" ? "''" : char).join("")
        return `SELECT
                s.id, 
                s.name, 
                s.original_name as "originalName",
                s.poster_path as "posterPath",
                s.backdrop_path as "backdropPath",
                s.vote_average as "voteAverage",
                s.first_air_date as "firstAirDate",
                (
                    SELECT (
                        JSONB_AGG(
                            JSONB_BUILD_OBJECT(
                                'id', u.id,
                                'username', u.username,
                                'pfpPath', u.pfp_path,
                                'rating', inner_wls.rating,
                                'hasWatched', inner_wls.has_watched,
                                'dateAdded', inner_wls.date_added,
                                'dateUpdated', inner_wls.date_updated
                            )
                            ORDER BY inner_wls.rating, inner_wls.has_watched, u.username
                        )
                    ) FROM "user" as u
                    LEFT JOIN watchlist_series AS inner_wls ON
                        u.id = inner_wls.user_id
                        AND inner_wls.series_id = s.id
                    WHERE u.id IN (${stringUserIds})
                ) AS users
            FROM series AS s
            INNER JOIN watchlist_series AS wls ON 
                s.id = wls.series_id 
                AND wls.user_id IN (${mediaFromUserIds.join(", ")})
            WHERE
                wls.user_id IN (${mediaFromUserIds.join(", ")})
                ${lastSeries ?
                    `
                    AND s.id > ${lastSeries.id}
                    AND s.name >= '${title}'
                    ` : ""}
                ${ search ? "AND (UPPER(s.name) LIKE $1 OR UPPER(s.original_name) LIKE $1)" : "" }
            GROUP BY s.id
            ORDER BY s.name, s.id ASC
            LIMIT 20
        `
    }
}

export default async function compareWatchlist(
    validatedCurrentUserId: number, 
    validatedUserIdsToCompare: Array<number>,
    query?: query
) {
    // paranoid check in case of sql injection
    [validatedCurrentUserId, ...validatedUserIdsToCompare]
        .map(id => {
            if (typeof id != "number")
                throw new Error("userId is not an integer")
            return id
        }) 

    const queryTasks: QueryTaskType = [
        prisma.$queryRawUnsafe<WatchlistMovieComparisonTypes[]>(
            RawQueries.getMovies(validatedCurrentUserId, validatedUserIdsToCompare, query?.lastMovie, false)
        ),
        prisma.$queryRawUnsafe<WatchlistSeriesComparisonTypes[]>(
            RawQueries.getSeries(validatedCurrentUserId, validatedUserIdsToCompare, query?.lastSeries, false)
        )
    ]

    if (query?.search) {
        queryTasks[0] = prisma.$queryRawUnsafe<WatchlistMovieComparisonTypes[]>(
            RawQueries.getMovies(validatedCurrentUserId, validatedUserIdsToCompare, query?.lastMovie, true ),
            `%${query.search.toUpperCase()}%`
        )

        queryTasks[1] = prisma.$queryRawUnsafe<WatchlistSeriesComparisonTypes[]>(
            RawQueries.getSeries(validatedCurrentUserId, validatedUserIdsToCompare, query?.lastSeries, true),
            `%${query?.search.toUpperCase()}%`
        )
    }

    const [userMovies, userSeries] =  await Promise.all(queryTasks)
    return {
        movies: userMovies,
        series: userSeries
    }
}