import tmdb from "../../lib/tmdb.ts";
import mediaSideEffect from "./mediaSideEffect.ts";

export default async function getMediaDetails(type: "movie" | "series", id: number) {
    if (type == "movie") {
        const details = await tmdb.movies.details(id)
        await mediaSideEffect({type: "movie", details})
        return details
    }
    else {
        const details = await tmdb.tvShows.details(id)
        await mediaSideEffect({type: "series", details})
        return details
    }
}