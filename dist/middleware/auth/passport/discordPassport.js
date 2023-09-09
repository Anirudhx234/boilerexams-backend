var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prisma from "../../../libs/prisma.js";
import { AccountType } from '@prisma/client';
import { Strategy } from 'passport-discord';
const discordPassport = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield prisma.user.findUnique({
                where: {
                    id: id
                }
            });
            if (!user) {
                throw new Error("User not found");
            }
            done(null, user);
        }
        catch (error) {
            done(error, null);
        }
    }));
    passport.use(new Strategy({
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL}/auth/discord/redirect`,
        scope: ['identify', 'email']
    }, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield prisma.user.findFirst({
                where: {
                    accountType: AccountType.DISCORD,
                    accountId: profile.id
                }
            });
            let profilePicture;
            if (profile.avatar) {
                profilePicture = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}`;
            }
            else {
                profilePicture = "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg";
            }
            if (!user) {
                const newUser = yield prisma.user.create({
                    data: {
                        name: profile.username,
                        email: profile.email,
                        profilePicture: profilePicture,
                        accountType: AccountType.DISCORD,
                        accountId: profile.id
                    }
                });
                done(null, newUser);
            }
            else {
                yield prisma.user.updateMany({
                    where: {
                        accountType: AccountType.DISCORD,
                        accountId: profile.id
                    },
                    data: {
                        name: profile.username,
                        email: profile.email,
                        profilePicture: profilePicture
                    }
                });
                done(null, user);
            }
        }
        catch (error) {
            done(error, null);
        }
    })));
};
export default discordPassport;
//# sourceMappingURL=discordPassport.js.map