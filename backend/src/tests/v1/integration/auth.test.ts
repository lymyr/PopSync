import app from "../../../app.ts";
import {afterAll, expect, test} from "vitest"
import request from "supertest"
import { describe } from "node:test";


// describe("register", () => {
    
// })


describe("describe test", () => {
    test("test integration", async () => {
        const res = await request(app)
            .get("/v1/users")
        
        expect(res.text).toBe("hello")
    })
})