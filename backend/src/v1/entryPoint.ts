import { Router } from "express";
import userRouter from "./routes/userRouter.ts";
import connectionRouter from "./routes/connectionsRouter.ts";
import mediaRouter from "./routes/mediaRouter.ts";
import reviewRouter from "./routes/reviewRouter.ts";

const v1 = Router()

v1.use("/users", userRouter)
v1.use("/connections", connectionRouter)
v1.use("/media", mediaRouter)
v1.use("/reviews", reviewRouter)

export default v1