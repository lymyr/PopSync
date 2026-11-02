import app from "../../../app.ts";
import { afterEach, expect, test, vi, describe, beforeAll, afterAll } from "vitest"
import request from "supertest"
import { prisma } from "../../../lib/prisma.ts";
process.loadEnvFile()

afterAll(async () => {
    await prisma.session.deleteMany()
})

describe("register", () => {
    const prismaUserCreateListener = vi.spyOn(prisma.user, "create")
    const registerReq = (username: string, password: string, confirmPassword: string) => {
        return request(app)
            .post("/v1/users")
            .send({ username, password, confirmPassword })
    }

    afterEach(async () => {
        await prisma.user.deleteMany()
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

    beforeAll(async () => {
        await request(app)
            .post("/v1/users")
            .send({
                username: "pirate.king",
                password: "asdfgh123456",
                confirmPassword: "asdfgh123456"
            })
    })

    afterAll(async () => {
        await prisma.user.deleteMany()
    })

    test("correct credentials", async () => {
        const res = await loginRequest("pirate.king", "asdfgh123456")

        expect(res.status).toBe(200)
    })

    test("incorrect username", async () => {
        const res = await loginRequest("pirate.kingg", "asdfgh123456")
        console.log(res.body)
        expect(res.status).toBe(401)
    })

    test("incorrect password", async () => {
        const res = await loginRequest("pirate.king", "zasdfgh123456")

        expect(res.status).toBe(401)
    })
})