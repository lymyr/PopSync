import tmdb from "../../lib/tmdb.ts";
import type { NextFunction, Request, Response } from "express";
import type { QueryTypes } from "../validation/MediaValidation.ts";

export default async function mediaFetchService(req: Request<{}, {}, {}, QueryTypes>, res: Response, next: NextFunction) {
    const {type, query, page} = req.query
    if (type == "movies")
        req.tmdbSearch = await tmdb.search.movies({ query, page })
    else
        req.tmdbSearch = await tmdb.search.tvShows({ query, page })

    next()
}