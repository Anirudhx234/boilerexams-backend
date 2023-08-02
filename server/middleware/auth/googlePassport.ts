import { PrismaClient, AccountType } from '@prisma/client'
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
        callbackURL: `${process.env.API_URL}/auth/google/redirect`,
        scope: [ 'profile', 'email' ],
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    accountType: AccountType.GOOGLE,
                    accountId: profile.id
                }
            })

            let profilePicture: string;
            if (profile?.photos[0]?.value) {
                profilePicture = profile.photos[0].value
            }
            else {
                profilePicture = "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg"
            }

            if (!user) {
                const newUser = await prisma.user.create({
                    data: {
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        profilePicture: profilePicture,
                        accountType: AccountType.GOOGLE,
                        accountId: profile.id
                    }
                })
                done(null, newUser)
            }
            else {
                await prisma.user.updateMany({
                    where: {
                        accountType: AccountType.GOOGLE,
                        accountId: profile.id
                    },
                    data: {
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        profilePicture: profilePicture
                    }
                })
                done(null, user)
            }
        } catch (error) {
            done(error, null)
        }
    })
)