import { describe, test, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../../../lib/prisma.ts";
import request from "supertest"
import app from "../../../app.ts";
import { testUserGen, type TestUser } from "../../utils/userGeneration.ts";
import generateMockId from "../../utils/generateMockId.ts";

let loggedUser: TestUser;
beforeAll(async () => {
    loggedUser = (await testUserGen(1, "kakarot"))[0] as TestUser
})

afterAll(async () => {
    await Promise.all([prisma.user.deleteMany(), prisma.session.deleteMany()])
})

describe("search users", async () => {
    beforeAll(async () => {
        const usernames = [
            "ABC", "CBA", "Ant", "ant324", "bart", "ram", "tart", 
            "cart", "stark", "fart", "part", "larp", "carp", "kars",
            // includes "a" ^
            "zen", "ZeeBruh", "Zuck", "ZeeZow", "zzzz",
            // doesn't have "a"
        ]
        await prisma.user.createManyAndReturn({
            data: usernames.map((u) => {
                return {
                    username: u,
                    password: u,
                    pfpPath: "/pfpPath"
                }
            })
        });
    })

    afterAll(async () => {
        await prisma.user.deleteMany()
    })

    async function searchUser(username: string, lastId?: string) {
        let url = `/v1/users?username=${username}`
        if (lastId)
            url += `&lastId=${lastId}`
        return loggedUser.agent.get(url)
    }

    test("returns paginated users", async () => {
        const res = await searchUser("a")
        const res2 = await searchUser("a", res.body.data[res.body.data.length - 1].id)
        expect(res.body.data).toHaveLength(10)
        expect(res2.body.data).toHaveLength(4)
    })

    test("doesn't show the logged user in search", async () => {
        const res = await searchUser("kar")
        const usernames = res.body.data.map((u: {username: string}) => u.username)
        expect(usernames).not.toEqual(expect.arrayContaining([loggedUser.details.username]))
    })

    describe("invalid searches", () => {
        test("not logged in", async () => {
            const res = await request(app).post("/v1/users/search?username=a")
            expect(res.status).toBe(401)
        })

        test("blank username", async () => {
            const res = await searchUser("")
            expect(res.status).toBe(400)
        })
        test("lastId not int", async () => {
            const res = await searchUser("a", "string")
            expect(res.status).toBe(400)
        })
        test("user with lastId doesn't exist", async () => {
            const id = generateMockId([0])
            const res = await searchUser("a", id.toString())
            expect(res.status).toBe(404)
        })
    })
})