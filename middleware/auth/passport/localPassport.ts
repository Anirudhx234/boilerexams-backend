import prisma from "../../../libs/prisma.js";
import { AccountType, User } from "@prisma/client";
import { Strategy } from "passport-local";
import { timingSafeEqual } from "crypto";
import { APIError } from "../../errors/index.js";
import hashString from "../../../utils/hashString.js";

const localPassport = (passport) => {
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
                usernameField: "email",
            },
            async (username: string, password: string, done: any) => {
                try {
                    const user = await prisma.user.findFirst({
                        where: {
                            email: username,
                            accountType: AccountType.LOCAL,
                        },
                        include: {
                            localAccount: true,
                        },
                    });
                    if (!user || !user.localAccount) {
                        throw new APIError("Incorrect email or password", 400);
                    }

                    const hashedPassword = await hashString(password, user.localAccount.salt);
                    if (!timingSafeEqual(user.localAccount.password, hashedPassword)) {
                        throw new APIError("Incorrect email or password", 400);
                    }

                    return done(null, user);
                } catch (error) {
                    done(error, null);
                }
            },
        ),
    );
};

export default localPassport;
