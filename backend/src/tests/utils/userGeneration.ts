import request  from "supertest";
import app from "../../app.ts";
import { prisma } from "../../lib/prisma.ts";
import type { User } from "../../../generated/prisma/client.ts";
import type TestAgent from "supertest/lib/agent.js";
import type { UserCreateManyInput } from "../../../generated/prisma/models.ts";

export interface TestUser {
    agent: InstanceType<typeof TestAgent>
    details: User
}

export async function testUserGen(userAmount: number = 2, customUsername?: string): Promise<TestUser[]> {
    async function authAndGetDetails(agent: InstanceType<typeof TestAgent>, payload: {username: string; password: string; confirmPassword: string;}) {
        await agent.post("/v1/users").send(payload)
        const [, user] = await Promise.all([
            agent.post("/v1/users/authenticate").send(payload),
            prisma.user.findUnique({where: { username: payload.username }})
        ])
        return user
    }
    type AgentsArr = InstanceType<typeof TestAgent>[]
    const agents: AgentsArr = []
    const tasks = []
    for (let i = 0; i < userAmount; i++) {
        const payload = {
            username: i == 0 && customUsername ? customUsername : `user${i}`,
            password: "alksdn123",
            confirmPassword: "alksdn123"
        }
        const agent = request.agent(app)
        
        agents.push(agent)
        tasks.push(authAndGetDetails(agent, payload))
    }
    const details = await Promise.all(tasks)
    
    const returnValue = details.map((detail, i) => {
        return {
            details: detail,
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