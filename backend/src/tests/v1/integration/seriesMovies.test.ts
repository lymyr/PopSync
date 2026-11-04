import { beforeAll, describe, expect, test } from "vitest"
import { testUserGen, type TestUser } from "../../utils/userGeneration.ts"

let user: TestUser;
beforeAll(async () => {
    user = (await testUserGen(1))[0] as TestUser
})

type searchType = "movies" | "series"
async function search(type?: searchType | string, query?: string, page?: "none" | number | string) {
    const params = new URLSearchParams()
    if (type !== undefined)
        params.append("type", type)
    if (query !== undefined)
        params.append("query", query)
    if (page !== undefined && page !== "none")
        params.append("page", page.toString())
    return user.agent.get(`/v1/media?${params.toString()}`)
}

describe("search movies", () => {
    test("returns movies", async () => {
        const res = await search("movies", "one piece", 1)
        expect(res.body.data.results).toEqual(expect.any(Array))
        expect(res.body.data.results[0].id).not.toBeNull()
        // tmdb shows 'title' instead of 'name' when searching movies
        expect(res.body.data.results[0].title).not.toBeUndefined()
    })
})

describe("search series", () => {
    test("returns series", async () => {
        const res = await search("series", "one piece", 1)
        expect(res.body.data.results).toEqual(expect.any(Array))
        expect(res.body.data.results[0].id).not.toBeNull()
        // tmdb shows 'name' instead of 'title' when searching tv shows
        expect(res.body.data.results[0].name).not.toBeUndefined()
    })
}) 

describe("invalid inputs", () => {
    test("missing type", async () => {
        const res = await search(undefined, "one piece", 1)
        expect(res.status).toBe(400)
    })
    test("missing query", async () => {
        const res = await search("movies", undefined, 1)
        expect(res.status).toBe(400)
    })
    test("missing page", async () => {
        const res = await search("movies", "one piece")
        expect(res.status).toBe(400)
    })
    test("blank query", async () => {
        const res = await search("movies", "", 1)
        expect(res.status).toBe(400)
    })
    test("invalid page less than 1", async () => {
        const res = await search("movies", "one piece", 0)
        expect(res.status).toBe(400)
    })
    test("invalid page string", async () => {
        const res = await search("movies", "one piece", "one")
        expect(res.status).toBe(400)
    })
    test("invalid type", async () => {
        const res = await search("films", "one piece", 1)
        expect(res.status).toBe(400)
    })
})