import express from 'express'

import authHandler from '../middleware/auth/authHandler.js'

import generalLimiter from"../middleware/rateLimiting/generalLimiter.js"
import webhookLimiter from '../middleware/rateLimiting/webhookLimiter.js'
import contentLimiter from '../middleware/rateLimiting/contentLimiter.js'

import auth from '../middleware/auth/auth.js'
import name_routes from "./name_routes.js"
import parsing from "./parsing.js"
import courses from "./courses.js"
import exams from "./exams.js"
import questions from "./questions.js"
import resources from "./resources.js"
import topics from "./topics.js"
import users from "./users.js"
import webhooks from "./webhooks.js"
import stats from "./stats.js"
import id_routes from "./id_routes.js"

const app = express();

app.use("/auth", generalLimiter, auth);

app.use("/stats", generalLimiter, stats);

app.use(generalLimiter, name_routes);

app.use("/webhooks", webhookLimiter, webhooks);

app.use("/id", authHandler, contentLimiter, id_routes);

app.use("/resources", authHandler, contentLimiter, resources);

app.use("/users", contentLimiter, users);

app.use(authHandler, contentLimiter, parsing);

app.use(authHandler, contentLimiter, courses);

app.use(authHandler, contentLimiter, exams);
 
app.use(contentLimiter, questions);

app.use(authHandler, contentLimiter, topics);

export default app