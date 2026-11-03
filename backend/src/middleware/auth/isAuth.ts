import type { Request, Response, NextFunction } from "express";


export default function isAuth(req: Request, res: Response, next: NextFunction) {
    if(req.isAuthenticated())
        return next()

    res.status(401).send("Unauthorized")
}