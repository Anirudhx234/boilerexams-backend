import auth from "../middleware/auth/auth.js";
import authHandler from "../middleware/auth/authHandler.js";
import analytics from "./analytics.js";
import courses from "./courses.js";
import exams from "./exams.js";
import events from "./events.js";
import express from "express";
import feedback from "./feedback.js";
import feedbackLimiter from "../middleware/rateLimiting/feedbackLimiter.js";
import generalLimiter from "../middleware/rateLimiting/generalLimiter.js";
import globalLimiter from "../middleware/rateLimiting/globalLimiter.js";
import id_routes from "./id_routes.js";
import name_routes from "./name_routes.js";
import parsing from "./parsing.js";
import questions from "./questions.js";
import resources from "./resources.js";
import stats from "./stats.js";
import topics from "./topics.js";
import users from "./users.js";

const router = express.Router();

// Global rate limit for all routes
router.use(globalLimiter);

// Standard user routes (has stricter rate limit)
router.use("/auth", generalLimiter, auth);

router.use("/stats", generalLimiter, stats);

router.use("/analytics", generalLimiter, analytics);

router.use(name_routes);

router.use("/feedback", feedbackLimiter, feedback);

// Content routes (uses global rate limit)
router.use(questions);

router.use("/users", users);

//router.use(authHandler);

router.use("/id", id_routes);

router.use("/events", events);

router.use("/resources", resources);

router.use(parsing);

router.use(courses);

router.use(exams);

router.use(topics);

export default router;
