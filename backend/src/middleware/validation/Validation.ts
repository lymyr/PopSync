import type { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"


export function throwerHelper<params extends Record<string, any>, resBody, reqBody, reqQuery extends Record<string, any>>(req: Request<params, resBody, reqBody, reqQuery >, res: Response, next: NextFunction) {
    const err = validationResult(req)
    if (err.isEmpty())
        return next()

    const status = req.errorStatusCode || 400
    res.status(status).json({
        validationErrors: err.mapped(),
        success: false
    })
}

export default class Validation {
    constructor() {
        throw new Error("class does not allow instances")
    }
}