import type { Request, Response } from "express";
import type { SearchQuery } from "../../middleware/validation/MediaValidation.ts";
import type { DetailsQuery } from "../../middleware/validation/MediaValidation.ts";

export async function searchResults(req: Request<{}, {}, {}, SearchQuery>, res: Response) {
    res.json({
        data: req.tmdbSearch
    })
}

export async function getSeriesDetails(req: Request<{}, {}, {}, DetailsQuery>, res: Response) {
    res.json({
        data: req.seriesDetails
    })
}

export async function getMovieDetails(req: Request<{}, {}, {}, DetailsQuery>, res: Response) {
    res.json({
        data: req.movieDetails
    })
}