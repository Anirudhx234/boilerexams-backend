import express from "express";
import { Request, Response } from "express";
import passport from "passport";
import authTester from "../middleware/auth/authTester.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import {
    localSignup,
    localLogin,
    discordLogin,
    googleLogin,
    resetPassword,
    changePassword,
    logout,
    createLocalAccount
} from "../middleware/auth/authController.js";
import authHandler from "../middleware/auth/authHandler.js";
import { Role } from "@prisma/client";

const router = express.Router();

const redirect = (req: Request, res: Response) => {
    try {
        const state = req.query.state as string;
        const { redirect } = JSON.parse(Buffer.from(state, "base64").toString());
        return res.redirect(redirect);
    } catch {
        return res.redirect("https://boilerexams.com");
    }
};

router.get("/discord/login", discordLogin);

router.get("/google/login", googleLogin);

router.get("/discord/redirect", passport.authenticate("discord"), redirect);

router.get("/google/redirect", passport.authenticate("google"), redirect);

router.post("/create", authHandler(Role.ADMIN), asyncWrapper(createLocalAccount));

router.post("/signup", asyncWrapper(localSignup));

router.post("/login", localLogin);

router.post("/reset-password", asyncWrapper(resetPassword));

router.get("/change-password", asyncWrapper(changePassword));

router.get("/logout", authTester, logout);

router.get("/test", authTester, (req: Request, res: Response) => {
    return res.status(200).send("Successfully authenticated");
});

export default router;
