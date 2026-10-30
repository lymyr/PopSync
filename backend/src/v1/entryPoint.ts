import { Router } from "express";
import userRouter from "./routes/userRouter.ts";

const v1 = Router()

v1.use("/users", userRouter)

export default v1