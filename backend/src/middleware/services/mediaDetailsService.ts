import type { Request, Response, NextFunction } from "express";
import tmdb from "../../lib/tmdb.ts";
import type { DetailsQuery } from "../validation/MediaValidation.ts";
import { prisma } from "../../lib/prisma.ts";

export default async function mediaDetailsService(req: Request<{}, {}, {}, DetailsQuery>, res: Response, next: NextFunction) {
    if (req.path == "/movies") {
        const md = await tmdb.movies.details(req.query.id)
        await prisma.movie.upsert({
            create: {
                id: md.id,
                title: md.title,
                originalTitle: md.original_title,
                overview: md.overview,
                posterPath: md.poster_path ? md.poster_path : "",
                backdropPath: md.backdrop_path,
                releaseDate: md.release_date,
                voteAverage: md.vote_average,
                runtime: md.runtime
            },
            update: {
                title: md.title,
                originalTitle: md.original_title,
                overview: md.overview,
                posterPath: md.poster_path ? md.poster_path : "",
                backdropPath: md.backdrop_path,
                releaseDate: md.release_date,
                voteAverage: md.vote_average,
                runtime: md.runtime
            },
            where: {
                id: md.id
            }
        })
        req.movieDetails = md
    }
    else if (req.path == "/series") {
        const sd = await tmdb.tvShows.details(req.query.id)
        await prisma.series.upsert({
            create: {
                id: sd.id,
                name: sd.name,
                originalName: sd.original_name,
                overview: sd.overview,
                posterPath: sd.poster_path,
                backdropPath: sd.backdrop_path,
                firstAirDate: sd.first_air_date,
                voteAverage: sd.vote_average,
                status: sd.status,
                seasons: sd.seasons as object
            },
            update: {
                name: sd.name,
                originalName: sd.original_name,
                overview: sd.overview,
                posterPath: sd.poster_path,
                backdropPath: sd.backdrop_path,
                firstAirDate: sd.first_air_date,
                voteAverage: sd.vote_average,
                status: sd.status,
                seasons: sd.seasons as object
            },
            where: {
                id: sd.id
            }
        })
        req.seriesDetails = sd
    }
    else
        throw new Error("invalid path")

    next()
}