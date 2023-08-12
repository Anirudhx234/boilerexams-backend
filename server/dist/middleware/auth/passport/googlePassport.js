var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PrismaClient, AccountType } from '@prisma/client';
import { Strategy } from 'passport-google-oauth20';
const prisma = new PrismaClient();
const googlePassport = (passport) => {
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
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL}/auth/google/redirect`,
        scope: ['profile', 'email'],
    }, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user = yield prisma.user.findFirst({
                where: {
                    accountType: AccountType.GOOGLE,
                    accountId: profile.id
                }
            });
            let profilePicture;
            if ((_a = profile === null || profile === void 0 ? void 0 : profile.photos[0]) === null || _a === void 0 ? void 0 : _a.value) {
                profilePicture = profile.photos[0].value;
            }
            else {
                profilePicture = "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg";
            }
            if (!user) {
                const newUser = yield prisma.user.create({
                    data: {
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        profilePicture: profilePicture,
                        accountType: AccountType.GOOGLE,
                        accountId: profile.id
                    }
                });
                done(null, newUser);
            }
            else {
                yield prisma.user.updateMany({
                    where: {
                        accountType: AccountType.GOOGLE,
                        accountId: profile.id
                    },
                    data: {
                        name: profile.displayName,
                        email: profile.emails[0].value,
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
export default googlePassport;
//# sourceMappingURL=googlePassport.js.map