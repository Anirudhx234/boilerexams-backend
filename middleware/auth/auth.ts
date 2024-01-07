import express from 'express';
import { Request, Response } from "express";
import passport from 'passport';
import authTester from './authTester.js';
import asyncWrapper from '../wrappers/asyncWrapper.js';
import {
    signup,
    localLogin,
    discordLogin,
    googleLogin,
    resetPassword,
    changePassword,
    logout
} from "./authController.js"

const app = express();

const redirect = (req: Request, res: Response) => {
    try {
        const { state } = req.query;
        // @ts-expect-error state
        const { redirect } = JSON.parse(Buffer.from(state, 'base64').toString());
        return res.redirect(redirect);
    } catch {
        return res.redirect("https://boilerexams.com");
    }
};

app.post("/signup", asyncWrapper(signup));

app.post('/login', localLogin);

app.get('/discord/login', discordLogin);

app.get("/google/login", googleLogin);

app.get('/discord/redirect', passport.authenticate('discord'), redirect);

app.get("/google/redirect", passport.authenticate('google'), redirect);

app.post('/reset-password', asyncWrapper(resetPassword));

app.get('/change-password', asyncWrapper(changePassword));

app.get('/logout', authTester, logout);

app.get("/test", authTester, (req: Request, res: Response) => {
    return res.status(200).send("Successfully authenticated");
});

export default app;