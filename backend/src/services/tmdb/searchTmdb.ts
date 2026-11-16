import tmdb from "../../lib/tmdb.ts"

export default async function searchTmdb(type: "movies" | "series", query: string, page: number) {
    let results;
    if (type == "movies")
        results = await tmdb.search.movies({ query, page })
    else
        results = await tmdb.search.tvShows({ query, page })
    return results
}