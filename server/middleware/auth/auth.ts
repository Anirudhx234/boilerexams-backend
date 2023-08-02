import express from 'express'
import passport from 'passport'
import { URL } from 'url'
import authTester from './authTester'

const app = express()

const redirectUrl = (req) => {
    const urlString = req.headers.referer;
    let baseUrl: string;
    if (urlString) {
        const parsedUrl = new URL(urlString);
        baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
    }
    else {
        baseUrl = "/"
    }

    return Buffer.from(JSON.stringify({ redirect: baseUrl })).toString('base64')
}

const redirect = (req, res) => {
    try {
        const { state } = req.query
        //@ts-ignore
        const { redirect } = JSON.parse(Buffer.from(state, 'base64').toString())
        return res.redirect(redirect)
    } catch {
        return res.redirect("https://boilerexams-frontend.vercel.app/")
    }
}

app.get('/auth/discord/login', (req, res, next) => {
    const state = redirectUrl(req)
    const authenticator = passport.authenticate('discord', { state })
    authenticator(req, res, next)
})

app.get('/auth/discord/redirect', passport.authenticate('discord'), redirect)

app.get("/auth/google/login", (req, res, next) => {
    const state = redirectUrl(req)
    const authenticator = passport.authenticate('google', { state })
    authenticator(req, res, next)
})

app.get("/auth/google/redirect", passport.authenticate('google'), redirect);

app.get('/auth/logout', authTester, (req, res, next) => {
    // Extend req later
    //@ts-ignore
    req.logOut(error => {
        if (error) {
            next(error)
        }
        const url = redirectUrl(req)
        const { redirect } = JSON.parse(Buffer.from(url, 'base64').toString())
        return res.json({ redirectUrl: redirect })
    })
})

app.get("/auth/test", authTester, (req, res) => {
    return res.status(200).send("Success")
})

export default app