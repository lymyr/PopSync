import request  from "supertest";
import app from "../../app.ts";
import { prisma } from "../../lib/prisma.ts";
import type { User } from "../../../generated/prisma/client.ts";
import type TestAgent from "supertest/lib/agent.js";
import type { UserCreateManyInput } from "../../../generated/prisma/models.ts";
import { vi } from "vitest";
import bcrypt from "bcryptjs";

export interface TestUser {
    agent: InstanceType<typeof TestAgent>
    details: User
}

export async function testUserGen(userAmount: number = 2, customUsername?: string): Promise<TestUser[]> {
    vi.spyOn(bcrypt, "hash").mockImplementation(() => new Promise((res) => res("password-mock")))
    vi.spyOn(bcrypt, "compare").mockImplementation(() => new Promise((res) => res(true)))

    type AgentsArr = InstanceType<typeof TestAgent>[]
    const agents: AgentsArr = []
    const createUserPayloads = []
    for (let i = 0; i < userAmount; i++) {
        const payload = {
            id: i,
            username: i == 0 && customUsername ? customUsername : `user${i}`,
            password: "alksdn123",
            pfpPath: "/path"
        }

        const agent = request.agent(app)
        agents.push(agent)
        createUserPayloads.push(payload)
    }
    const users = await prisma.user.createManyAndReturn({data: createUserPayloads})
    await Promise.all(agents.map((agent, i) => agent.post(`/v1/users/authenticate`).send({
        username: users[i]?.username,
        password: "lolsdjnf32849"
    })))
    const returnValue = users.map((details, i) => {
        return {
            details,
            agent: agents[i]
        }
    })
    return returnValue as TestUser[]
}

export async function randomUserGen(userAmount: number = 5) {
    const userPayload: UserCreateManyInput[] = []
    for (let i = 0; i < userAmount; i++) {
        userPayload.push({
            username: `randomUser${i}`,
            password: "aslkdn123453",
            pfpPath: "askdn",
        })
    }
    const users = await prisma.user.createManyAndReturn({
        data: userPayload
    })
    return users
}