import type { Request, Response } from "express"
import { prisma } from "../../lib/prisma.ts"
import bcrypt from "bcryptjs"
import type { Register } from "../../middleware/validation/UserValidation.ts"
import type { SearchQuery } from "../../middleware/validation/SearchQueryValidation.ts"
import { matchedData } from "express-validator"
import type { Connection, Prisma, User } from "../../../generated/prisma/client.ts"
import deleteAccountService from "../../services/users/deleteAccount.ts"
import getGravatar from "../../utils/getGravatar.ts"

export async function getUsers(req: Request<{}, {}, {}, SearchQuery>, res: Response) {
    const query = matchedData<SearchQuery>(req)
    const currentUser = req.user as NonNullable<typeof req.user>
    let opts: Prisma.UserFindManyArgs = {
        take: 10,
        select: {
            id: true, 
            username: true,
            pfpPath: true,
            isGuest: true,
        },
        where: { 
            AND: [
                { 
                    username: {
                        contains: query.username,
                        mode: "insensitive"
                    } 
                },
                {
                    NOT: {
                        username: currentUser.username
                    }
                }
            ]
               
        },
        orderBy: {
            id: "asc"
        }
    }
    if (query.lastId) {
        opts = {
            ...opts,
            cursor: { id: query.lastId },
            skip: 1
        }
    }
    const users = await prisma.user.findMany(opts)
    res.json({
        data: users
    })
}

interface UserDetails extends Omit<User, "password" | "dateCreated"> {
    connection: Connection
}
export async function getUserDetails(req: Request<{userId: number}>, res:Response) {
    const data = await prisma.$queryRaw<UserDetails[]>`
        SELECT 
            u.id,
            u.username,
            u.pfp_path AS "pfpPath",
            u.description,
            u.is_guest AS "isGuest",
            CASE 
                WHEN c.sender_id IS NOT NULL THEN
                    JSONB_BUILD_OBJECT(
                        'senderId', c.sender_id,
                        'receiverId', c.receiver_id,
                        'status', c.status,
                        'dateAdded', c.date_added,
                        'dateUpdated', c.date_updated
                    ) 
                ELSE null
            END AS connection

        FROM "user" AS u
        LEFT JOIN connection AS c ON 
            (c.sender_id = ${req.params.userId} AND c.receiver_id = ${req.user?.id}) OR
            (c.sender_id = ${req.user?.id} AND c.receiver_id = ${req.params.userId})
        WHERE u.id = ${req.params.userId}
        GROUP BY u.id, c.sender_id, c.receiver_id
    `
    res.json({ data: data[0] })
}

export async function register(req:Request<{}, {}, Register>, res:Response) {
    const hashed = await bcrypt.hash(req.body.password, 10)
    await prisma.user.create({
        data: {
            username: req.body.username,
            password: hashed,
            pfpPath: getGravatar(req.body.username),
    }})
    res.sendStatus(201)
}

export async function login(req:Request, res:Response) {
    if (req.user) {
        // oxlint-disable-next-line no-unused-vars
        const {password, ...data} = req.user
        return res.send({data})
    }
    else 
        throw new Error("req.user is undefined")
}

export async function logout(req:Request, res:Response) {
    req.logOut((err) => {
        if (err)
            throw new Error(err)
        res.sendStatus(200)
    })
}

export async function createGuest(req: Request, res: Response) {
    const guest = await prisma.user.create({data: { 
        password: "guest",
        isGuest: true
    }})
    
    req.logIn(guest, (err) => {
        if (err)
            return res.status(500).send(err)
        res.sendStatus(201)
    })
}

export async function deleteAccount(req:Request, res:Response) {
    await deleteAccountService(req.user?.id as number)
    res.sendStatus(200)
}