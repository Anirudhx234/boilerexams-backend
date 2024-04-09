import express from "express";
import { generalStats, getAllSubmissionTimeStats, getCourseStats, getCourseSubmissionTimeStats, getExamStats, getQuestionStats } from "../controllers/statsController.js";
import asyncWrapper from "../middleware/wrappers/asyncWrapper.js";
import cache from "../middleware/cache/caching.js";

const router = express.Router();

const minute = 60;

// ToDo Fix All

router.get("/", cache(10 * minute), asyncWrapper(generalStats));

router.get("/courses", cache(10 * minute), asyncWrapper(getCourseStats));

router.get("/courses/:c", cache(10 * minute), asyncWrapper(getCourseStats));

router.get("/courses/:c/exams/:e", cache(10 * minute), asyncWrapper(getExamStats));

router.get("/exams", cache(10 * minute), asyncWrapper(getExamStats));

router.get("/exams/:e", cache(10 * minute), asyncWrapper(getExamStats));

router.get("/questions", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/questions/:q", cache(10 * minute), asyncWrapper(getQuestionStats));

router.get("/submissions/time", cache(10 * minute), asyncWrapper(getAllSubmissionTimeStats));

router.get("/submissions/time/:c", cache(10 * minute), asyncWrapper(getCourseSubmissionTimeStats));

export default router;
