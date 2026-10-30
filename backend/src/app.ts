import express from "express"
import v1 from "./v1/entryPoint.ts"
import session from "express-session"
import { PrismaSessionStore } from "@quixo3/prisma-session-store"
import { prisma } from "./lib/prisma.ts"
import passport from "./lib/passport.ts"

process.loadEnvFile()

if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET env variable not found")
}

const app = express()
app.use(express.json())
app.use(session({
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000
    },
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(
        prisma,
        {
            // guarantees a clean up despite render free tier limits
            checkPeriod: 13 * 60 * 1000, 
            dbRecordIdIsSessionId: true,
        }
    )
}))
app.use(passport.session())

app.use("/v1", v1)

if (process.env.NODE_ENV != "test") {
    app.listen(process.env.PORT, () => {
        console.log("listening to port " + process.env.PORT)
    })
}

export default app