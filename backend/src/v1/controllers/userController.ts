import type { Request, Response } from "express"

export function getUsers(req: Request, res: Response) {
    res.send("hello")
}