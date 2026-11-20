import { prisma } from "../../lib/prisma.ts";
import getMediaDetails from "../tmdb/getMediaDetails.ts";

interface Media {
    type: "movie" | "series";
    id: number
}

export default async function addMedia(watchGroupId: number, media: Media) {
    if (media.type == "movie") {
        const movie = await prisma.movie.findUnique({where: {id: media.id}})
        if (movie) {
            await prisma.watchGroup.update({
                where: {id: watchGroupId},
                data: { movies: { connect: {id: movie.id} } }
            })
            return movie
        }
        // fetch via tmdb api with save to db side effect
        const newMovie = await getMediaDetails("movie", media.id)
        await prisma.watchGroup.update({
            where: {id: watchGroupId},
            data: { movies: { connect: {id: newMovie.id} } }
        })
        // note: this have extra properties but i think some network overhead is better than extra queries
        return newMovie
    }
    else if (media.type == "series") {
        const series = await prisma.series.findUnique({where: {id: media.id}})
        if (series) {
            await prisma.watchGroup.update({
                where: {id: watchGroupId},
                data: { series: { connect: {id: series.id} } }
            })
            return series
        }
        // fetch via tmdb api with save to db side effect
        const newSeries = await getMediaDetails("series", media.id)
        await prisma.watchGroup.update({
            where: {id: watchGroupId},
            data: { series: { connect: {id: newSeries.id} } }
        })
        // note: this have extra properties but i think some network overhead is better than extra queries
        return newSeries
    }
    else 
        throw new Error("unknown media type")
}