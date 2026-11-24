import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import type { User } from "../../../generated/prisma/client.ts";

export default function handleLogin( req: Request, res: Response, next: NextFunction) {
    passport.authenticate('local', (err: Error, user: User) => {
        if (err || !user) { 
            return res.sendStatus(401)
        }
        req.logIn(user, next);
    })(req, res, next);
}