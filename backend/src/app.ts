import express from "express"
import v1 from "./v1/entryPoint.ts"

process.loadEnvFile()

const app = express()

app.use("/v1", v1)

if (process.env.NODE_ENV != "test") {
    app.listen(process.env.PORT, () => {
        console.log("listening to port " + process.env.PORT)
    })
}

export default app