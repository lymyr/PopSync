import { describe, test, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../../../lib/prisma.ts";
import type { User } from "../../../../generated/prisma/client.ts";
import request from "supertest"
import app from "../../../app.ts";

describe("search users", async () => {
    let users: User[];
    beforeAll(async () => {
        const usernames = [
            "abc", "ABC", "CBA", "Ant", "ant324", "bart", "ram", "tart", 
            "cart", "stark", "fart", "part", "larp", "carp",
            // includes "a" ^
            "zen", "ZeeBruh", "Zuck", "ZeeZow", "zzzz",
            // doesn't have "a"
        ]
        users = await prisma.user.createManyAndReturn({
            data: usernames.map((u) => {
                return {
                    username: u,
                    password: "passwordOf" + u,
                    pfpPath: "/pfpPath"
                }
            })
        })
    })

    afterAll(async () => {
        await prisma.user.deleteMany()
    })

    async function searchUser(username: string, lastId?: string) {
        let url = `/v1/users/search?username=${username}`
        if (lastId)
            url += `&lastId=${lastId}`
        return request(app).get(url)
    }

    test("returns paginated users", async () => {
        const res = await searchUser("a")
        const res2 = await searchUser("a", res.body.data.users[res.body.data.users.length - 1].id)
        expect(res.body.data.users).toHaveLength(10)
        expect(res2.body.data.users).toHaveLength(4)
    })

    describe("invalid searches", () => {
        test("blank username", async () => {
            const res = await searchUser("")
            expect(res.status).toBe(400)
        })
        test("lastId not int", async () => {
            const res = await searchUser("a", "string")
            expect(res.status).toBe(400)
        })
        test("user with lastId doesn't exist", async () => {
            let id = 0;
            let hasDuplicates = false
            // just to be paranoid lol
            do {
                hasDuplicates = false
                for (let i = 0; i < users.length; i++) {
                    if (users[i]?.id == id) {
                        hasDuplicates = true
                        id += 1
                        break;
                    }
                }
            } while (hasDuplicates)

            
            const res = await searchUser("a", id.toString())
            expect(res.status).toBe(404)
        })
    })
})


describe("search movies", () => {
    test.todo("returns paginated movies")
})

describe("search series", () => {
    test.todo("returns paginated series")
}) 