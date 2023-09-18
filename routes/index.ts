import auth from '../middleware/auth/auth.js'
import authHandler from '../middleware/auth/authHandler.js'
import courses from "./courses.js"
import exams from "./exams.js"
import express from 'express'
import feedback from "./feedback"
import feedbackLimiter from "../middleware/rateLimiting/feedbackLimiter.js"
import generalLimiter from"../middleware/rateLimiting/generalLimiter.js"
import globalLimiter from '../middleware/rateLimiting/globalLimiter.js'
import id_routes from "./id_routes.js"
import name_routes from "./name_routes.js"
import parsing from "./parsing.js"
import questions from "./questions.js"
import resources from "./resources.js"
import stats from "./stats.js"
import topics from "./topics.js"
import users from "./users.js"

const app = express();

// Global rate limit for all routes
app.use(globalLimiter);

// Standard user routes (has stricter rate limit)
app.use("/auth", generalLimiter, auth);

app.use("/stats", generalLimiter, stats);

app.use(name_routes);

app.use("/feedback", feedbackLimiter, feedback);

// Content routes (uses global rate limit)
app.use(questions);

app.use("/users", users);

app.use(authHandler);

app.use("/id", id_routes);

app.use("/resources", resources);

app.use(parsing);

app.use(courses);

app.use(exams);

app.use(topics);

export default app