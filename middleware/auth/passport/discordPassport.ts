import prisma from "../../../libs/prisma.js";
import { AccountType, type User } from "@prisma/client";
import { Strategy } from "passport-discord";

const discordPassport = (passport) => {
    passport.serializeUser((user: User, done: any) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done: any) => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: id,
                },
            });
            if (!user) {
                throw new Error("User not found");
            }
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

    passport.use(
        new Strategy(
            {
                clientID: process.env["DISCORD_CLIENT_ID"],
                clientSecret: process.env["DISCORD_CLIENT_SECRET"],
                callbackURL: `${process.env["API_URL"]}/auth/discord/redirect`,
                scope: ["identify", "email"],
            },
            async (accessToken: string, refreshToken: string, profile: any, done: any) => {
                try {
                    const user = await prisma.user.findFirst({
                        where: {
                            accountType: AccountType.DISCORD,
                            accountId: profile.id,
                        },
                    });

                    let profilePicture: string;
                    if (profile.avatar) {
                        profilePicture = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}`;
                    } else {
                        profilePicture = "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg";
                    }

                    if (!user) {
                        const newUser = await prisma.user.create({
                            data: {
                                name: profile.username,
                                email: profile.email,
                                profilePicture: profilePicture,
                                accountType: AccountType.DISCORD,
                                accountId: profile.id,
                            },
                        });
                        done(null, newUser);
                    } else {
                        await prisma.user.updateMany({
                            where: {
                                accountType: AccountType.DISCORD,
                                accountId: profile.id,
                            },
                            data: {
                                name: profile.username,
                                email: profile.email,
                                profilePicture: profilePicture,
                            },
                        });
                        done(null, user);
                    }
                } catch (error) {
                    done(error, null);
                }
            },
        ),
    );
};

export default discordPassport;
