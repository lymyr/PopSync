import type { Request, Response } from "express"
import { prisma } from "../../lib/prisma.ts"
import bcrypt from "bcryptjs"
import type { Register } from "../../middleware/validation/UserValidation.ts"

export function getUsers(req: Request, res: Response) {
    res.send("hello")
}

export async function register(req:Request<{}, {}, Register>, res:Response) {
    const hashed = await bcrypt.hash(req.body.password, 10)
    await prisma.user.create({
        data: {
            username: req.body.username,
            password: hashed,
            pfpPath: "",
    }})
    res.status(201).send("success")
}

export async function login(req:Request, res:Response) {
    res.status(200).json({
        message: "login success",
        success: true
    })
}