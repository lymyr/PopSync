import { prisma } from "../../lib/prisma.ts";
import type { User, WatchGroup } from "../../../generated/prisma/client.ts";

type UpdateFallback = {type: "add", members: Array<number>} | {type: "delete", member: User}

export default class FallbackName {
    private static maxDisplayingMembers = 5
    private static fallbackStringToArray = (fallback: string) => fallback.split(", ")

    // include req.user in memberIds
    static createFallbackName = async (watchGroupName: string, memberIds: Array<number>) => {
        if (watchGroupName === "") {
            if (memberIds.length > 0) {
                const users = await prisma.user.findMany({
                    where: { id: { 
                        in: memberIds
                    }},
                    take: this.maxDisplayingMembers - 1
                })
                let val = memberIds.length <= this.maxDisplayingMembers ? 
                    `${users.map(u => u.username).join(", ")}` :
                    `${users.map(u => u.username).join(", ")}...`
                return val
            }
            else
                throw new Error("memberIds array msut have at least one element")
        }
        return ""
    }
    
    // do not include req.user in details.members
    static getNewFallbackName = async (watchGroupId: number, details: UpdateFallback): Promise<string> => {
        const watchgroup = await prisma.watchGroup.findUnique({where: {id: watchGroupId}}) as NonNullable<WatchGroup>
        if (watchgroup.name == "") {
            const currentFallbackArr = this.fallbackStringToArray(watchgroup.fallbackName)
            if (details.type == "add" && currentFallbackArr.length < this.maxDisplayingMembers) {
                const takeAmount = (this.maxDisplayingMembers - currentFallbackArr.length) * -1
                const newUsers = await prisma.user.findMany({
                    where: { id: { 
                        in: details.members
                    }},
                    take: takeAmount
                })
                
                const newFallbackName = [...currentFallbackArr, ...newUsers.map(u => u.username)]
                const newFallback = (currentFallbackArr.length + details.members.length) <= this.maxDisplayingMembers ? 
                    `${newFallbackName.join(", ")}` :
                    `${newFallbackName.join(", ")}...`
                    
                return newFallback
            }
            else if (details.type == "delete") {
                const members = await prisma.watchGroupUser.findMany({ where: { watchGroupId: watchgroup.id}, include: {user: true}, take: this.maxDisplayingMembers + 2})
                if (members.length > this.maxDisplayingMembers) {
                    const isInName = currentFallbackArr.includes(details.member.username) || currentFallbackArr.at(-1) == `${details.member.username}...`
                    if (!isInName && members.length == 6) {
                        const newFallback = currentFallbackArr.join(", ")
                        return newFallback.slice(0, newFallback.length-3)
                    }
                    else if (isInName) {
                        return members.length > this.maxDisplayingMembers + 1 ?
                            `${members.filter(m => m.userId != details.member.id).map(m => m.user.username).slice(0, 5).join(", ")}...` :
                            members.filter(m => m.userId != details.member.id).map(m => m.user.username).join(", ")
                    }
                } 
                else 
                    return currentFallbackArr.filter(name => name != details.member.username).join(", ")
            }
            return watchgroup.fallbackName
        }
        return ""
    }
}