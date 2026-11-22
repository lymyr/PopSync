import app from "../../../app.ts";
import { afterEach, expect, test, vi, describe, beforeEach } from "vitest"
import request from "supertest"
import { prisma } from "../../../lib/prisma.ts";
import bcrypt from "bcryptjs";
process.loadEnvFile()

afterEach(async () => {
    await Promise.all([prisma.session.deleteMany(), prisma.user.deleteMany()])
})

describe("register", () => {
    const prismaUserCreateListener = vi.spyOn(prisma.user, "create")
    const registerReq = (username: string, password: string, confirmPassword: string) => {
        return request(app)
            .post("/v1/users")
            .send({ username, password, confirmPassword })
    }

    afterEach(async () => {
        prismaUserCreateListener.mockClear()
    })

    test("accepts accepts '-', '_', numbers, and letters", async () => {
        const res = await registerReq(
                "test4_Case-yeah.123", 
                "passWord676767", 
                "passWord676767")

        expect(res.status).toBe(201)
        expect(prismaUserCreateListener).toHaveBeenCalledOnce()
    })

    describe("fail", () => {
        test("empty username", async () => {
            const res = await registerReq(
                    "",
                    "passWord676767",
                    "passWord676767")

            expect(res.status).toBe(400)
            expect(prismaUserCreateListener).toHaveBeenCalledTimes(0)
        })

        test("username contains spaces", async () => {
            const res = await Promise.all([
                registerReq(
                    "  awd",
                    "passWord676767",
                    "passWord676767"),
                registerReq(
                    "test case",
                    "passWord676767",
                    "passWord676767")
            ])

            expect(res[0].status).toBe(400)
            expect(res[1].status).toBe(400)
            expect(prismaUserCreateListener).toHaveBeenCalledTimes(0)
        })

        test("empty password", async () => {
            const res = await registerReq(
                    "testCase",
                    "",
                    "")
                
            expect(res.status).toBe(400)
            expect(prismaUserCreateListener).toHaveBeenCalledTimes(0)
        })

        test("password does not match", async () => {
            const res = await registerReq(
                    "testCase",
                    "passWord676767",
                    "passWord6767678")

            expect(res.status).toBe(400)
            expect(prismaUserCreateListener).toHaveBeenCalledTimes(0)
        })

        test("username already taken", async () => {
            await registerReq(
                    "testCase",
                    "passWord676767",
                    "passWord676767")

            const res = await registerReq(
                    "testCase",
                    "awdadfhsh43265",
                    "awdadfhsh43265")

            expect(res.status).toBe(400)
            expect(prismaUserCreateListener).toHaveBeenCalledTimes(1)
        })

        test("starts with . or - or _", async () => {
            const requests = [
                "_testCase",
                ".testCase",
                "-testCase",
            ].map((uname) => {
                return registerReq(
                        uname,
                        "awdadfhsh43265",
                        "awdadfhsh43265")
            })

            await Promise.all(requests)
            expect(prismaUserCreateListener).toHaveBeenCalledTimes(0)
        })

        test("ends with . or - or _", async () => {
            const requests = [
                "testCase_",
                "testCase.",
                "testCase-",
            ].map((uname) => {
                return registerReq(
                        uname,
                        "awdadfhsh43265",
                        "awdadfhsh43265")
            })

            await Promise.all(requests)
            expect(prismaUserCreateListener).toHaveBeenCalledTimes(0)
        })

        test("consecutive . or - or _", async () => {
            const requests = [
                "testC..ase",
                "te--stC.ase",
                "testC.-ase",
                "te_.stCase",
                "testCas-_e",
                "t__estCase",
            ].map((uname) => {
                return registerReq(
                        uname,
                        "awdadfhsh43265",
                        "awdadfhsh43265")
            })

            await Promise.all(requests)
            expect(prismaUserCreateListener).toHaveBeenCalledTimes(0)
        })
    })
})


describe("login", () => {
    const loginRequest = (username: string, password: string) => {
        return request(app)
            .post("/v1/users/authenticate")
            .send({ username, password })
    }

    beforeEach(async () => {
        await request(app)
            .post("/v1/users")
            .send({
                username: "pirate.king",
                password: "asdfgh123456",
                confirmPassword: "asdfgh123456"
            })
    })

    test("correct credentials", async () => {
        const res = await loginRequest("pirate.king", "asdfgh123456")
        expect(res.status).toBe(200)
    })

    test("incorrect username", async () => {
        const res = await loginRequest("pirate.kingg", "asdfgh123456")
        expect(res.status).toBe(401)
    })

    test("incorrect password", async () => {
        const res = await loginRequest("pirate.king", "zasdfgh123456")
        expect(res.status).toBe(401)
    })
})

describe("guest", () => {
    test("reject usernames starting with 'guest-'", async () => {
        const register = async (username: string) => 
            request(app).post("/v1/users").send({
                username, 
                password: "asldn123%$#", 
                confirmPassword: "asldn123%$#"
        })
        const res = await Promise.all([
            register("guest-"),
            register("Guest-"),
            register("guesT-"),
            register("guest")
        ])
        res.forEach((r,i) => {
            if (i != res.length-1)
                expect(r.status).toBe(400)
            else
                expect(r.status).toBe(201)
        })
        await prisma.user.delete({where: {username: "guest"}})
    })


    test("create authenticated guest", async () => {
        const res = await request(app).post("/v1/users/guests")
        expect(res.status).toBe(201)

        const [newUser, newSesh] = await Promise.all([
            prisma.user.findFirst({where: {isGuest: true}}),
            prisma.session.findFirst()
        ])
        expect(newUser).not.toBeNull()
        expect(newSesh).not.toBeNull()
    })
})

test("log out", async () => {
    const user = await prisma.user.create({data: {password: "123"}})
    const agent = request.agent(app)
    const compareHashMock = vi.spyOn(bcrypt, "compare").mockImplementation(() => new Promise((res) => res(true)))
    await agent.post("/v1/users/authenticate").send({username: user.username, password: "sdflk"})
    const res = await agent.delete("/v1/users/authenticate")
    expect(res.status).toBe(200)
    const authTestRes = await agent.get("/v1/users")
    expect(authTestRes.status).toBe(401)
    compareHashMock.mockRestore()
    await prisma.user.delete({where: {id: user.id}})
})