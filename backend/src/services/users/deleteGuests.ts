import { prisma } from "../../lib/prisma.ts"
import deleteAccount from "./deleteAccount.ts"

// todo: turn this into a cron job
// oxlint-disable-next-line no-unused-vars
async function deleteGuests() {
    const guestIds = (await prisma.user.findMany({
        where: {
            isGuest: true,
            dateCreated: {
                lte: new Date(Date.now()-86400000) // minus 24hrs
            }
        },
        select: {id: true}
    })).map(g => g.id)
    await Promise.all(guestIds.map(id => deleteAccount(id)))
}