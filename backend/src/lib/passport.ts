import passport from "passport"
import { Strategy } from "passport-local"
import { prisma } from "./prisma.ts"
import bcrypt from "bcryptjs"

passport.use(new Strategy(async (username, password, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { username }})
        if (!user)
            return done(null, false, { message: "user doesn't exist" })
        const match = await bcrypt.compare(password, user.password)
        if (!match)
            return done(null, false, { message: "incorrect password" })
        return done(null, user)
    }
    catch(e) {
        return done(e)
    }
}))


passport.serializeUser((user, done) => {
    process.nextTick(() => {
        return done(null, user.id)
    })
})

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({where: {id}})
    done(null, user);
  } catch(err) {
    done(err);
  }
});

export default passport