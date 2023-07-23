import express from 'express'
import passport from 'passport'
import authorizedHandler from './authorizedHandler'

const app = express()

app.get('/auth/discord/login', passport.authenticate('discord'))

app.get('/auth/google/login', passport.authenticate('google'))

app.get('/auth/discord/redirect', passport.authenticate('discord', {failureRedirect: '/'}), (req, res) => {
    res.status(200).send("Authenticated")
})

app.get('/auth/google/redirect', passport.authenticate('google', {failureRedirect: '/'}), (req, res) => {
    res.status(200).send("Authenticated")
})

app.get("/auth/test", authorizedHandler, (req, res) => {
    return res.status(200).send("Success")
})

export default app