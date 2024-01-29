import express from "express";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import {
    getCourseExamsStats,
    getCourseStats,
    getCourseStatsAll,
    getExamStats,
    getGeneralStats,
    getQuestionStats,
    getSubmissionStats,
} from "../controllers/statsController.js";
import cache from "../cache/caching.js";

const router = express.Router();

router.get("/", cache(600), asyncWrapper(getGeneralStats));

router.get("/courses/all", cache(600), asyncWrapper(getCourseStatsAll));

//app.get("/courses/:courseId/after/:after/before/:before", cache(600), asyncWrapper(getCourseStats));

//app.get("/courses/:courseId/after/:after/", cache(600), asyncWrapper(getCourseStats));

router.get("/courses/:courseId", cache(600), asyncWrapper(getCourseStats));

router.get("/courses/:courseId/exams/all", cache(600), asyncWrapper(getCourseExamsStats));

router.get("/exams/:examId", cache(600), asyncWrapper(getExamStats));

router.get("/questions/:questionId", cache(600), asyncWrapper(getQuestionStats));

router.get("/submissions", cache(600), asyncWrapper(getSubmissionStats));

export default router;
