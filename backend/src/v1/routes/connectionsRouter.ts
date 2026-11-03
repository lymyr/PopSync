import { Router } from "express";
import { acceptConnection, addConnection, deleteConnection, getAcceptedConnections } from "../controllers/connectionController.ts";
import isAuth from "../../middleware/auth/isAuth.ts";
import ConnectionValidation from "../../middleware/validation/ConnectionValidation.ts";
import { throwerHelper } from "../../middleware/validation/Validation.ts";

const connectionRouter = Router()
connectionRouter.use(isAuth)

connectionRouter.get("/",
    getAcceptedConnections
)

connectionRouter.post("/:id", 
    ConnectionValidation.userIdExists,
    throwerHelper,
    addConnection
)

connectionRouter.put("/:id",
    ConnectionValidation.userIdExists,
    throwerHelper,
    acceptConnection
)

connectionRouter.delete("/:id",
    ConnectionValidation.userIdExists,
    throwerHelper,
    deleteConnection
)

export default connectionRouter