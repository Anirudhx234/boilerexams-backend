import prisma from '../../libs/prisma.js';
import { NextFunction, Request, Response } from "express";
import passport from 'passport';
import { URL } from 'url';
import { randomBytes } from "crypto";
import { APIError, NotFoundError } from '../errors/index.js';
import { AccountType } from '@prisma/client';
import hashString from '../../utils/hashString.js';
import sendEmail from '../../utils/sendMail.js';
import resetPasswordTemplate from '../../utils/emailTemplates/resetPassword.js';

const redirectUrl = (req: Request) => {
    const urlString = req.headers.referer;
    let baseUrl: string;
    if (urlString) {
        const parsedUrl = new URL(urlString);
        baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
    }
    else {
        baseUrl = "/";
    }

    return Buffer.from(JSON.stringify({ redirect: baseUrl })).toString('base64');
};

const base64Encode = (data: string) => {
    const buffer = Buffer.from(data);
    return buffer.toString('base64');
};

const base64Decode = (data: string) => {
    const buffer = Buffer.from(data, 'base64');
    return buffer.toString('ascii');
};

const signup = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new APIError("Name, email, or password missing", 400);
    }

    const salt = randomBytes(16);
    const hashedPassword = await hashString(password, salt);

    const newUser = await prisma.user.create({
        data: {
            name: name,
            email: email,
            profilePicture: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg",
            accountType: AccountType.LOCAL,
            localAccount: {
                create: {
                    password: hashedPassword,
                    salt: salt
                }
            }
        }
    });

    res.status(200).send(newUser);
};

const localLogin = (req: Request, res: Response, next: NextFunction) => {
    const authenticator = passport.authenticate('local', {
        successReturnToOrRedirect: '/auth/test',
        failureRedirect: '/auth/test',
        failureMessage: true
    });
    authenticator(req, res, next);
}

const discordLogin = (req: Request, res: Response, next: NextFunction) => {
    const state = redirectUrl(req);
    const authenticator = passport.authenticate('discord', { state });
    authenticator(req, res, next);
}

const googleLogin = (req: Request, res: Response, next: NextFunction) => {
    const state = redirectUrl(req);
    const authenticator = passport.authenticate('google', { state });
    authenticator(req, res, next);
}

const resetPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await prisma.user.findFirst({
        where: {
            email: email,
            accountType: AccountType.LOCAL
        },
        include: {
            localAccount: true
        }
    });
    if (!user || !user.localAccount) {
        throw new NotFoundError("User not found");
    }

    const today = new Date().toISOString();
    const date = base64Encode(today);
    const userId = base64Encode(user.id);
    const data = {
        userId: user.id,
        date: today,
        // lastLogin: user.lastLoginDate.toISOString(),
        salt: user.localAccount.salt
    };
    const hash = await hashString(JSON.stringify(data), Buffer.from("lol", 'hex'));

    const resetLink = `${process.env.API_URL}/auth/password-change/?id=${userId}&d=${date}&h=${hash.toString('hex')}`;

    const options = {
        from: process.env.EMAIL_ADDRESS || "",
        to: email,
        subject: "Reset Password",
        html: resetPasswordTemplate(resetLink)
    };
    sendEmail(options);

    res.status(200).send({ resetLink: resetLink });
};

const changePassword = async (req, res) => {
    const { id, d, h } = req.query;
    const { newPassword } = req.body;

    if (!id || !d || !h || typeof (id) != "string" || typeof (d) != "string" || typeof (h) != "string") {
        throw new APIError("Invalid reset link", 400);
    }

    // Check if the link in not out of date
    const date = base64Decode(d);
    // const then = moment(today); 
    // const now = moment().utc(); 
    // const timeSince = now.diff(then, 'hours');
    // if(timeSince > 2) {
    //     writeLog("ERROR", req.url + " - The link is invalid. Err -1");
    //     res.status(500).send( { error: "The link is invalid.", errnum: -1 } );
    //     return;
    // }

    const userId = base64Decode(id);

    const user = await prisma.user.findFirst({
        where: {
            id: userId,
            accountType: AccountType.LOCAL
        },
        include: {
            localAccount: true
        }
    });
    if (!user || !user.localAccount) {
        throw new NotFoundError("User not found");
    }

    const data = {
        userId: user.id,
        date: date,
        // lastLogin: user.lastLoginDate.toISOString(),
        salt: user.localAccount.salt
    };
    const hash = await hashString(JSON.stringify(data), Buffer.from("lol", 'hex'));

    if (hash.toString('hex') !== h) {
        throw new APIError("Invalid reset link", 400);
    }

    const salt = randomBytes(16);
    const hashedPassword = await hashString(newPassword, salt);

    await prisma.localAccount.update({
        where: {
            userId: userId
        },
        data: {
            password: hashedPassword,
            salt: salt
        }
    });

    res.status(200).send("Password changed");
};

const logout = (req: Request, res: Response, next: NextFunction) => {
    // Will extend req later
    // @ts-expect-error error typing
    req.logOut((error: any) => {
        if (error) {
            next(error);
        }
        const url = redirectUrl(req);
        const { redirect } = JSON.parse(Buffer.from(url, 'base64').toString());
        return res.json({ redirectUrl: redirect });
    });
}

export {
    signup,
    localLogin,
    discordLogin,
    googleLogin,
    resetPassword,
    changePassword,
    logout
};