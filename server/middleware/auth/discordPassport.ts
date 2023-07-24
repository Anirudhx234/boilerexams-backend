import { PrismaClient } from '@prisma/client'
import passport from 'passport'
import { Strategy } from 'passport-discord'

const prisma = new PrismaClient();

passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        })
        if (!user) {
            throw new Error("User not found")
        }
        done(null, user)
    } catch (error) {
        done(error, null)
    }
});

passport.use(
    new Strategy({
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL}/auth/discord/redirect`,
        scope: ['identify', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    discordId: profile.id
                }
            })

            if (!user) {
                const newUser = await prisma.user.create({
                    data: {
                        discordId: profile.id,
                        name: profile.username,
                        email: profile.email
                    }
                })
                done(null, newUser)
            }
            else {
                await prisma.user.update({
                    where: {
                        discordId: profile.id
                    },
                    data: {
                        name: profile.username,
                        email: profile.email
                    }
                })
                done(null, user)
            }
        } catch (error) {
            done(error, null)
        }
    })
)