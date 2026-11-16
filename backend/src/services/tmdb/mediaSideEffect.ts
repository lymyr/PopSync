import type { AppendToResponse, MovieDetails, AppendToResponseMovieKey, TvShowDetails, AppendToResponseTvKey } from "tmdb-ts";
import { prisma } from "../../lib/prisma.ts";

type Media = 
    {
        type: "movie"
        details: AppendToResponse<MovieDetails, AppendToResponseMovieKey[] | undefined, "movie">
    } |
    {
        type: "series",
        details: AppendToResponse<TvShowDetails, AppendToResponseTvKey[] | undefined, "tvShow">
    }

export default async function mediaSideEffect(media: Media) {
    if (media.type == "movie")
        await prisma.movie.upsert({
            create: {
                id: media.details.id,
                title: media.details.title,
                originalTitle: media.details.original_title,
                overview: media.details.overview,
                posterPath: media.details.poster_path ? media.details.poster_path : "",
                backdropPath: media.details.backdrop_path,
                releaseDate: media.details.release_date,
                voteAverage: media.details.vote_average,
                runtime: media.details.runtime
            },
            update: {
                title: media.details.title,
                originalTitle: media.details.original_title,
                overview: media.details.overview,
                posterPath: media.details.poster_path ? media.details.poster_path : "",
                backdropPath: media.details.backdrop_path,
                releaseDate: media.details.release_date,
                voteAverage: media.details.vote_average,
                runtime: media.details.runtime
            },
            where: {
                id: media.details.id
            }
        })
    else
        await prisma.series.upsert({
            create: {
                id: media.details.id,
                name: media.details.name,
                originalName: media.details.original_name,
                overview: media.details.overview,
                posterPath: media.details.poster_path,
                backdropPath: media.details.backdrop_path,
                firstAirDate: media.details.first_air_date,
                voteAverage: media.details.vote_average,
                status: media.details.status,
                seasons: media.details.seasons as object
            },
            update: {
                name: media.details.name,
                originalName: media.details.original_name,
                overview: media.details.overview,
                posterPath: media.details.poster_path,
                backdropPath: media.details.backdrop_path,
                firstAirDate: media.details.first_air_date,
                voteAverage: media.details.vote_average,
                status: media.details.status,
                seasons: media.details.seasons as object
            },
            where: {
                id: media.details.id
            }
        })
}