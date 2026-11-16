import type { Request, Response } from "express";
import type { SearchQuery } from "../../middleware/validation/MediaValidation.ts";
import type { DetailsQuery } from "../../middleware/validation/MediaValidation.ts";
import getMediaDetails from "../../services/tmdb/getMediaDetails.ts";
import searchTmdb from "../../services/tmdb/searchTmdb.ts";

export async function searchResults(req: Request<{}, {}, {}, SearchQuery>, res: Response) {
    const data = await searchTmdb(req.query.type, req.query.query, req.query.page)
    res.json({ data })
}

export async function getSeriesDetails(req: Request<{}, {}, {}, DetailsQuery>, res: Response) {
    const data = await getMediaDetails("series", req.query.id)
    res.json({ data })
}

export async function getMovieDetails(req: Request<{}, {}, {}, DetailsQuery>, res: Response) {
    const data = await getMediaDetails("movie", req.query.id)
    res.json({ data })
}