import type { NextFunction, Request, Response } from "express";
import type { watchgroupBodyType } from "../validation/watchgroupValidation.ts";
import { prisma } from "../../lib/prisma.ts";

type ReqBody = 
    Partial<watchgroupBodyType> &
    {members: NonNullable<watchgroupBodyType["members"]>} | 
    undefined

const maxMemberGroupFallbackName = 5

export default async function getWatchgroupFallbackNameService(req: Request<{id?: number, userId?: number}, {}, ReqBody>, _res: Response, next: NextFunction) {
    // runs during watchgroup creation
    if (req.body?.name === "") {
        if (req.body.members.length > 0) {
            const users = await prisma.user.findMany({
                where: { id: { 
                    in: req.body.members.map((u) => u.userId)
                }},
                take: maxMemberGroupFallbackName - 1
            })
            let val = req.body.members.length < maxMemberGroupFallbackName ? 
                `${req.user?.username}, ${users.map(u => u.username).join(", ")}` :
                `${req.user?.username}, ${users.map(u => u.username).join(", ")}...`
            req.watchgroupFallbackName = val
        }
        else
            req.watchgroupFallbackName = req.user?.username as string
    }
    // runs if params :id and adding user
    else if (req.watchgroup?.name == "") {
        const currentFallbackArr = req.watchgroup.fallbackName.split(", ")
        if (req.method == "POST" && req.body?.members && currentFallbackArr.length < maxMemberGroupFallbackName) {
            const takeAmount = (maxMemberGroupFallbackName - currentFallbackArr.length) * -1
            const newUsers = await prisma.user.findMany({
                where: { id: { 
                    in: req.body.members.map((u) => u.userId) 
                }},
                take: takeAmount
            })
            
            const newFallbackName = [...currentFallbackArr, ...newUsers.map(u => u.username)]
            const newFallback = (currentFallbackArr.length + req.body.members.length) <= maxMemberGroupFallbackName ? 
                `${newFallbackName.join(", ")}` :
                `${newFallbackName.join(", ")}...`
                
            req.watchgroupFallbackName = newFallback
        }
        else if (req.method == "DELETE" && req.params.userId) {
            const members = await prisma.watchGroupUser.findMany({ where: { watchGroupId: req.watchgroup.id}, include: {user: true}, take: maxMemberGroupFallbackName + 2})
            if (members.length > maxMemberGroupFallbackName) {
                const isInName = currentFallbackArr.includes(req.foundUser.username) || currentFallbackArr.at(-1) == `${req.foundUser.username}...`
                if (!isInName && members.length == 6) {
                    const newFallback = currentFallbackArr.join(", ")
                    req.watchgroupFallbackName = newFallback.slice(0, newFallback.length-3)
                }
                else if (isInName) {
                    req.watchgroupFallbackName = members.length > maxMemberGroupFallbackName + 1 ?
                        `${members.filter(m => m.userId != req.params.userId).map(m => m.user.username).slice(0, 5).join(", ")}...` :
                        members.filter(m => m.userId != req.params.userId).map(m => m.user.username).join(", ")
                }
            } 
            else {
                req.watchgroupFallbackName = currentFallbackArr.filter(name => name != req.foundUser.username).join(", ")
            }
        }
    }

    next()
}
