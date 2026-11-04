import type { Request, Response } from "express";
import type { SearchQuery } from "../../middleware/validation/MediaValidation.ts";

export async function searchResults(req: Request<{}, {}, {}, SearchQuery>, res: Response) {
    res.json({
        data: req.tmdbSearch
    })
}