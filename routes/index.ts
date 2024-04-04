import express from "express";
import auth from "../middleware/auth/auth.js";
import courses from "./courses.js";
import exams from "./exams.js";
import events from "./events.js";
import feedback from "./feedback.js";
import parsing from "./parsing.js";
import questions from "./questions.js";
import resources from "./resources.js";
import stats from "./stats.js";
import topics from "./topics.js";
import users from "./users.js";
import feedbackLimiter from "../middleware/rateLimiting/feedbackLimiter.js";
import generalLimiter from "../middleware/rateLimiting/generalLimiter.js";
import globalLimiter from "../middleware/rateLimiting/globalLimiter.js";

const router = express.Router();

// Global rate limit for all routes
router.use(globalLimiter);

// Standard user routes (has stricter rate limit)
router.use("/auth", generalLimiter, auth);

router.use("/stats", generalLimiter, stats);

router.use("/feedback", feedbackLimiter, feedback);

// Content routes (uses global rate limit)
router.use("/questions", questions);

router.use("/users", users);

router.use("/events", events);

router.use("/resources", resources);

router.use("/parser", parsing);

router.use("/courses", courses);

router.use("/exams", exams);

router.use("/topics", topics);

export default router;
