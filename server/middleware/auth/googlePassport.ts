import { PrismaClient } from '@prisma/client'
import passport from 'passport'
import { Strategy } from 'passport-google-oauth20'

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
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:8080/auth/google/redirect',
        scope: [ 'profile', 'email' ],
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    googleId: profile.id
                }
            })

            if (!user) {
                const newUser = await prisma.user.create({
                    data: {
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value
                    }
                })
                done(null, newUser)
            }
            else {
                await prisma.user.update({
                    where: {
                        googleId: profile.id
                    },
                    data: {
                        name: profile.displayName,
                        email: profile.emails[0].value
                    }
                })
                done(null, user)
            }
        } catch (error) {
            done(error, null)
        }
    })
)