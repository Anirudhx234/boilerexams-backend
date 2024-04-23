import APIError from "../errors/APIError.js";
import { AccountType, Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { randomBytes } from "crypto";
import { URL } from "url";
import { z } from "zod";
import hashString from "../../utils/hashString.js";
import passport from "passport";
import prisma from "../../prisma/prisma.js";
import resetPasswordTemplate from "../../utils/emailTemplates/resetPassword.js";
import sendEmail from "../../utils/sendMail.js";

export const LocalSignupOptions = z.object({
    name: z.string(),
    email: z.string().email({ message: "Invalid email" }),
    password: z
        .string()
        .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
            message: `Password must contain at least 8 characters consisting of at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character`,
        }),
});

export const CreateLocalOptions = LocalSignupOptions.extend({
    role: z.nativeEnum(Role).default(Role.USER),
    courses: z.array(z.string().uuid()).optional()
});

export const ChangePasswordOptions = z.object({
    id: z.string(),
    d: z.string(),
    h: z.string(),
    newPassword: z.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
        message: `Password must contain at least 8 characters consisting of at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character`,
    }),
});

const base64Encode = (data: string) => {
    const buffer = Buffer.from(data);
    return buffer.toString("base64");
};

const base64Decode = (data: string) => {
    const buffer = Buffer.from(data, "base64");
    return buffer.toString("ascii");
};

const redirectUrl = (req: Request) => {
    const urlString = req.headers.referer;
    let baseUrl: string;
    if (urlString) {
        const parsedUrl = new URL(urlString);
        baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
    } else {
        baseUrl = "/";
    }

    return Buffer.from(JSON.stringify({ redirect: baseUrl })).toString("base64");
};

export async function discordLogin(req: Request, res: Response, next: NextFunction) {
    const state = redirectUrl(req);
    const authenticator = passport.authenticate("discord", { state });
    authenticator(req, res, next);
}

export async function googleLogin(req: Request, res: Response, next: NextFunction) {
    const state = redirectUrl(req);
    const authenticator = passport.authenticate("google", { state });
    authenticator(req, res, next);
}

export async function createLocalAccount(req: Request, res: Response) {
    const { name, email, password, role, courses } = CreateLocalOptions.parse(req.body);

    const salt = randomBytes(16);
    const hashedPassword = await hashString(password, salt);

    const newUser = await prisma.user.create({
        data: {
            name: name,
            email: email,
            role: role,
            profilePicture: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg",
            accountType: AccountType.LOCAL,
            localAccount: {
                create: {
                    password: hashedPassword,
                    salt: salt,
                },
            },
            courses: {
                connect: courses?.map(courseId => {
                    return {
                        id: courseId
                    };
                })
            }
        },
    });

    res.status(200).send(newUser);
}

export async function localSignup(req: Request, res: Response){
    const { name, email, password } = LocalSignupOptions.parse(req.body);

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
                    salt: salt,
                },
            },
        },
    });

    res.status(200).send(newUser);
}

export async function localLogin(req: Request, res: Response, next: NextFunction) {
    const authenticator = passport.authenticate("local", {
        successReturnToOrRedirect: "/auth/test",
        failureRedirect: "/auth/test",
        failureMessage: true,
    });
    authenticator(req, res, next);
}

export async function resetPassword(req: Request, res: Response) {
    const email = z.string().email({ message: "Invalid email" }).parse(req.body.email);

    const user = await prisma.user.findFirst({
        where: {
            email: email,
            accountType: AccountType.LOCAL,
        },
        include: {
            localAccount: true,
        },
    });
    if (!user || !user.localAccount) {
        throw new APIError("User not found", 404);
    }

    const today = new Date().toISOString();
    const date = base64Encode(today);
    const userId = base64Encode(user.id);
    const data = {
        userId: user.id,
        date: today,
        // lastLogin: user.lastLoginDate.toISOString(),
        salt: user.localAccount.salt,
    };
    const hash = await hashString(JSON.stringify(data), Buffer.from(process.env["SESSION_SECRET"] ?? "", "hex"));

    const resetLink = `${process.env["API_URL"]}/auth/change-password/?id=${userId}&d=${date}&h=${hash.toString("hex")}`;

    const options = {
        to: email,
        subject: "Reset Password",
        html: resetPasswordTemplate(resetLink),
    };
    await sendEmail(options);

    res.status(200).send({ resetLink: resetLink });
}

export async function changePassword(req: Request, res: Response) {
    const { id, d, h, newPassword } = ChangePasswordOptions.parse({ ...req.query, ...req.body });

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
            accountType: AccountType.LOCAL,
        },
        include: {
            localAccount: true,
        },
    });
    if (!user || !user.localAccount) {
        throw new APIError("User not found", 404);
    }

    const data = {
        userId: user.id,
        date: date,
        // lastLogin: user.lastLoginDate.toISOString(),
        salt: user.localAccount.salt,
    };
    const hash = await hashString(JSON.stringify(data), Buffer.from(process.env["SESSION_SECRET"] ?? "", "hex"));

    if (hash.toString("hex") !== h) {
        throw new APIError("Invalid reset link", 400);
    }

    const salt = randomBytes(16);
    const hashedPassword = await hashString(newPassword, salt);

    await prisma.localAccount.update({
        where: {
            userId: userId,
        },
        data: {
            password: hashedPassword,
            salt: salt,
        },
    });

    res.status(200).send({ message: "Password changed successfully" });
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    req.logOut((error: unknown) => {
        if (error) {
            next(error);
        }
        const url = redirectUrl(req);
        const { redirect } = JSON.parse(Buffer.from(url, "base64").toString());
        return res.json({ redirectUrl: redirect });
    });
}