import { describe, test, expect, afterAll, beforeAll, vi, beforeEach } from "vitest";
import { prisma } from "../../../lib/prisma.ts";
import request from "supertest"
import app from "../../../app.ts";
import { testUserGen, type TestUser } from "../../utils/userGeneration.ts";
import generateMockId from "../../utils/generateMockId.ts";
import tmdb from "../../../lib/tmdb.ts";
import TmdbMockPayloads from "../../mocks/TmdbMockPayloads.ts";
import type { Response } from "supertest";

describe("search users", async () => {
    let loggedUser: TestUser;

    beforeAll(async () => {
        loggedUser = (await testUserGen(1, "kakarot"))[0] as TestUser
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
        await Promise.all([prisma.user.deleteMany(), prisma.session.deleteMany()])
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

describe("account deletion", () => {
    let undeletedUser: TestUser
    let undeletedReview: Response
    beforeAll(async () => {
        undeletedUser = (await testUserGen(1, "undeleted"))[0] as TestUser
        vi.spyOn(Object.getPrototypeOf(tmdb.movies), "details").mockResolvedValue(TmdbMockPayloads.movieDetails)
        await undeletedUser.agent.get(`/v1/media/movies?id=${TmdbMockPayloads.movieDetails.id}`)
        await undeletedUser.agent.post(`/v1/users/${undeletedUser.details.id}/watchlist/movies`)
            .send({
                id: TmdbMockPayloads.movieDetails.id,
                hasWatched: true,
                rating: "7"
            })
        undeletedReview = await undeletedUser.agent.post(`/v1/reviews`).send({
            movieId: TmdbMockPayloads.movieDetails.id,
            seriesId: null,
            content: "undeleted review",
            rating: "7",
            isPublic: true
        })
        await undeletedUser.agent.post(`/v1/reviews/${undeletedReview.body.data.id}/likes`)
        await undeletedUser.agent.post(`/v1/reviews/${undeletedReview.body.data.id}/comments`)
            .send({content: "hello"})
    })

    afterAll(async () => {
        await prisma.$transaction([
            prisma.review.deleteMany(),
            prisma.watchListMovie.deleteMany(),
            prisma.movie.deleteMany()
        ])
        await Promise.all([
            prisma.user.deleteMany(), 
            prisma.session.deleteMany(),
            prisma.series.deleteMany()
        ])
    })

    let user: TestUser
    beforeEach(async () => {
        user = (await testUserGen(1))[0] as TestUser
    })

    test("success", async () => {
        await user.agent.delete(`/v1/users`)
        const prismaUser = await prisma.user.findFirst({ where: {id: user.details.id }})
        expect(prismaUser).toBeNull()
    })

    test("unauth deletes", async () => {
        const res = await request(app).delete(`/v1/users`)
        expect(res.status).toBe(401)
        await prisma.user.delete({where: {id: user.details.id }})
    })

    test("deletes like and decrements likeCount", async () => {
        const likeRes = await user.agent.post(`/v1/reviews/${undeletedReview.body.data.id}/likes`)
        expect(likeRes.status).toBe(201)
        await user.agent.delete(`/v1/users`)
        const updatedReview = await prisma.review.findFirst({where: {id: undeletedReview.body.data.id}})
        expect(updatedReview?.likeCount).toBe(1)
    })

    test("soft deletes comment if it has replies and deletes if no reply, decrements commentCount", async () => {
        const commentsRes = await Promise.all([
            user.agent.post(`/v1/reviews/${undeletedReview.body.data.id}/comments`)
                .send({content: "good review"}),
            user.agent.post(`/v1/reviews/${undeletedReview.body.data.id}/comments`)
                .send({content: "no reply"}),
        ])
        await undeletedUser.agent.post(`/v1/reviews/${undeletedReview.body.data.id}/comments/${commentsRes[0].body.data.id}`)
            .send({content: "thanks"})
        
        await user.agent.delete(`/v1/users`)
        const updatedReview = await prisma.review.findFirst({where: {id: undeletedReview.body.data.id}, include: {comments: true}})
        expect(updatedReview?.commentCount).toBe(2)
        expect(updatedReview?.comments.length).toBe(3)

        await Promise.all([
            prisma.comment.deleteMany(),
            prisma.review.update({ 
                where: {id: undeletedReview.body.data.id },
                data: { commentCount: 0}
            }),
        ])
    })
})


test.todo("edit profile with image upload, image file size, accept only image, profile description")