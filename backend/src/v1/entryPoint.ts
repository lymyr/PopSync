import { Router } from "express";
import userRouter from "./routes/userRouter.ts";
import connectionRouter from "./routes/connectionsRouter.ts";

const v1 = Router()

v1.use("/users", userRouter)
v1.use("/connections", connectionRouter)

export default v1