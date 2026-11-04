import type { Request, Response } from "express";
import type { QueryTypes } from "../../middleware/validation/MediaValidation.ts";

export async function searchResults(req: Request<{}, {}, {}, QueryTypes>, res: Response) {
    res.json({
        data: req.tmdbSearch
    })
}