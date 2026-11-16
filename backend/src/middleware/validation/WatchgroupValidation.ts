import { body, param } from "express-validator"
import Validation from "./Validation.ts"
import { prisma } from "../../lib/prisma.ts"
import type { Request } from "express"

export interface WatchgroupBodyType {
    name: string;
    members: {
        userId: number;
        isAdmin: boolean;
    }[]
}

export default class WatchgroupValidation extends Validation {
    static name = body("name").isString().trim()

    static members = body("members").isArray().if(arr => arr.length > 0)
        .custom((memArr: WatchgroupBodyType["members"]) => {
            for (const mem of memArr) {
                if (typeof mem.userId != "number") {
                    throw new Error(`userId: ${mem.userId} is an invalid value. Expected type: number`)
                }
                if (typeof mem.isAdmin != "boolean") {
                    throw new Error(`isAdmin: ${mem.isAdmin} is an invalid value. Expected type: boolean`)
                }
            }
            return true
        })

    static isAdmin = param("id").isInt().withMessage("expected watchgroup id to be int").toInt().bail()
        .custom(async (id, meta) => {
            const req = meta.req as Request
            const user = await prisma.watchGroupUser.findUnique({
                where: {
                    watchGroupId_userId: {
                        userId: req.user?.id as number,
                        watchGroupId: id
                    }
                },
                include: {
                    watchGroup: true
                }
            })

            if (!user) {
                req.errorStatusCode = 404
                throw new Error("you are not a member of this group or the group doesn't exist")
            }

            if (!user?.isAdmin) {
                req.errorStatusCode = 403
                throw new Error("you are not an admin")
            }

            req.watchgroup = user.watchGroup
        })

    static userId = param("userId").isInt().withMessage("expected userId to be int").toInt().bail()
        .custom(async (userId, meta) => {
            const req = meta.req as Request<{id: number}>
            const wgUser = await prisma.watchGroupUser.findUnique({
                where: {
                    watchGroupId_userId: {
                        userId: userId,
                        watchGroupId: req.params.id
                    }
                },
                include: {
                    watchGroup: true,
                    user: true
                }
            })
            if (!wgUser) {
                req.errorStatusCode = 404;
                throw new Error("User not found")
            }
            if (wgUser.isAdmin) {
                req.errorStatusCode = 403
                throw new Error("You cannot remove other admins")
            }
            req.foundUser = wgUser.user
        })
}