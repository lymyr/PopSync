import { afterAll, beforeAll, describe, expect, test, afterEach, beforeEach } from "vitest";
import { prisma } from "../../../lib/prisma.ts";
import type { ConnectionStatus } from "../../../../generated/prisma/client.ts";
import type { TestUser } from "../../utils/userGeneration.ts";
import { testUserGen, randomUserGen } from "../../utils/userGeneration.ts";

let users: Awaited<ReturnType<typeof testUserGen>>
let user1: TestUser;
let user2: TestUser;
let randomUsers: Awaited<ReturnType<typeof randomUserGen>>;
beforeAll(async () => {
    [users, randomUsers] = await Promise.all([testUserGen(2), randomUserGen(3)])
    if (users[0] && users[1]) {
        user1 = users[0]
        user2 = users[1]
    }
    else {
        throw new Error("Error concerning testUserGen. pls check")
    }
})

afterAll(async () => { 
    await prisma.connection.deleteMany()
    await Promise.all([prisma.user.deleteMany(), prisma.session.deleteMany()])
})

type handleConnectionType = "add" | "remove" | "accept"
async function handleConnection(user: TestUser, receivingUser: TestUser | string | number | undefined | null, type: handleConnectionType) {
    let id = !receivingUser || typeof receivingUser == "number" || typeof receivingUser == "string" ? receivingUser : receivingUser.details.id
    switch(type) {
        case "add":
            return user.agent.post(`/v1/connections/${id}`)
        case "accept":
            return user.agent.put(`/v1/connections/${id}`)
        case "remove":
            return user.agent.delete(`/v1/connections/${id}`)
        default: 
            throw new Error("Invalid type")
    }
}

describe("adding connections", () => {
    afterEach(async () => {
        await prisma.connection.deleteMany()
    })

    test("requests another user as connection", async () => {
        const res = await handleConnection(user1, user2, "add")
        const user = await prisma.user.findUnique({ where: {id: user1.details.id}, include: { sentConnection: true }})
        
        const expectedStatus: ConnectionStatus = "pending"
        expect(res.status).toBe(201)
        expect(user?.sentConnection[0]?.senderId).toBe(user1.details.id)
        expect(user?.sentConnection[0]?.receiverId).toBe(user2.details.id)
        expect(user?.sentConnection[0]?.status).toBe(expectedStatus)   
    })

    test("sender accepting on behalf of receiver", async () => {
        await handleConnection(user1, user2, "add")
        await handleConnection(user1, user2, "accept")
        const user = await prisma.user.findUnique({ where: {id: user1.details.id}, include: { sentConnection: true }})

        const expectedStatus: ConnectionStatus = "pending"
        expect(user?.sentConnection[0]?.senderId).toBe(user1.details.id)
        expect(user?.sentConnection[0]?.receiverId).toBe(user2.details.id)
        expect(user?.sentConnection[0]?.status).toBe(expectedStatus)
    })

    test("user adding 'id' that doesn't exist", async () => {
        // paranoid lmao
        let schizoId = -1;
        do {
            schizoId += 1
        } while (schizoId == user2.details.id && schizoId == user1.details.id)

        const res = await handleConnection(user1, schizoId, "accept")
        expect(res.status).toBe(404)
    })

    test("invalid id format", async () => {
        const res = await handleConnection(user1, "invalidStringId", "add")
        expect(res.status).toBe(400)
    })

    test("adding yourself as connection", async () => {
        const res = await handleConnection(user1, user1, "add")
        expect(res.status).toBe(400)
    })

    test("adding user twice", async () => {
        await handleConnection(user1, user2, "add")
        const res = await handleConnection(user1, user2, "add")
        // seems a bit redundant to add custom checks when database handles it pretty well
        // ill accept error 500s here for now. dunno the industry standards tbh
        expect(res.status).not.toBeOneOf([200, 201]) 
    })
})

describe("updating/accepting connections", () => {
    test("accept a connection request", async () => {
        await handleConnection(user1, user2, "add")
        const res = await handleConnection(user2, user1, "accept")
        const user = await prisma.user.findUnique({ where: {id: user1.details.id}, include: { sentConnection: true }})

        const expectedStatus: ConnectionStatus = "accepted"
        expect(res.status).toBe(200)
        expect(user?.sentConnection[0]?.senderId).toBe(user1.details.id)
        expect(user?.sentConnection[0]?.receiverId).toBe(user2.details.id)
        expect(user?.sentConnection[0]?.status).toBe(expectedStatus)
    })

    test("user with 'id' doesn't exist", async () => {
        // paranoid lmao
        let schizoId = -1;
        do {
            schizoId += 1
        } while (schizoId == user2.details.id && schizoId == user1.details.id)

        const res = await handleConnection(user1, schizoId, "accept")
        expect(res.status).toBe(404)
    })
})


describe("read and delete connections", () => {
    beforeEach(async () => {
        const tasks = []
        for (let i = 0; i < randomUsers.length; i++) {
            tasks.push(handleConnection(user1, randomUsers[i]?.id, "add"))
        }
        await Promise.all([...tasks, handleConnection(user1, user2, "add")])
    })

    test("returns all accepted connections", async () => {
        const [res, res2] = await Promise.all([user1.agent.get("/v1/connections"), user2.agent.get("/v1/connections")])
        const connectionOfClient = res.body.data.connections[0].receiver.id == user2.details.id ? res.body.data.connections[0].receiver : res.body.data.connections[0].sender
        const connectionOfClient2 = res.body.data.connections[0].receiver.id == user1.details.id ? res.body.data.connections[0].receiver : res.body.data.connections[0].sender
        expect(res.body.data.connections.length).toBe(1)
        expect(res2.body.data.connections.length).toBe(1)
        expect(connectionOfClient.id).toBe(user2.details.id)
        expect(connectionOfClient2.id).toBe(user1.details.id)
    })

    test("remove connection", async () => {
        const allConnections = await prisma.connection.findMany({ where: { 
            OR: [ 
                {receiverId: user1.details.id },
                {senderId: user1.details.id },
            ] 
        }})
        const res = await Promise.all([
            handleConnection(user1, user2, "remove"),
            handleConnection(user1, randomUsers[0]?.id, "remove")
        ])
        const allConnectionsAfterRemove = await prisma.connection.count({ where: { 
            OR: [ 
                {receiverId: user1.details.id },
                {senderId: user1.details.id },
            ] 
        }})
        expect(allConnections.length - res.length).toBe(allConnectionsAfterRemove)
    })
})
