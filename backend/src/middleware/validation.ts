import type { Request, Response, NextFunction } from "express"
import { body, validationResult } from "express-validator"
import { prisma } from "../lib/prisma.ts"

export function throwerHelper(req: Request, res: Response, next: NextFunction) {
    const err = validationResult(req)
    if (err.isEmpty())
        return next()

    res.status(400).json({
        validationErrors: err.mapped(),
        success: false
    })
}

class Validation {
    constructor() {
        throw new Error("class does not allow instances")
    }
}

export class UserValidation extends Validation {
    static username = body("username")
        .notEmpty().withMessage("please input a username")
        .not().matches(/[-_.]{2,}/g).withMessage("hypens (-), underscores (_), and periods (.) should not be next to each other")
        .not().matches(/^[-_.]|[-_.]$/g).withMessage("usernames should not start or end with hypens (-), underscores (_), and periods (.)")
        .isAlphanumeric(undefined, { ignore: '_-.' }).withMessage("username can only contain alphanumeric values, hypens (-), underscores (_), and periods (.)")
        .bail()
        .custom(async (username) => {
            const user = await prisma.user.findFirst({ where: { username }})
            if (user)
                throw new Error("Username already exists")
        })

    static password = body("password").notEmpty().withMessage("Please input a password").isString()
        .isStrongPassword({
            minLength: 8,
            minLowercase: 0,
            minUppercase: 0,
            minNumbers: 1,
            minSymbols: 0
        }).withMessage("password must be at least 8 characters long and at least a single number")
    
    static confirmPassword = body("confirmPassword").notEmpty().withMessage("please confirm your password")
        .custom((val, meta) => {
            if (val === meta.req.body.password)
                return true
            return false
        }).withMessage("passwords do not match")

    static validateRegisterPayload = [
        this.username,
        this.password,
        this.confirmPassword
    ]
}